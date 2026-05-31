import prisma from "../utils/prisma";

export const dashboardService = {
  async getSummary(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      recentTransactions,
      topCategories,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId, type: "EXPENSE" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
    ]);

    const categoryIds = topCategories.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpense: totalExpense._sum.amount || 0,
      totalProfit:
        (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
      monthlyIncome: monthlyIncome._sum.amount || 0,
      monthlyExpense: monthlyExpense._sum.amount || 0,
      monthlyProfit:
        (monthlyIncome._sum.amount || 0) - (monthlyExpense._sum.amount || 0),
      yearlyIncome: yearlyIncome._sum.amount || 0,
      yearlyExpense: yearlyExpense._sum.amount || 0,
      yearlyProfit:
        (yearlyIncome._sum.amount || 0) - (yearlyExpense._sum.amount || 0),
      recentTransactions,
      topExpenseCategories: topCategories.map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId) || "Unknown",
        total: c._sum.amount || 0,
      })),
    };
  },

  async getMonthly(userId: number) {
    const year = new Date().getFullYear();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      select: { amount: true, type: true, date: true },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    for (const t of transactions) {
      const month = new Date(t.date).getMonth();
      if (t.type === "INCOME") monthlyData[month].income += t.amount;
      else monthlyData[month].expense += t.amount;
    }

    return { monthlyData };
  },

  async getStats(userId: number) {
    const [totalTransactions, totalProducts, categoryCount] =
      await Promise.all([
        prisma.transaction.count({ where: { userId } }),
        prisma.product.count({ where: { userId } }),
        prisma.category.count({ where: { userId } }),
      ]);

    return {
      totalTransactions,
      totalProducts,
      totalCategories: categoryCount,
    };
  },
};
