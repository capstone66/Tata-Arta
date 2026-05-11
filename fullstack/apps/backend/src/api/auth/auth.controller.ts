import type { Request, Response } from "express";
import { AuthService } from "./auth.service.ts";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const [data, err] = await AuthService.login(res.locals.dto);

    if (err || !data) {
      return res.status(401).json({
        status: "error",
        message: err?.message || "Login gagal",
      });
    }

    res.cookie("token", data.token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.status(200).json({
      status: "success",
      message: "Login berhasil",
      user: data.user,
    });
  },

  logout: async (req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({
      status: "success",
      message: "Logout berhasil",
    });
  },

  register: async (req: Request, res: Response) => {
    const [data, err] = await AuthService.register(res.locals.dto);

    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }

    return res.status(201).json({
      status: "success",
      data,
    });
  },

  registerChild: async (req: Request, res: Response) => {
    const parentId = (req as any).user?.id;
    if (!parentId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: Parent ID tidak ditemukan dalam token",
      });
    }
    const [data, err] = await AuthService.registerChild(
      res.locals.dto,
      parentId,
    );

    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }

    return res.status(201).json({
      status: "success",
      data,
    });
  },
};
