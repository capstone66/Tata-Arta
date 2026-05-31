const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type PredictPayload =
  | { kode_barang: string }
  | { nama_barang: string }
  | {
      nama_barang: string;
      kategori?: string;
      sub_kategori?: string;
      supplier?: string;
      hpp?: number;
      harga_toko_1?: number;
      stok_min?: number;
      stok_max?: number;
      total_stock?: number;
      trx_total_qty?: number;
      trx_qty_30d?: number;
      trx_qty_60d?: number;
      trx_qty_90d?: number;
      trx_count?: number;
      trx_total_revenue?: number;
      trx_total_profit?: number;
    };

export interface RealtimeProduct {
  kode_barang: string;
  nama_barang: string;
  kategori?: string;
  sub_kategori?: string;
  supplier?: string;
  hpp?: number;
  harga_toko_1?: number;
  stok_min?: number;
  stok_max?: number;
  total_stock?: number;
  trx_total_qty?: number;
  trx_qty_30d?: number;
  trx_qty_60d?: number;
  trx_qty_90d?: number;
  trx_count?: number;
  trx_total_revenue?: number;
  trx_total_profit?: number;
}

interface RealtimeRecommendationPayload {
  limit?: number;
  products: RealtimeProduct[];
}

interface RealtimeSearchPayload {
  q: string;
  limit?: number;
  products: RealtimeProduct[];
}

export interface KpiHistoryEntry {
  date: string;
  revenue: number;
  expense: number;
  profit: number;
  transactions: number;
}

interface InsightsPayload {
  today: {
    date: string;
    revenue: number;
    expense: number;
    profit: number;
    transactions: number;
  };
  previous_period: {
    avg_revenue: number;
    avg_expense: number;
    avg_profit: number;
    avg_transactions: number;
  };
  stock: {
    total_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
  };
  products: RealtimeProduct[];
}

interface ForecastPayload {
  horizon_days: number;
  history: KpiHistoryEntry[];
}

async function fetchAi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<AiResponse<T>> {
  try {
    const res = await fetch(`${AI_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `AI API error (${res.status}): ${text}` };
    }
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `AI service unreachable: ${message}` };
  }
}

async function fetchAiMultipart<T>(
  endpoint: string,
  formData: FormData,
): Promise<AiResponse<T>> {
  try {
    const res = await fetch(`${AI_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `AI API error (${res.status}): ${text}` };
    }
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `AI service unreachable: ${message}` };
  }
}

function buildPayload(productData: PredictPayload): Record<string, unknown> {
  return productData as Record<string, unknown>;
}

export const aiService = {
  health: () => fetchAi("/health"),

  metadata: () => fetchAi("/metadata"),

  predictAll: (productData: PredictPayload) =>
    fetchAi("/predict/all", {
      method: "POST",
      body: JSON.stringify(buildPayload(productData)),
    }),

  predictFastMoving: (productData: PredictPayload) =>
    fetchAi("/predict/fast-moving", {
      method: "POST",
      body: JSON.stringify(buildPayload(productData)),
    }),

  predictLowStock: (productData: PredictPayload) =>
    fetchAi("/predict/low-stock", {
      method: "POST",
      body: JSON.stringify(buildPayload(productData)),
    }),

  predictProfit: (productData: PredictPayload) =>
    fetchAi("/predict/profit", {
      method: "POST",
      body: JSON.stringify(buildPayload(productData)),
    }),

  // ── DS mode (GET) ──
  topProducts: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchAi(`/recommendations/top-products${params}`);
  },

  highProfitProducts: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchAi(`/recommendations/high-profit${params}`);
  },

  restockPriority: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    return fetchAi(`/recommendations/restock-priority${params}`);
  },

  insightsSummary: () => fetchAi("/insights/summary"),

  forecastDailyKpi: (days?: number) => {
    const params = days ? `?days=${days}` : "";
    return fetchAi(`/forecast/daily-kpi${params}`);
  },

  searchProducts: (q: string, limit?: number) => {
    const params = new URLSearchParams({ q });
    if (limit) params.set("limit", String(limit));
    return fetchAi(`/products/search?${params.toString()}`);
  },

  // ── FS mode (POST) ──
  topProductsRealtime: (products: RealtimeProduct[], limit?: number) => {
    const payload: RealtimeRecommendationPayload = { products };
    if (limit) payload.limit = limit;
    return fetchAi("/recommendations/top-products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  highProfitProductsRealtime: (products: RealtimeProduct[], limit?: number) => {
    const payload: RealtimeRecommendationPayload = { products };
    if (limit) payload.limit = limit;
    return fetchAi("/recommendations/high-profit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  restockPriorityRealtime: (products: RealtimeProduct[], limit?: number) => {
    const payload: RealtimeRecommendationPayload = { products };
    if (limit) payload.limit = limit;
    return fetchAi("/recommendations/restock-priority", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  insightsSummaryRealtime: (payload: InsightsPayload) =>
    fetchAi("/insights/summary", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forecastDailyKpiRealtime: (history: KpiHistoryEntry[], horizonDays: number = 7) => {
    const payload: ForecastPayload = { horizon_days: horizonDays, history };
    return fetchAi("/forecast/daily-kpi", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  searchProductsRealtime: (q: string, products: RealtimeProduct[], limit?: number) => {
    const payload: RealtimeSearchPayload = { q, products };
    if (limit) payload.limit = limit;
    return fetchAi("/products/search", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  scanReceipt: (buffer: Buffer, filename: string) => {
    const formData = new FormData();
    formData.append("file", new Blob([buffer]), filename);
    return fetchAiMultipart("/ocr/scan-receipt", formData);
  },
};
