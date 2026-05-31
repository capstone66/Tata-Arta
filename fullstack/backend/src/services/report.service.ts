import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const reportService = {
  async getProfitLoss(userId: number, query: Record<string, string>) {
    const { startDate, endDate } = query;
    const where: Prisma.TransactionWhereInput = { userId };
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    if (Object.keys(dateFilter).length > 0) where.date = dateFilter;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true, type: true } } },
      orderBy: { date: "asc" },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const [incomeByCategory, expenseByCategory] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    const categoryIds = [
      ...incomeByCategory.map((c) => c.categoryId),
      ...expenseByCategory.map((c) => c.categoryId),
    ];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return {
      period: { startDate, endDate },
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      profitMargin:
        totalIncome > 0
          ? ((totalIncome - totalExpense) / totalIncome) * 100
          : 0,
      incomeByCategory: incomeByCategory.map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId) || "Unknown",
        total: c._sum.amount || 0,
      })),
      expenseByCategory: expenseByCategory.map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId) || "Unknown",
        total: c._sum.amount || 0,
      })),
      transactions,
    };
  },

  async getCashflow(userId: number, query: Record<string, string>) {
    const { months = "6" } = query;
    const numMonths = Math.min(12, Math.max(1, Number(months)));

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numMonths);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "asc" },
    });

    const monthlyData: {
      month: string;
      income: number;
      expense: number;
      balance: number;
    }[] = [];
    let runningBalance = 0;

    for (let i = 0; i < numMonths; i++) {
      const month = new Date(
        endDate.getFullYear(),
        endDate.getMonth() - i,
        1,
      );
      const monthStr = month.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      const monthTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === month.getMonth() &&
          d.getFullYear() === month.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);
      runningBalance += income - expense;

      monthlyData.unshift({
        month: monthStr,
        income,
        expense,
        balance: runningBalance,
      });
    }

    return { cashflow: monthlyData };
  },
};
