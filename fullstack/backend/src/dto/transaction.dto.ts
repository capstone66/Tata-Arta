import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("Jumlah harus positif"),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Tipe harus INCOME atau EXPENSE" }),
  description: z.string().min(1, "Deskripsi harus diisi"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
  categoryId: z.number().int().positive("Kategori harus dipilih"),
});

export type CreateTransactionInput = z.infer<typeof transactionSchema>;
