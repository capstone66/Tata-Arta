import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.status(201).json({ message: "Registrasi berhasil", ...result });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ message: "Login berhasil", ...result });
  },

  async profile(req: AuthRequest, res: Response) {
    const user = await authService.getProfile(req.userId!);
    res.json({ user });
  },
};
