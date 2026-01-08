import { Request, Response } from "express";
import { z } from "zod";
import { Club } from "../models/Club";
import { User, UserRole } from "../models/User";
import {uploadToS3} from "../utils/s3Uploads";
import { AuthRequest } from "../middleware/auth.middleware";

/* -----------------------
   Validation
----------------------- */

const createClubSchema = z.object({
  name: z.string().min(2),
  country: z.string().optional()
});


export async function uploadClubLogo(req: AuthRequest, res: Response) {
  if (!req.user || !req.user.clubId) {
    return res.status(400).json({message: "No club assigned to user"});
}
if(!req.file?.mimetype.startsWith("image/")) {
  return res.status(400).json({message: "Only image files are alllowed"})
}
const club =  await Club.findByPk(req.user.clubId);

if(!club){
  return res.status(404).json({message: "Club not found"});
}

const {key, url} = await uploadToS3(req.file, "clubs");

club.logoKey = key;
club.logoUrl = url;
await club.save();

res.json({message: "Club logo uploaded", logoUrl: url});
}

/* -----------------------
   CREATE CLUB (SUPER_ADMIN)
----------------------- */

export async function createClub(req: Request, res: Response) {
  const data = createClubSchema.parse(req.body);

  const club = await Club.create({
    name: data.name,
    country: data.country
  });

  res.status(201).json(club);
}

/* -----------------------
   LIST CLUBS (SUPER_ADMIN)
----------------------- */

export async function listClubs(_req: Request, res: Response) {
  const clubs = await Club.findAll({
    order: [["createdAt", "DESC"]]
  });

  res.json(clubs);
}

/* -----------------------
   ASSIGN CLUB ADMIN
----------------------- */

export async function assignClubAdmin(req: Request, res: Response) {
  const { userId, clubId } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const club = await Club.findByPk(clubId);
  if (!club) {
    return res.status(404).json({ message: "Club not found" });
  }

  user.role = UserRole.CLUB_ADMIN;
  user.clubId = club.id;
  await user.save();

  res.json({
    message: "User assigned as club admin",
    userId: user.id,
    clubId: club.id
  });
}




/* -----------------------
   GET CLUB ADMINS (SUPER_ADMIN)
----------------------- */

export async function getClubAdmins(req: Request, res: Response) {
  const clubId = req.query.clubId as string;
  const admins = await User.findAll({
    where: {
      clubId: clubId,
      role: UserRole.CLUB_ADMIN
    }
  });

  res.json(admins);
};

/* -----------------------
   GET MY CLUB (CLUB_ADMIN)
----------------------- */

export async function getMyClub(req: AuthRequest, res: Response) {
  if (!req.user?.clubId) {
    return res.status(404).json({ message: "User not assigned to a club" });
  }

  const club = await Club.findByPk(req.user.clubId, {
    include: ["teams", "players"]
  });

  res.json(club);
}