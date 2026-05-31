import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import type { Prisma } from "@prisma/client";

export const transactionService = {
  async list(userId: number, query: Record<string, string>) {
    const {
      type,
      categoryId,
      startDate,
      endDate,
      search,
      page = "1",
      limit = "20",
    } = query;

    const where: Prisma.TransactionWhereInput = { userId };
    if (type) where.type = type as "INCOME" | "EXPENSE";
    if (categoryId) where.categoryId = Number(categoryId);
    if (startDate) {
      where.date = { ...(where.date as Prisma.DateTimeFilter), gte: new Date(startDate) };
    }
    if (endDate) {
      where.date = { ...(where.date as Prisma.DateTimeFilter), lte: new Date(endDate) };
    }
    if (search) where.description = { contains: search, mode: "insensitive" };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: { select: { id: true, name: true, type: true } } },
        orderBy: { date: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  async getById(userId: number, id: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    if (!transaction) throw new NotFoundError("Transaksi");
    return transaction;
  },

  async create(
    userId: number,
    data: {
      amount: number;
      type: string;
      description: string;
      date: string;
      categoryId: number;
    },
  ) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) throw new NotFoundError("Kategori");

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type as "INCOME" | "EXPENSE",
        description: data.description,
        date: new Date(data.date),
        categoryId: data.categoryId,
        userId,
      },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    return transaction;
  },

  async update(
    userId: number,
    id: number,
    data: {
      amount: number;
      type: string;
      description: string;
      date: string;
      categoryId: number;
    },
  ) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Transaksi");

    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) throw new NotFoundError("Kategori");

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        type: data.type as "INCOME" | "EXPENSE",
        description: data.description,
        date: new Date(data.date),
        categoryId: data.categoryId,
      },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    return transaction;
  },

  async delete(userId: number, id: number) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Transaksi");
    await prisma.transaction.delete({ where: { id } });
  },
};
