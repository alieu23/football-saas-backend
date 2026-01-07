import { Router } from "express";
import {
  createTransfer,
  listTransfers,
  completeTransfer
} from "../controllers/transfer.controller";
import {
  requireAuth,
  requireRole
} from "../middleware/auth.middleware";
import { UserRole } from "../models/User";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  createTransfer
);

router.get(
  "/",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  listTransfers
);

router.put(
  "/:id/complete",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  completeTransfer
);

export default router;
