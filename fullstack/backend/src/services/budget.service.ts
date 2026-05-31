import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";

export const budgetService = {
  async list(userId: number, query: Record<string, string>) {
    const { month, year } = query;
    const where: Record<string, unknown> = { userId };
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);

    const budgets = await prisma.budget.findMany({
      where,
      include: { category: { select: { id: true, name: true, type: true } } },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { category: { name: "asc" } },
      ],
    });
    return budgets;
  },

  async getSpendingReport(
    userId: number,
    month?: number,
    year?: number,
  ) {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: { userId, month: m, year: y },
        include: { category: { select: { id: true, name: true, type: true } } },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        select: { amount: true, categoryId: true },
      }),
    ]);

    const spendingByCategory = new Map<number, number>();
    for (const t of transactions) {
      spendingByCategory.set(
        t.categoryId,
        (spendingByCategory.get(t.categoryId) || 0) + t.amount,
      );
    }

    return budgets.map((b) => {
      const spent = spendingByCategory.get(b.categoryId) || 0;
      return {
        id: b.id,
        category: b.category,
        budgeted: b.amount,
        spent,
        remaining: b.amount - spent,
        percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
        month: m,
        year: y,
      };
    });
  },

  async getById(userId: number, id: number) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    if (!budget) throw new NotFoundError("Anggaran");
    return budget;
  },

  async create(
    userId: number,
    data: { categoryId: number; amount: number; month: number; year: number },
  ) {
    const existing = await prisma.budget.findUnique({
      where: {
        categoryId_month_year_userId: {
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
          userId,
        },
      },
    });

    if (existing) {
      const updated = await prisma.budget.update({
        where: { id: existing.id },
        data: { amount: data.amount },
      });
      return { updated: true, budget: updated };
    }

    const budget = await prisma.budget.create({
      data: { ...data, userId },
    });
    return { updated: false, budget };
  },

  async update(
    userId: number,
    id: number,
    data: { categoryId: number; amount: number; month: number; year: number },
  ) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Anggaran");

    const budget = await prisma.budget.update({
      where: { id },
      data,
    });
    return budget;
  },

  async delete(userId: number, id: number) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Anggaran");
    await prisma.budget.delete({ where: { id } });
  },
};
