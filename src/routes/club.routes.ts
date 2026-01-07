import { Router } from "express";
import {
  createClub,
  listClubs,
  assignClubAdmin,
  getMyClub,
  uploadClubLogo
} from "../controllers/club.controller";
import {
  requireAuth,
  requireRole
} from "../middleware/auth.middleware";
import { UserRole } from "../models/User";
import { uploadMemory } from "../utils/upload";

const clubRoutes = Router();

/* SUPER ADMIN */
clubRoutes.post(
  "/",
  requireAuth,
  requireRole([UserRole.SUPER_ADMIN]),
  createClub
);

clubRoutes.get(
  "/",
  requireAuth,
  requireRole([UserRole.SUPER_ADMIN]),
  listClubs
);

clubRoutes.post(
  "/assign-admin",
  requireAuth,
  requireRole([UserRole.SUPER_ADMIN]),
  assignClubAdmin
);

/* CLUB ADMIN */
clubRoutes.get(
  "/me",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  getMyClub
);

clubRoutes.post(
  "/logo",
  requireAuth,
  requireRole([UserRole.SUPER_ADMIN]),
  uploadMemory.single("file"),
  uploadClubLogo
)

export default clubRoutes;
