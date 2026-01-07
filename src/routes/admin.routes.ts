import {
    Router,
} from "express";
import { getDashboardStats } from "../controllers/admin.dashboard.controller";
import {   requireAuth,
  requireRole} from "../middleware/auth.middleware";
import { UserRole } from "../models/User";

const adminRoutes = Router();

adminRoutes.get("/dashboard",
    requireAuth,
    requireRole([UserRole.SUPER_ADMIN]),
    
    getDashboardStats);

export default adminRoutes;