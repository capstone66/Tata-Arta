import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { transactionService } from "../services/transaction.service";

export const transactionController = {
  async list(req: AuthRequest, res: Response) {
    const result = await transactionService.list(
      req.userId!,
      req.query as Record<string, string>,
    );
    res.json(result);
  },

  async getById(req: AuthRequest, res: Response) {
    const transaction = await transactionService.getById(
      req.userId!,
      Number(req.params.id),
    );
    res.json({ transaction });
  },

  async create(req: AuthRequest, res: Response) {
    const transaction = await transactionService.create(req.userId!, req.body);
    res
      .status(201)
      .json({ message: "Transaksi berhasil dicatat", transaction });
  },

  async update(req: AuthRequest, res: Response) {
    const transaction = await transactionService.update(
      req.userId!,
      Number(req.params.id),
      req.body,
    );
    res.json({ message: "Transaksi berhasil diupdate", transaction });
  },

  async delete(req: AuthRequest, res: Response) {
    await transactionService.delete(req.userId!, Number(req.params.id));
    res.json({ message: "Transaksi berhasil dihapus" });
  },
};
