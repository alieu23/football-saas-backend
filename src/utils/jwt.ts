import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_EXPIRES_IN = "7d";

export function signToken(payload: {
  userId: number;
  clubId?: number | null;
  role: UserRole;
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: number;
    clubId?: number | null;
    role: UserRole;
  };
}
