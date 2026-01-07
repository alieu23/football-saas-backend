import { Router } from "express";
import {
  createLoan,
  listLoans,
  recallLoan,
  completeLoan
} from "../controllers/loan.controller";
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
  createLoan
);

router.get(
  "/",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  listLoans
);

router.put(
  "/:id/recall",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  recallLoan
);

router.put(
  "/:id/complete",
  requireAuth,
  requireRole([UserRole.CLUB_ADMIN]),
  completeLoan
);

export default router;
