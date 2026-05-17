import type { Request, Response } from "express";
import { AuthService } from "./auth.service.ts";

export const AuthController = {
  registerChild: async (req: Request, res: Response) => {
    try {
      const parentId = req.user?.id;
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
    } catch (e) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};
