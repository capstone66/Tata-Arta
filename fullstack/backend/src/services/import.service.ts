import prisma from "../utils/prisma";
import { BadRequestError } from "../utils/errors";

export const importService = {
  async transactions(userId: number, buffer: Buffer) {
    const text = buffer.toString("utf-8");
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      throw new BadRequestError(
        "CSV minimal harus memiliki header + 1 baris data",
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const dateIdx = headers.indexOf("tanggal");
    const typeIdx = headers.indexOf("tipe");
    const descIdx = headers.indexOf("deskripsi");
    const amountIdx = headers.indexOf("jumlah");
    const catIdx = headers.indexOf("kategori");

    if (
      dateIdx === -1 ||
      typeIdx === -1 ||
      descIdx === -1 ||
      amountIdx === -1
    ) {
      throw new BadRequestError(
        "CSV harus memiliki kolom: Tanggal, Tipe, Deskripsi, Jumlah",
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]
        .split(",")
        .map((c) => c.trim().replace(/^"|"$/g, ""));
      try {
        const amount = Math.abs(Number(cols[amountIdx]));
        if (!amount) throw new Error("Jumlah tidak valid");

        const categoryName = cols[catIdx] || "Umum";
        let category = await prisma.category.findFirst({
          where: { name: categoryName, userId },
        });
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              type:
                cols[typeIdx].toUpperCase() === "INCOME"
                  ? "INCOME"
                  : "EXPENSE",
              userId,
            },
          });
        }

        await prisma.transaction.create({
          data: {
            amount,
            type:
              cols[typeIdx].toUpperCase() === "INCOME"
                ? "INCOME"
                : "EXPENSE",
            description: cols[descIdx] || "Impor CSV",
            date: new Date(cols[dateIdx] || new Date()),
            categoryId: category.id,
            userId,
          },
        });
        imported++;
      } catch (err: unknown) {
        errors.push(
          `Baris ${i + 1}: ${err instanceof Error ? err.message : "Gagal import"}`,
        );
      }
    }

    return { imported, errors };
  },
};
