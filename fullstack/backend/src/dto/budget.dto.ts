import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: z.number().positive("Anggaran harus positif"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export type CreateBudgetInput = z.infer<typeof budgetSchema>;
