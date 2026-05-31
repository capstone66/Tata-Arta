import prisma from "../utils/prisma";
import { NotFoundError, BadRequestError } from "../utils/errors";
import type { Prisma } from "@prisma/client";

export const productService = {
  async search(userId: number, q: string, limit: string = "10") {
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const products = await prisma.product.findMany({
      where: { userId, name: { contains: q, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: limitNum,
    });

    const items = products.map((p) => {
      const lowerName = p.name.toLowerCase();
      const lowerQuery = q.toLowerCase();
      let matchScore = 0;
      if (lowerName === lowerQuery) matchScore = 1.0;
      else if (lowerName.startsWith(lowerQuery)) matchScore = 0.9;
      else if (lowerName.includes(lowerQuery)) matchScore = 0.7;
      else matchScore = 0.5;

      return {
        kode_barang: p.kodeBarang,
        nama: p.name,
        kategori: p.category,
        sub_kategori: p.subCategory,
        supplier: p.supplier,
        hpp: p.cost,
        harga_toko_1: p.price,
        trx_total_qty: p.trxTotalQty ?? 0,
        trx_count: p.trxCount ?? 0,
        match_score: matchScore,
      };
    });

    return { query: q, count: items.length, items };
  },

  async list(userId: number, query: Record<string, string>) {
    const { search, page = "1", limit = "20" } = query;
    const where: Prisma.ProductWhereInput = { userId };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  async getById(userId: number, id: number) {
    const product = await prisma.product.findFirst({
      where: { id, userId },
    });
    if (!product) throw new NotFoundError("Produk");
    return product;
  },

  async create(userId: number, data: Record<string, unknown>) {
    const existing = await prisma.product.findUnique({
      where: { kodeBarang: data.kodeBarang as string },
    });
    if (existing) throw new BadRequestError("Kode barang sudah digunakan");

    const product = await prisma.product.create({
      data: { ...data, userId } as any,
    });
    return product;
  },

  async update(userId: number, id: number, data: Record<string, unknown>) {
    const existing = await prisma.product.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Produk");

    const duplicate = await prisma.product.findFirst({
      where: {
        kodeBarang: data.kodeBarang as string,
        id: { not: id },
      },
    });
    if (duplicate) throw new BadRequestError("Kode barang sudah digunakan");

    const product = await prisma.product.update({
      where: { id },
      data: data as any,
    });
    return product;
  },

  async delete(userId: number, id: number) {
    const existing = await prisma.product.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError("Produk");
    await prisma.product.delete({ where: { id } });
  },
};
