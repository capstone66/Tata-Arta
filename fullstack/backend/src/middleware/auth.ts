import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";

function getJwtSecret(): string {
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️  JWT_SECRET tidak diatur di .env. Gunakan variabel lingkungan JWT_SECRET.");
  }
  return process.env.JWT_SECRET;
}

export interface AuthRequest extends Request {
  userId?: number;
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}
