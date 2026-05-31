import prisma from "../utils/prisma";

export const exportService = {
  async transactionsCsv(userId: number) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    const headers = "Tanggal,Tipe,Kategori,Deskripsi,Jumlah\n";
    const rows = transactions
      .map((t) =>
        [
          t.date.toISOString().split("T")[0],
          t.type,
          `"${t.category?.name || ""}"`,
          `"${t.description.replace(/"/g, '""')}"`,
          t.amount,
        ].join(","),
      )
      .join("\n");

    return headers + rows;
  },

  async productsCsv(userId: number) {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    const headers = "Kode,Nama,Kategori,Harga,Modal,Stok\n";
    const rows = products
      .map((p) =>
        [
          p.kodeBarang,
          `"${p.name}"`,
          p.category,
          p.price,
          p.cost,
          p.stock,
        ].join(","),
      )
      .join("\n");

    return headers + rows;
  },
};
