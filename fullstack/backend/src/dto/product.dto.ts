import { z } from "zod";

export const productSchema = z.object({
  kodeBarang: z.string().min(1, "Kode barang harus diisi"),
  name: z.string().min(1, "Nama produk harus diisi"),
  price: z.number().positive("Harga harus positif"),
  cost: z.number().positive("Modal harus positif"),
  stock: z.number().int().min(0, "Stok tidak boleh negatif"),
  category: z.string().min(1, "Kategori produk harus diisi"),
  subCategory: z.string().optional(),
  supplier: z.string().optional(),
  stokMin: z.number().int().optional(),
  stokMax: z.number().int().optional(),
  trxTotalQty: z.number().int().optional(),
  trxQty30d: z.number().int().optional(),
  trxQty90d: z.number().int().optional(),
  trxCount: z.number().int().optional(),
  trxTotalRevenue: z.number().optional(),
  trxTotalProfit: z.number().optional(),
});

export type CreateProductInput = z.infer<typeof productSchema>;
