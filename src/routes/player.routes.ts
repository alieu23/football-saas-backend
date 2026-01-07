import {Router} from "express";
import { uploadMemory } from "../utils/upload";
import {
    createPlayer,
    listPlayers,
    getPlayer,
    assignPlayerToTeam,
    removePlayerFromTeam,
    uploadPlayerPhoto
} from "../controllers/player.controller";
import {
    requireAuth,
    requireRole
} from "../middleware/auth.middleware";
import {UserRole} from "../models/User";

const playerRoutes = Router();

/* CLUB ADMIN */
playerRoutes.post(
    "/",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    createPlayer
);

playerRoutes.get(
    "/",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    listPlayers
);

playerRoutes.get(
    "/:id",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    getPlayer
);

playerRoutes.put(
    "/:id/assign-team",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    assignPlayerToTeam
);

playerRoutes.put(
    "/:id/remove-team",
    requireAuth,
    requireRole([UserRole.CLUB_ADMIN]),
    removePlayerFromTeam
);

playerRoutes.post(
  "/:id/photo",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  uploadMemory.single("file"),
  uploadPlayerPhoto
);


export default playerRoutes;