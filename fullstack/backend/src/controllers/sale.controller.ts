import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { saleService } from "../services/sale.service";

export const saleController = {
  async list(req: AuthRequest, res: Response) {
    const result = await saleService.list(
      req.userId!,
      req.query as Record<string, string>,
    );
    res.json(result);
  },

  async getById(req: AuthRequest, res: Response) {
    const sale = await saleService.getById(
      req.userId!,
      Number(req.params.id),
    );
    res.json({ sale });
  },

  async create(req: AuthRequest, res: Response) {
    const sale = await saleService.create(req.userId!, req.body);
    res.status(201).json({ message: "Penjualan berhasil dicatat", sale });
  },

  async delete(req: AuthRequest, res: Response) {
    await saleService.delete(req.userId!, Number(req.params.id));
    res.json({ message: "Penjualan berhasil dihapus" });
  },
};
