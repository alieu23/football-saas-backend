import { Response } from "express";
import {z} from "zod";
import { Player } from "../models/Player";
import {Team} from "../models/Team";
import  {uploadToS3} from  "../utils/s3Uploads"
import { AuthRequest } from "../middleware/auth.middleware";

/* -----------------------
   Validation
----------------------- */
const createPlayerSchema = z.object({
    name: z.string().min(2),
    position: z.string().optional(),
    jerseyNo: z.number().int().positive().optional(),
    teamId: z.number().optional()
});

/* -----------------------
   CREATE PLAYER
----------------------- */
export const createPlayer = async (req: AuthRequest, res: Response) => {
    // Ensure user has a club assigned
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }
    // check if player already exists in the club
    const data = createPlayerSchema.parse(req.body);

    if(data.teamId) {
        const team = await Team.findOne({
            where: {
                id: data.teamId,
                clubId: req.user.clubId,
            },
        });

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
    }

    const existingPlayer = await Player.findOne({
        where: {
            name: data.name,
            clubId: req.user.clubId,
        },
    });

    if (existingPlayer) {
        return res.status(409).json({ message: "Player with same name already exists in the club" });
    }

    const player = await Player.create({
        name: data.name,
        position: data.position,
        jerseyNo: data.jerseyNo,
        teamId: data.teamId ?? null,
        clubId: req.user.clubId,
    });

    res.status(201).json({ player, message: "Player created successfully" });
}
;

export async function uploadPlayerPhoto(req: AuthRequest, res: Response) {
  if (!req.user?.clubId || !req.file) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Only image files allowed" });
  }

  const player = await Player.findOne({
    where: {
      id: Number(req.params.id),
      clubId: req.user.clubId
    }
  });

  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  const { key, url } = await uploadToS3(req.file, "players");

  player.profilePhotoKey = key;
  player.profilePhotoUrl = url;
  await player.save();

  res.json({
    message: "Player photo uploaded",
    photoUrl: url
  });
}
/* -----------------------
   LIST PLAYERS
----------------------- */
export const listPlayers = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const players = await Player.findAll({
        where: { clubId: req.user.clubId },
        include: ["Team"],
        order: [["createdAt", "DESC"]],
    });

    res.json(players);
};
/* -----------------------
   GET PLAYER DETAILS
----------------------- */
export const getPlayer = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }    

    const player = await Player.findOne({
        where: {
            id: Number(req.params.id),
            clubId: req.user.clubId
        },
        include: ["Team"]
    });
    if (!player) {
        return res.status(404).json({ message: "Player not found" });
    }

    res.json(player);   
};

/* -----------------------
   ASSIGN PLAYER TO TEAM
----------------------- */
export const assignPlayerToTeam = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }
    const { teamId } = req.body;

    const player = await Player.findOne({
        where: {
            id: Number(req.params.id),
            clubId: req.user.clubId
        }
    });
    if (!player) {
        return res.status(404).json({ message: "Player not found" });
    }

    const team = await Team.findOne({
        where: {
            id: teamId,
            clubId: req.user.clubId,
        },
    });

    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    player.teamId = team.id;
    await player.save();

    res.json({ message: "Player assigned to team successfully" });
}

/* -----------------------
   REMOVE PLAYER
----------------------- */
export async function removePlayerFromTeam(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(403).json({ message: "No club assigned" });
  }

  const player = await Player.findOne({
    where: {
      id: Number(req.params.id),
      clubId: req.user.clubId
    }
  });

  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }

  player.teamId = null!;
  await player.save();

  res.json({ message: "Player removed from team", player });
}