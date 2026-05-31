import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { productService } from "../services/product.service";

export const productController = {
  async search(req: AuthRequest, res: Response) {
    const { q = "", limit = "10" } = req.query as Record<string, string>;
    const result = await productService.search(req.userId!, q, limit);
    res.json(result);
  },

  async list(req: AuthRequest, res: Response) {
    const result = await productService.list(
      req.userId!,
      req.query as Record<string, string>,
    );
    res.json(result);
  },

  async getById(req: AuthRequest, res: Response) {
    const product = await productService.getById(
      req.userId!,
      Number(req.params.id),
    );
    res.json({ product });
  },

  async create(req: AuthRequest, res: Response) {
    const product = await productService.create(req.userId!, req.body);
    res.status(201).json({ message: "Produk berhasil ditambahkan", product });
  },

  async update(req: AuthRequest, res: Response) {
    const product = await productService.update(
      req.userId!,
      Number(req.params.id),
      req.body,
    );
    res.json({ message: "Produk berhasil diupdate", product });
  },

  async delete(req: AuthRequest, res: Response) {
    await productService.delete(req.userId!, Number(req.params.id));
    res.json({ message: "Produk berhasil dihapus" });
  },
};
