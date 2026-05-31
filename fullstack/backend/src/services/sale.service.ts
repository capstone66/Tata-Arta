import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";

export const saleService = {
  async list(userId: number, query: Record<string, string>) {
    const { page = "1", limit = "20" } = query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, kodeBarang: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.sale.count({ where: { userId } }),
    ]);

    return {
      sales,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  async getById(userId: number, id: number) {
    const sale = await prisma.sale.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                kodeBarang: true,
                price: true,
                cost: true,
              },
            },
          },
        },
      },
    });
    if (!sale) throw new NotFoundError("Penjualan");
    return sale;
  },

  async create(
    userId: number,
    data: { items: { productId: number; qty: number }[]; date?: string },
  ) {
    const { items, date } = data;
    const saleDate = date ? new Date(date) : new Date();

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, userId },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    let profit = 0;
    const saleItemsData: {
      productId: number;
      qty: number;
      price: number;
      cost: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundError(`Produk ID ${item.productId}`);

      const subtotal = product.price * item.qty;
      const costTotal = product.cost * item.qty;
      total += subtotal;
      profit += subtotal - costTotal;

      saleItemsData.push({
        productId: item.productId,
        qty: item.qty,
        price: product.price,
        cost: product.cost,
      });

      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    const sale = await prisma.sale.create({
      data: {
        total,
        profit,
        createdAt: saleDate,
        userId,
        items: { create: saleItemsData },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, kodeBarang: true } },
          },
        },
      },
    });
    return sale;
  },

  async delete(userId: number, id: number) {
    const sale = await prisma.sale.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!sale) throw new NotFoundError("Penjualan");

    for (const item of sale.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.qty } },
      });
    }

    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });
  },
};
