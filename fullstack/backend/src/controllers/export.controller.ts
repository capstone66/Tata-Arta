import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { exportService } from "../services/export.service";

export const exportController = {
  async transactionsCsv(req: AuthRequest, res: Response) {
    const csv = await exportService.transactionsCsv(req.userId!);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.csv",
    );
    res.send(csv);
  },

  async productsCsv(req: AuthRequest, res: Response) {
    const csv = await exportService.productsCsv(req.userId!);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=products.csv",
    );
    res.send(csv);
  },
};
