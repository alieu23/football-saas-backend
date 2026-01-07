import { Response } from "express";
import { z } from "zod";
import { Op } from "sequelize";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import {
  PlayerLoan,
  LoanStatus
} from "../models/PlayerLoan";
import { AuthRequest } from "../middleware/auth.middleware";

/* -----------------------
   Validation
----------------------- */

const createLoanSchema = z.object({
  playerId: z.number(),
  toClubId: z.number(),
  toTeamId: z.number(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  recallable: z.boolean().optional(),
  notes: z.string().optional()
});

/* -----------------------
   Helpers
----------------------- */

function computeLoanStatus(start: Date, end: Date): LoanStatus {
  const now = new Date();
  if (now < start) return LoanStatus.UPCOMING;
  if (now >= start && now <= end) return LoanStatus.ACTIVE;
  return LoanStatus.COMPLETED;
}

/* -----------------------
   CREATE LOAN
----------------------- */

export async function createLoan(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "No club assigned" });
  }

  const data = createLoanSchema.parse(req.body);

  // Player must belong to loaning club
  const player = await Player.findOne({
    where: {
      id: data.playerId,
      clubId: req.user.clubId
    }
  });

  if (!player) {
    return res.status(404).json({ message: "Player not found in your club" });
  }

  // Ensure target team exists (receiving club)
  const targetTeam = await Team.findOne({
    where: {
      id: data.toTeamId,
      clubId: data.toClubId
    }
  });

  if (!targetTeam) {
    return res.status(400).json({ message: "Invalid target team" });
  }

  // Prevent overlapping active loans
  const activeLoan = await PlayerLoan.findOne({
    where: {
      playerId: player.id,
      status: LoanStatus.ACTIVE
    }
  });

  if (activeLoan) {
    return res.status(400).json({ message: "Player already on loan" });
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const loan = await PlayerLoan.create({
    playerId: player.id,
    fromClubId: req.user.clubId,
    toClubId: data.toClubId,
    fromTeamId: player.teamId ?? null,
    toTeamId: data.toTeamId,
    startDate,
    endDate,
    status: computeLoanStatus(startDate, endDate),
    recallable: data.recallable ?? false,
    notes: data.notes
  });

  // If loan is active, move player immediately
  if (loan.status === LoanStatus.ACTIVE) {
    player.clubId = data.toClubId;
    player.teamId = data.toTeamId;
    await player.save();
  }

  res.status(201).json(loan);
}

/* -----------------------
   LIST LOANS (CLUB)
----------------------- */

export async function listLoans(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "No club assigned" });
  }

  const loans = await PlayerLoan.findAll({
    where: {
      [Op.or]: [
        { fromClubId: req.user.clubId },
        { toClubId: req.user.clubId }
      ]
    },
    include: [Player],
    order: [["createdAt", "DESC"]]
  });

  res.json(loans);
}

/* -----------------------
   RECALL PLAYER
----------------------- */

export async function recallLoan(req: AuthRequest, res: Response) {
  const loan = await PlayerLoan.findOne({
    where: {
      id: Number(req.params.id),
      fromClubId: req.user?.clubId,
      status: LoanStatus.ACTIVE
    }
  });

  if (!loan) {
    return res.status(404).json({ message: "Active loan not found" });
  }

  if (!loan.recallable) {
    return res.status(400).json({ message: "Loan is not recallable" });
  }

  const player = await Player.findByPk(loan.playerId);
  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  // Return player to original club/team
  player.clubId = loan.fromClubId;
  player.teamId = loan.fromTeamId;
  await player.save();

  loan.status = LoanStatus.TERMINATED;
  await loan.save();

  res.json({ message: "Player recalled", loan });
}

/* -----------------------
   COMPLETE LOAN (END DATE)
----------------------- */

export async function completeLoan(req: AuthRequest, res: Response) {
  const loan = await PlayerLoan.findOne({
    where: {
      id: Number(req.params.id),
      fromClubId: req.user?.clubId
    }
  });

  if (!loan) {
    return res.status(404).json({ message: "Loan not found" });
  }

  const player = await Player.findByPk(loan.playerId);
  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  player.clubId = loan.fromClubId;
  player.teamId = loan.fromTeamId;
  await player.save();

  loan.status = LoanStatus.COMPLETED;
  await loan.save();

  res.json({ message: "Loan completed", loan });
}
