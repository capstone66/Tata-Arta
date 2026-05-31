import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@finance.app" },
    update: {},
    create: { email: "demo@finance.app", password, name: "Demo User" },
  });

  // ── Categories ──
  const incomeCategories = [
    { name: "Penjualan Tunai", type: "INCOME" },
    { name: "Penjualan Non-Tunai", type: "INCOME" },
    { name: "Pendapatan Lain", type: "INCOME" },
  ];

  const expenseCategories = [
    { name: "Stok Barang", type: "EXPENSE" },
    { name: "Gaji Karyawan", type: "EXPENSE" },
    { name: "Sewa", type: "EXPENSE" },
    { name: "Listrik & Air", type: "EXPENSE" },
    { name: "Transportasi", type: "EXPENSE" },
    { name: "Marketing", type: "EXPENSE" },
    { name: "Makanan & Minuman", type: "EXPENSE" },
    { name: "Operasional Lain", type: "EXPENSE" },
  ];

  const allCategoryData = [...incomeCategories, ...expenseCategories];
  const catMap = new Map<string, number>();

  for (const cat of allCategoryData) {
    const created = await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: user.id } },
      update: {},
      create: { name: cat.name, type: cat.type, userId: user.id },
    });
    catMap.set(cat.name, created.id);
  }

  // ── Products ──
  const productData = [
    { kodeBarang: "BRS01", name: "Beras Premium 5kg", price: 78000, cost: 62000, stock: 45, stokMin: 20, stokMax: 100, category: "Sembako", subCategory: "Beras", supplier: "UD Maju Jaya" },
    { kodeBarang: "BRS02", name: "Beras Sedang 5kg", price: 68000, cost: 55000, stock: 60, stokMin: 25, stokMax: 120, category: "Sembako", subCategory: "Beras", supplier: "UD Maju Jaya" },
    { kodeBarang: "MNY01", name: "Minyak Goreng 2L", price: 36000, cost: 30000, stock: 30, stokMin: 15, stokMax: 80, category: "Sembako", subCategory: "Minyak", supplier: "PT Sinar Mas" },
    { kodeBarang: "MNY02", name: "Minyak Goreng 1L", price: 19000, cost: 15500, stock: 8, stokMin: 20, stokMax: 100, category: "Sembako", subCategory: "Minyak", supplier: "PT Sinar Mas" },
    { kodeBarang: "GLS01", name: "Gula Pasir 1kg", price: 17000, cost: 13500, stock: 35, stokMin: 20, stokMax: 90, category: "Sembako", subCategory: "Gula", supplier: "PD Gula Manis" },
    { kodeBarang: "TRG01", name: "Telur Ayam 1kg", price: 32000, cost: 27000, stock: 3, stokMin: 15, stokMax: 60, category: "Sembako", subCategory: "Telur", supplier: "Peternakan Jaya" },
    { kodeBarang: "KOP01", name: "Kopi Bubuk 200g", price: 28000, cost: 22000, stock: 25, stokMin: 10, stokMax: 50, category: "Minuman", subCategory: "Kopi", supplier: "PT Kopi Nusantara" },
    { kodeBarang: "KOP02", name: "Kopi Sachet 50pcs", price: 22000, cost: 17500, stock: 40, stokMin: 15, stokMax: 70, category: "Minuman", subCategory: "Kopi", supplier: "PT Kopi Nusantara" },
    { kodeBarang: "TEH01", name: "Teh Celup 25s", price: 9000, cost: 6500, stock: 5, stokMin: 20, stokMax: 80, category: "Minuman", subCategory: "Teh", supplier: "PT Teh Indonesia" },
    { kodeBarang: "MKN01", name: "Mie Instan Dus", price: 120000, cost: 95000, stock: 20, stokMin: 10, stokMax: 50, category: "Makanan", subCategory: "Mie", supplier: "PT Indofood" },
    { kodeBarang: "MKN02", name: "Kecap Manis 600ml", price: 22000, cost: 17500, stock: 18, stokMin: 10, stokMax: 40, category: "Makanan", subCategory: "Bumbu", supplier: "PT ABC" },
    { kodeBarang: "MKN03", name: "Saos Sambal 500ml", price: 18000, cost: 14000, stock: 22, stokMin: 10, stokMax: 40, category: "Makanan", subCategory: "Bumbu", supplier: "PT ABC" },
    { kodeBarang: "MIN01", name: "Air Mineral 600ml 24pcs", price: 35000, cost: 26000, stock: 50, stokMin: 15, stokMax: 80, category: "Minuman", subCategory: "Air", supplier: "PT Aqua" },
    { kodeBarang: "MIN02", name: "Susu UHT 1L", price: 18000, cost: 14000, stock: 12, stokMin: 10, stokMax: 40, category: "Minuman", subCategory: "Susu", supplier: "PT Ultrajaya" },
    { kodeBarang: "ELK01", name: "Baterai AA 4pcs", price: 25000, cost: 18000, stock: 15, stokMin: 8, stokMax: 30, category: "Elektronik", subCategory: "Baterai", supplier: "PT Energizer" },
  ];

  const products: any[] = [];
  for (const p of productData) {
    const created = await prisma.product.upsert({
      where: { kodeBarang: p.kodeBarang },
      update: {},
      create: { ...p, userId: user.id },
    });
    products.push(created);
  }

  // ── Generate 1 Month of Transactions (May 2026) ──
  const mayStart = new Date("2026-05-01");
  const now = new Date("2026-05-31");

  // Helper: random date in May 2026
  function randomMayDate(): Date {
    const day = randomInt(1, 31);
    const d = new Date(2026, 4, day);
    d.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
    return d;
  }

  // Delete existing transactions for fresh seed
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.saleItem.deleteMany({ where: { sale: { userId: user.id } } });
  await prisma.sale.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });

  const transactions: any[] = [];

  // Daily INCOME transactions (penjualan)
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 4, day);
    date.setHours(randomInt(9, 17), randomInt(0, 59), 0, 0);

    // Skip Sundays
    if (date.getDay() === 0) continue;

    // 1-2 income transactions per day
    const txCount = randomInt(1, 2);
    for (let t = 0; t < txCount; t++) {
      const jenisPembayaran = pick(["Penjualan Tunai", "Penjualan Non-Tunai"]);
      const amount = randomInt(5, 30) * 10000; // 50rb - 300rb per transaksi
      const descriptions = [
        `Penjualan ${pick(["eceran", "grosir", "harian", "langganan"])}`,
        `Pembayaran ${pick(["tunai", "transfer", "QRIS"])}`,
        `Penjualan ${pick(["sembako", "minuman", "makanan ringan"])}`,
      ];

      const txDate = new Date(date);
      txDate.setHours(txDate.getHours() + t);

      transactions.push({
        amount, type: "INCOME", description: pick(descriptions),
        date: txDate, categoryId: catMap.get(jenisPembayaran)!,
      });
    }
  }

  // Weekly EXPENSE transactions
  const weeklyExpenses: Array<{ dayOffset: number; cat: string; desc: string; min: number; max: number }> = [
    { dayOffset: 1, cat: "Stok Barang", desc: "Beli stok ${pick}", min: 200000, max: 800000 },
    { dayOffset: 3, cat: "Stok Barang", desc: "Restok ${pick}", min: 150000, max: 500000 },
    { dayOffset: 5, cat: "Transportasi", desc: "Biaya antar barang", min: 20000, max: 50000 },
    { dayOffset: 6, cat: "Makanan & Minuman", desc: "Konsumsi karyawan", min: 25000, max: 75000 },
  ];

  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 4, day);
    if (date.getDay() === 0) continue;

    for (const w of weeklyExpenses) {
      if (day % 7 === w.dayOffset % 7) {
        const amount = randomInt(w.min, w.max);
        const desc = w.desc.replace("${pick}",
          pick(["sembako", "minuman", "beras", "mie", "kopi", "gula", "telur", "susu"]));
        transactions.push({
          amount, type: "EXPENSE", description: desc,
          date: new Date(2026, 4, day, randomInt(8, 16), randomInt(0, 59)),
          categoryId: catMap.get(w.cat)!,
        });
      }
    }
  }

  // Fixed monthly expenses
  const fixedExpenses = [
    { day: 1, cat: "Sewa", desc: "Sewa tempat usaha", amount: 1500000 },
    { day: 25, cat: "Gaji Karyawan", desc: "Gaji 2 karyawan", amount: 3000000 },
    { day: 10, cat: "Listrik & Air", desc: "Tagihan listrik & air", amount: randomInt(300000, 500000) },
    { day: 15, cat: "Marketing", desc: "Promosi media sosial", amount: randomInt(100000, 200000) },
    { day: 20, cat: "Operasional Lain", desc: "Biaya operasional", amount: randomInt(50000, 150000) },
  ];

  for (const fe of fixedExpenses) {
    const amount = fe.amount || randomInt(fe.min || 50000, fe.max || 200000);
    transactions.push({
      amount, type: "EXPENSE", description: fe.desc,
      date: new Date(2026, 4, fe.day, randomInt(8, 10), 0),
      categoryId: catMap.get(fe.cat)!,
    });
  }

  // Create all transactions
  for (const t of transactions) {
    await prisma.transaction.create({ data: { ...t, userId: user.id } });
  }

  // ── Generate Sales (Sale + SaleItem) ──
  // Simulate daily sales data to populate product trx fields
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 4, day);
    if (date.getDay() === 0) continue;

    // 2-5 sales per day
    const saleCount = randomInt(2, 5);
    for (let s = 0; s < saleCount; s++) {
      // 1-4 items per sale
      const itemCount = randomInt(1, 4);
      const items: Array<{ productId: number; qty: number; price: number; cost: number }> = [];
      let total = 0;
      let totalProfit = 0;

      for (let i = 0; i < itemCount; i++) {
        const product = pick(products);
        const qty = randomInt(1, 3);
        items.push({ productId: product.id, qty, price: product.price, cost: product.cost });
        total += product.price * qty;
        totalProfit += (product.price - product.cost) * qty;
      }

      const saleDate = new Date(date);
      saleDate.setHours(randomInt(7, 20), randomInt(0, 59), 0, 0);

      const sale = await prisma.sale.create({
        data: {
          total, profit: totalProfit,
          createdAt: saleDate, userId: user.id,
          items: { create: items },
        },
      });
    }
  }

  // ── Update Product AI Feature Fields ──
  // Compute trx data from actual sales
  const ninetyDaysAgo = new Date("2026-03-02");
  const thirtyDaysAgo = new Date("2026-05-01");
  const sixtyDaysAgo = new Date("2026-04-01");

  for (const product of products) {
    // Get all sale items for this product
    const saleItems = await prisma.saleItem.findMany({
      where: { productId: product.id, sale: { userId: user.id } },
      include: { sale: true },
    });

    const trxCount = saleItems.length;
    const trxTotalQty = saleItems.reduce((sum, si) => sum + si.qty, 0);
    const trxTotalRevenue = saleItems.reduce((sum, si) => sum + si.price * si.qty, 0);
    const trxTotalProfit = saleItems.reduce((sum, si) => sum + (si.price - si.cost) * si.qty, 0);

    const qty30d = saleItems
      .filter((si) => new Date(si.sale.createdAt) >= thirtyDaysAgo)
      .reduce((sum, si) => sum + si.qty, 0);

    const qty90d = saleItems
      .filter((si) => new Date(si.sale.createdAt) >= ninetyDaysAgo)
      .reduce((sum, si) => sum + si.qty, 0);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        trxTotalQty, trxQty30d: qty30d, trxQty90d: qty90d,
        trxCount, trxTotalRevenue, trxTotalProfit,
      },
    });
  }

  // ── Budgets ──
  const budgets = [
    { categoryName: "Stok Barang", amount: 3000000, month: 5, year: 2026 },
    { categoryName: "Gaji Karyawan", amount: 3000000, month: 5, year: 2026 },
    { categoryName: "Sewa", amount: 1500000, month: 5, year: 2026 },
    { categoryName: "Listrik & Air", amount: 500000, month: 5, year: 2026 },
    { categoryName: "Transportasi", amount: 300000, month: 5, year: 2026 },
    { categoryName: "Marketing", amount: 200000, month: 5, year: 2026 },
    { categoryName: "Makanan & Minuman", amount: 500000, month: 5, year: 2026 },
    { categoryName: "Operasional Lain", amount: 300000, month: 5, year: 2026 },
  ];

  for (const b of budgets) {
    const catId = catMap.get(b.categoryName);
    if (catId) {
      await prisma.budget.upsert({
        where: { categoryId_month_year_userId: { categoryId: catId, month: b.month, year: b.year, userId: user.id } },
        update: { amount: b.amount },
        create: { categoryId: catId, amount: b.amount, month: b.month, year: b.year, userId: user.id },
      });
    }
  }

  console.log("========================================");
  console.log("  ✅ Seed Data Created Successfully!");
  console.log("========================================");
  console.log(`  User:      demo@finance.app`);
  console.log(`  Password:  password123`);
  console.log(`  Products:  ${products.length}`);
  console.log(`  Transaksi: ${transactions.length}`);
  console.log(`  Periode:   Mei 2026`);
  console.log("========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
