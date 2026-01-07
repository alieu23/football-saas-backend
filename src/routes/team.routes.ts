import {Router} from "express";
import {
    createTeam,
    listTeams,
    getTeam,
    deleteTeam
} from "../controllers/team.controller";
import {
    requireAuth,
    requireRole
} from "../middleware/auth.middleware";
import {UserRole} from "../models/User";

const teamRoutes = Router();

/* CLUB ADMIN */
teamRoutes.post(
    "/",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    createTeam
);

teamRoutes.get(
    "/",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    listTeams
);

teamRoutes.get(
    "/:id",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    getTeam
);

teamRoutes.delete(
    "/:id",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    deleteTeam
);

export default teamRoutes;