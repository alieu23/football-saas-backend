import { Response } from "express";
import {z} from "zod";
import { Team } from "../models/Team";
import { AuthRequest } from "../middleware/auth.middleware";
import { numKeys } from "zod/v4/core/util";

/* -----------------------
   Validation
----------------------- */
const createTeamSchema = z.object({
    name: z.string().min(2),
    category: z.string().optional(),
});

/* -----------------------
   CREATE TEAM
----------------------- */
export const createTeam = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const data = createTeamSchema.parse(req.body);
    //check if team with same name exists in the club
    const existingTeam = await Team.findOne({
        where: {
            name: data.name,
            clubId: req.user.clubId,
        },
    });

    if (existingTeam) {
        return res.status(409).json({ message: "Team with same name already exists in the club" });
    }
    else {
    const team = await Team.create({
        name: data.name,
        category: data.category,
        clubId: req.user.clubId,
    });

    res.status(201).json({ team, message: "Team created successfully" });
    }
    
};

/* -----------------------
   LIST TEAMS
----------------------- */
export const listTeams = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const teams = await Team.findAll({
        where: { clubId: req.user.clubId },
        order: [["createdAt", "DESC"]],
    });

    res.json(teams);
};

/* -----------------------
   GET TEAM DETAILS
----------------------- */
export const getTeam = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const team = await Team.findOne({
        where:{
            id: Number(req.params.id),
            clubId: req.user.clubId

        },
        include: ["Player"]
    });
    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
};

/* -----------------------
   DELETE TEAM
----------------------- */
export const deleteTeam = async (req: AuthRequest, res: Response) => {
    if(!req.user || !req.user.clubId) {
        return res.status(403).json({ message: "No club assigned to user" });
    }

    const team = await Team.findByPk(req.params.id);
    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    await team.destroy();
    res.json({ message: "Team deleted successfully" });
}