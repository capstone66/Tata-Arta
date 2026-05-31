import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive("Quantity harus positif"),
});

export const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "Minimal 1 item"),
  date: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
