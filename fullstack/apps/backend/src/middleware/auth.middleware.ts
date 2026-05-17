import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({
      status: "error",
      message: "Token tidak ditemukan atau tidak valid",
    });
  }

  // Cek isActive — field custom di User
  if (!session.user.isActive) {
    return res.status(403).json({
      status: "error",
      message: "Akun tidak aktif, silahkan hubungi pemilik usaha",
    });
  }

  req.user = {
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
  };

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: silahkan login terlebih dahulu",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: anda tidak memiliki izin untuk aksi ini",
      });
    }

    next();
  };
};
