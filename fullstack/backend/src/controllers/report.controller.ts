import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { reportService } from "../services/report.service";

export const reportController = {
  async profitLoss(req: AuthRequest, res: Response) {
    const data = await reportService.getProfitLoss(
      req.userId!,
      req.query as Record<string, string>,
    );
    res.json(data);
  },

  async cashflow(req: AuthRequest, res: Response) {
    const data = await reportService.getCashflow(
      req.userId!,
      req.query as Record<string, string>,
    );
    res.json(data);
  },
};
