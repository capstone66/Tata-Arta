import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { categoryService } from "../services/category.service";

export const categoryController = {
  async list(req: AuthRequest, res: Response) {
    const { type } = req.query as { type?: string };
    const categories = await categoryService.list(req.userId!, type);
    res.json({ categories });
  },

  async getById(req: AuthRequest, res: Response) {
    const category = await categoryService.getById(
      req.userId!,
      Number(req.params.id),
    );
    res.json({ category });
  },

  async create(req: AuthRequest, res: Response) {
    const category = await categoryService.create(req.userId!, req.body);
    res.status(201).json({ message: "Kategori berhasil dibuat", category });
  },

  async update(req: AuthRequest, res: Response) {
    const category = await categoryService.update(
      req.userId!,
      Number(req.params.id),
      req.body,
    );
    res.json({ message: "Kategori berhasil diupdate", category });
  },

  async delete(req: AuthRequest, res: Response) {
    await categoryService.delete(req.userId!, Number(req.params.id));
    res.json({ message: "Kategori berhasil dihapus" });
  },
};
