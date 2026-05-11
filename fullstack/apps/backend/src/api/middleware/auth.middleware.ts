import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type Role = "ADMIN" | "USER";
interface UserPayload {
  id: string;
  role: Role;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(403).json({
      status: "error",
      message: "Token tidak valid atau kadaluarsa",
    });
  }
};
