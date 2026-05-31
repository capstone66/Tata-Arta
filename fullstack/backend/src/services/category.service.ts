import prisma from "../utils/prisma";
import { NotFoundError, BadRequestError } from "../utils/errors";

export const categoryService = {
  async list(userId: number, type?: string) {
    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { transactions: true } } },
    });
    return categories;
  },

  async getById(userId: number, id: number) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: { _count: { select: { transactions: true } } },
    });
    if (!category) throw new NotFoundError("Kategori");
    return category;
  },

  async create(userId: number, data: { name: string; type: string }) {
    const existing = await prisma.category.findFirst({
      where: { name: data.name, userId },
    });
    if (existing) throw new BadRequestError("Kategori sudah ada");

    const category = await prisma.category.create({
      data: {
        name: data.name,
        type: data.type as "INCOME" | "EXPENSE",
        userId,
      },
    });
    return category;
  },

  async update(
    userId: number,
    id: number,
    data: { name: string; type: string },
  ) {
    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Kategori");

    const duplicate = await prisma.category.findFirst({
      where: { name: data.name, userId, id: { not: id } },
    });
    if (duplicate) throw new BadRequestError("Nama kategori sudah digunakan");

    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return category;
  },

  async delete(userId: number, id: number) {
    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Kategori");
    await prisma.category.delete({ where: { id } });
  },
};
