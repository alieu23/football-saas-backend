import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { User, UserRole } from "../models/User";
import { signToken } from "../utils/jwt";

/* -----------------------
   Validation Schemas
----------------------- */

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional(),
  clubId: z.number().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

/* -----------------------
   REGISTER
----------------------- */

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const existing = await User.findOne({
    where: { email: data.email.toLowerCase() }
  });

  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role ?? UserRole.STAFF,
    clubId: data.clubId ?? null
  });

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    clubId: user.clubId
  });
}

/* -----------------------
   LOGIN
----------------------- */

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({
    where: { email: data.email.toLowerCase() }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({
    userId: user.id,
    clubId: user.clubId,
    role: user.role
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clubId: user.clubId
    }
  });
}
