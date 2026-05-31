import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { budgetService } from "../services/budget.service";

export const budgetController = {
  async list(req: AuthRequest, res: Response) {
    const budgets = await budgetService.list(
      req.userId!,
      req.query as Record<string, string>,
    );
    res.json({ budgets });
  },

  async spending(req: AuthRequest, res: Response) {
    const { month, year } = req.query as Record<string, string>;
    const report = await budgetService.getSpendingReport(
      req.userId!,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
    res.json({ report });
  },

  async getById(req: AuthRequest, res: Response) {
    const budget = await budgetService.getById(
      req.userId!,
      Number(req.params.id),
    );
    res.json({ budget });
  },

  async create(req: AuthRequest, res: Response) {
    const result = await budgetService.create(req.userId!, req.body);
    if (result.updated) {
      res.json({ message: "Anggaran diperbarui", budget: result.budget });
    } else {
      res
        .status(201)
        .json({ message: "Anggaran berhasil dibuat", budget: result.budget });
    }
  },

  async update(req: AuthRequest, res: Response) {
    const budget = await budgetService.update(
      req.userId!,
      Number(req.params.id),
      req.body,
    );
    res.json({ message: "Anggaran diperbarui", budget });
  },

  async delete(req: AuthRequest, res: Response) {
    await budgetService.delete(req.userId!, Number(req.params.id));
    res.json({ message: "Anggaran berhasil dihapus" });
  },
};
