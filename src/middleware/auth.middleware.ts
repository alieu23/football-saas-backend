import { Request, Response, NextFunction } from "express";
import{ verifyToken } from "../utils/jwt";
import { UserRole } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: UserRole;
    clubId?: number | null;
  };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export const requireRole =
  (roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
