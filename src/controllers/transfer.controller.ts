import { Response } from "express";
import { z } from "zod";
import { Player } from "../models/Player";
import {
  PlayerTransfer,
  TransferStatus,
  TransferType
} from "../models/PlayerTransfer";
import { PlayerContract, ContractStatus } from "../models/PlayerContract";
import { AuthRequest } from "../middleware/auth.middleware";

/* -----------------------
   Validation
----------------------- */

const createTransferSchema = z.object({
  playerId: z.number(),
  toClubId: z.number(),
  transferType: z.nativeEnum(TransferType),
  transferFee: z.number().optional(),
  currency: z.string().optional(),
  transferDate: z.string().datetime(),
  notes: z.string().optional()
});

/* -----------------------
   CREATE TRANSFER
----------------------- */

export async function createTransfer(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "No club assigned" });
  }

  const data = createTransferSchema.parse(req.body);

  // Player must belong to selling club
  const player = await Player.findOne({
    where: {
      id: data.playerId,
      clubId: req.user.clubId
    }
  });

  if (!player) {
    return res
      .status(404)
      .json({ message: "Player not found in your club" });
  }

  // Prevent transfer if active loan exists
  const activeLoan = await player.$get("loans", {
    where: { status: "ACTIVE" }
  });

  if (activeLoan.length > 0) {
    return res
      .status(400)
      .json({ message: "Cannot transfer a player on active loan" });
  }

  const transfer = await PlayerTransfer.create({
    playerId: player.id,
    fromClubId: req.user.clubId,
    toClubId: data.toClubId,
    transferType: data.transferType,
    transferFee: data.transferFee,
    currency: data.currency ?? "USD",
    status: TransferStatus.PENDING,
    transferDate: new Date(data.transferDate),
    notes: data.notes
  });

  res.status(201).json(transfer);
}

/* -----------------------
   LIST TRANSFERS (CLUB)
----------------------- */

export async function listTransfers(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "No club assigned" });
  }

  const transfers = await PlayerTransfer.findAll({
    where: {
      fromClubId: req.user.clubId
    },
    include: [Player],
    order: [["createdAt", "DESC"]]
  });

  res.json(transfers);
}

/* -----------------------
   COMPLETE TRANSFER
----------------------- */

export async function completeTransfer(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "No club assigned" });
  }

  const transfer = await PlayerTransfer.findOne({
    where: {
      id: Number(req.params.id),
      fromClubId: req.user.clubId,
      status: TransferStatus.PENDING
    }
  });

  if (!transfer) {
    return res.status(404).json({ message: "Pending transfer not found" });
  }

  const player = await Player.findByPk(transfer.playerId);
  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  // Terminate active contracts with selling club
  await PlayerContract.update(
    { status: ContractStatus.TERMINATED },
    {
      where: {
        playerId: player.id,
        clubId: transfer.fromClubId,
        status: ContractStatus.ACTIVE
      }
    }
  );

  // Move player permanently
  player.clubId = transfer.toClubId;
  player.teamId = null!; // new club decides team
  await player.save();

  transfer.status = TransferStatus.COMPLETED;
  await transfer.save();

  res.json({ message: "Transfer completed", transfer });
}
