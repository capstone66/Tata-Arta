import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import {
  aiService,
  type PredictPayload,
  type RealtimeProduct,
  type KpiHistoryEntry,
} from "../services/ai";

type PredictBody = Record<string, unknown>;

function isKodeBarang(
  body: PredictBody,
): body is { kode_barang: string } {
  return typeof body.kode_barang === "string" && body.kode_barang.length > 0;
}

function isNamaBarang(
  body: PredictBody,
): body is { nama_barang: string } {
  return (
    typeof body.nama_barang === "string" &&
    body.nama_barang.length > 0 &&
    Object.keys(body).length === 1
  );
}

function buildPredictPayload(body: PredictBody): PredictPayload {
  if (isKodeBarang(body)) return { kode_barang: body.kode_barang };
  if (isNamaBarang(body)) return { nama_barang: body.nama_barang };
  const raw = body as Record<string, unknown>;
  return {
    nama_barang: String(raw.nama_barang ?? ""),
    kategori: raw.kategori as string | undefined,
    sub_kategori: raw.sub_kategori as string | undefined,
    supplier: raw.supplier as string | undefined,
    hpp: raw.hpp as number | undefined,
    harga_toko_1: raw.harga_toko_1 as number | undefined,
    stok_min: raw.stok_min as number | undefined,
    stok_max: raw.stok_max as number | undefined,
    total_stock: raw.total_stock as number | undefined,
    trx_total_qty: raw.trx_total_qty as number | undefined,
    trx_qty_30d: raw.trx_qty_30d as number | undefined,
    trx_qty_60d: raw.trx_qty_60d as number | undefined,
    trx_qty_90d: raw.trx_qty_90d as number | undefined,
    trx_count: raw.trx_count as number | undefined,
    trx_total_revenue: raw.trx_total_revenue as number | undefined,
    trx_total_profit: raw.trx_total_profit as number | undefined,
  };
}

function mapProductToRealtime(p: {
  name: string;
  kodeBarang: string;
  category: string;
  subCategory: string | null;
  supplier: string | null;
  cost: number;
  price: number;
  stock: number;
  stokMin: number | null;
  stokMax: number | null;
  trxTotalQty: number | null;
  trxQty30d: number | null;
  trxQty90d: number | null;
  trxCount: number | null;
  trxTotalRevenue: number | null;
  trxTotalProfit: number | null;
}): RealtimeProduct {
  return {
    kode_barang: p.kodeBarang,
    nama_barang: p.name,
    kategori: p.category,
    sub_kategori: p.subCategory ?? undefined,
    supplier: p.supplier ?? undefined,
    hpp: p.cost,
    harga_toko_1: p.price,
    total_stock: p.stock,
    stok_min: p.stokMin ?? undefined,
    stok_max: p.stokMax ?? undefined,
    trx_total_qty: p.trxTotalQty ?? undefined,
    trx_qty_30d: p.trxQty30d ?? undefined,
    trx_qty_90d: p.trxQty90d ?? undefined,
    trx_count: p.trxCount ?? undefined,
    trx_total_revenue: p.trxTotalRevenue ?? undefined,
    trx_total_profit: p.trxTotalProfit ?? undefined,
  };
}

async function fetchUserProducts(
  userId: number,
): Promise<RealtimeProduct[]> {
  const products = await prisma.product.findMany({ where: { userId } });
  return products.map(mapProductToRealtime);
}

export const aiController = {
  async health(_req: Request, res: Response) {
    const result = await aiService.health();
    if (!result.success) {
      res
        .status(503)
        .json({ message: "AI service unavailable", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async metadata(_req: Request, res: Response) {
    const result = await aiService.metadata();
    if (!result.success) {
      res
        .status(503)
        .json({ message: "AI service unavailable", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async predictAll(req: Request, res: Response) {
    const payload = buildPredictPayload(req.body);
    const result = await aiService.predictAll(payload);
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Prediction failed", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async predictFastMoving(req: Request, res: Response) {
    const payload = buildPredictPayload(req.body);
    const result = await aiService.predictFastMoving(payload);
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Prediction failed", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async predictLowStock(req: Request, res: Response) {
    const payload = buildPredictPayload(req.body);
    const result = await aiService.predictLowStock(payload);
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Prediction failed", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async predictProfit(req: Request, res: Response) {
    const payload = buildPredictPayload(req.body);
    const result = await aiService.predictProfit(payload);
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Prediction failed", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async topProductsGet(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await aiService.topProducts(limit);
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Failed to get recommendations",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },

  async topProductsPost(req: AuthRequest, res: Response) {
    const limit = req.body.limit ? Number(req.body.limit) : undefined;
    const products = await fetchUserProducts(req.userId!);
    const result = await aiService.topProductsRealtime(products, limit);
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Failed to get recommendations",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },

  async highProfitGet(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await aiService.highProfitProducts(limit);
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Failed to get recommendations",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },

  async highProfitPost(req: AuthRequest, res: Response) {
    const limit = req.body.limit ? Number(req.body.limit) : undefined;
    const products = await fetchUserProducts(req.userId!);
    const result = await aiService.highProfitProductsRealtime(products, limit);
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Failed to get recommendations",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },

  async restockPriorityGet(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await aiService.restockPriority(limit);
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Failed to get recommendations",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },

  async restockPriorityPost(req: AuthRequest, res: Response) {
    const limit = req.body.limit ? Number(req.body.limit) : undefined;
    const products = await fetchUserProducts(req.userId!);
    const result = await aiService.restockPriorityRealtime(products, limit);
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Failed to get recommendations",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },

  async insightsSummaryGet(_req: Request, res: Response) {
    const result = await aiService.insightsSummary();
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Failed to get insights", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async insightsSummaryPost(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const prevStart = new Date(todayStart.getTime() - 7 * 86400000);

    const [todayTx, prevTx, products] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: todayStart, lt: todayEnd } },
        select: { amount: true, type: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: prevStart, lt: todayStart } },
        select: { amount: true, type: true },
      }),
      prisma.product.findMany({ where: { userId } }),
    ]);

    const lowStockCount = products.filter(
      (p) => p.stokMin != null && p.stock <= p.stokMin,
    ).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    const calcSummary = (txs: typeof todayTx) => {
      let revenue = 0,
        expense = 0,
        profit = 0;
      for (const t of txs) {
        if (t.type === "INCOME") revenue += t.amount;
        else expense += t.amount;
      }
      profit = revenue - expense;
      return { revenue, expense, profit, transactions: txs.length };
    };

    const today = calcSummary(todayTx);
    const prev = calcSummary(prevTx);
    const avgPeriod =
      prev.transactions > 0
        ? {
            avg_revenue: Math.round(prev.revenue / 7),
            avg_expense: Math.round(prev.expense / 7),
            avg_profit: Math.round(prev.profit / 7),
            avg_transactions: Math.round(prev.transactions / 7),
          }
        : {
            avg_revenue: 0,
            avg_expense: 0,
            avg_profit: 0,
            avg_transactions: 0,
          };

    const payload = {
      today: { date: now.toISOString().slice(0, 10), ...today },
      previous_period: avgPeriod,
      stock: {
        total_products: products.length,
        low_stock_products: lowStockCount,
        out_of_stock_products: outOfStockCount,
      },
      products: products.map(mapProductToRealtime),
    };

    const result = await aiService.insightsSummaryRealtime(payload);
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Failed to get insights", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async searchProducts(req: Request, res: Response) {
    const q = (req.query.q as string) || "";
    if (q.length < 1) {
      res.status(400).json({ message: "Query q harus diisi" });
      return;
    }
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await aiService.searchProducts(q, limit);
    if (!result.success) {
      res.json({ query: q, count: 0, items: [] });
      return;
    }
    res.json(result.data);
  },

  async forecastDailyKpiGet(req: Request, res: Response) {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const result = await aiService.forecastDailyKpi(days);
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Failed to get forecast", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async forecastDailyKpiPost(req: AuthRequest, res: Response) {
    const userId = req.userId!;
    const horizonDays = req.body.horizon_days ?? req.body.days ?? 7;
    const historyDays = Math.max(horizonDays, 7);

    const txns = await prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, type: true, date: true },
      orderBy: { date: "desc" },
    });

    const dailyMap = new Map<string, KpiHistoryEntry>();
    for (const t of txns) {
      const date = t.date.toISOString().slice(0, 10);
      const existing = dailyMap.get(date);
      if (existing) {
        existing.revenue += t.type === "INCOME" ? t.amount : 0;
        existing.expense += t.type === "EXPENSE" ? t.amount : 0;
        existing.profit = existing.revenue - existing.expense;
        existing.transactions += 1;
      } else {
        dailyMap.set(date, {
          date,
          revenue: t.type === "INCOME" ? t.amount : 0,
          expense: t.type === "EXPENSE" ? t.amount : 0,
          profit: t.type === "INCOME" ? t.amount : -t.amount,
          transactions: 1,
        });
      }
    }

    const history = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-historyDays);

    const result = await aiService.forecastDailyKpiRealtime(
      history,
      horizonDays,
    );
    if (!result.success) {
      res
        .status(502)
        .json({ message: "Failed to get forecast", detail: result.error });
      return;
    }
    res.json(result.data);
  },

  async scanReceipt(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ message: "File harus diunggah" });
      return;
    }

    const result = await aiService.scanReceipt(
      req.file.buffer,
      req.file.originalname,
    );
    if (!result.success) {
      res
        .status(502)
        .json({
          message: "Layanan OCR AI tidak tersedia",
          detail: result.error,
        });
      return;
    }
    res.json(result.data);
  },
};
