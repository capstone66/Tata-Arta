import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";

export const authController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      res.status(201).json({ message: "Registrasi berhasil", ...result });
    } catch (error) {
      next(error); // Melempar error ke middleware Express global
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ message: "Login berhasil", ...result });
    } catch (error) {
      next(error); // Melempar error ke middleware Express global
    }
  },

  async profile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json({ user });
    } catch (error) {
      next(error); // Melempar error ke middleware Express global
    }
  },
};
