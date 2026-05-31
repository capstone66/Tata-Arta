import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async summary(req: AuthRequest, res: Response) {
    const data = await dashboardService.getSummary(req.userId!);
    res.json(data);
  },

  async monthly(req: AuthRequest, res: Response) {
    const data = await dashboardService.getMonthly(req.userId!);
    res.json(data);
  },

  async stats(req: AuthRequest, res: Response) {
    const data = await dashboardService.getStats(req.userId!);
    res.json(data);
  },
};
