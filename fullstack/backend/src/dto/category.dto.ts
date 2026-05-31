import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Tipe harus INCOME atau EXPENSE" }),
});

export const categoryQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

export type CreateCategoryInput = z.infer<typeof categorySchema>;
