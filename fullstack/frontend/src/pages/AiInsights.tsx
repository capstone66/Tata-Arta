import { useState, useEffect } from "react"
import {
  getAIHealth,
  getInsightsSummaryRealtime,
  getForecastDailyKPIRealtime,
  getTopProductsRealtime,
  getHighProfitProductsRealtime,
  getRestockPriorityRealtime,
  type AIHealth,
  type InsightsSummaryResponse,
  type ForecastKpiResponse,
  type TopProductItem,
  type HighProfitItem,
  type RestockPriorityItem,
} from "@/services/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"

type RawRecord = Record<string, unknown>

function normalizeItem(item: RawRecord) {
  return {
    kode_barang: (item.kode_barang ?? item.kodeBarang ?? "") as string,
    nama: (item.nama ?? item.nama_barang ?? item.name ?? "") as string,
    kategori: (item.kategori ?? item.category ?? "") as string,
    trx_total_qty: (item.trx_total_qty ?? item.trxTotalQty ?? 0) as number,
    trx_count: (item.trx_count ?? item.trxCount ?? 0) as number,
    reason: (item.reason ?? "") as string,
  }
}

function normalizeHighProfit(item: RawRecord) {
  return {
    ...normalizeItem(item),
    estimated_profit_percent: (item.estimated_profit_percent ?? item.estimatedProfitPercent ?? 0) as number,
    profit_category: (item.profit_category ?? item.profitCategory ?? "") as string,
  }
}

function normalizeRestock(item: RawRecord) {
  const rawScore = (item.restock_priority_score ?? item.restockPriorityScore ?? 0) as number
  return {
    ...normalizeItem(item),
    restock_priority_score: rawScore > 1 ? Math.min(rawScore / 100, 1) : rawScore,
    fast_moving_status: (item.fast_moving_status ?? item.fastMovingStatus ?? "") as string,
  }
}

function normalizeForecast(item: RawRecord) {
  return {
    date: (item.date ?? "") as string,
    predicted_revenue: (item.predicted_revenue ?? item.predictedRevenue ?? 0) as number,
    predicted_expense: (item.predicted_expense ?? item.predictedExpense ?? 0) as number,
    predicted_profit: (item.predicted_profit ?? item.predictedProfit ?? 0) as number,
    predicted_transactions: (item.predicted_transactions ?? item.predictedTransactions ?? 0) as number,
  }
}

export default function AiInsights() {
  const [health, setHealth] = useState<AIHealth | null>(null)
  const [summary, setSummary] = useState<InsightsSummaryResponse | null>(null)
  const [forecast, setForecast] = useState<ForecastKpiResponse | null>(null)
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([])
  const [highProfit, setHighProfit] = useState<HighProfitItem[]>([])
  const [restock, setRestock] = useState<RestockPriorityItem[]>([])

  const [error, setError] = useState("")
  const [, triggerRefresh] = useState(0)

  const fetchAll = () => {
    triggerRefresh((n) => n + 1)
    setError("")
    Promise.allSettled([
      getAIHealth(),
      getInsightsSummaryRealtime(),
      getForecastDailyKPIRealtime(),
      getTopProductsRealtime(),
      getHighProfitProductsRealtime(),
      getRestockPriorityRealtime(),
    ])
      .then((results) => {
        const [h, s, f, tp, hp, r] = results
        if (h.status === "fulfilled") setHealth(h.value)
        if (s.status === "fulfilled") {
          const data = s.value as unknown as RawRecord
          const summaryData = (data.summary ?? data) as RawRecord
          setSummary({
            summary: {
              total_products: (summaryData.total_products ?? summaryData.totalProducts ?? 0) as number,
              fast_moving_products: (summaryData.fast_moving_products ?? summaryData.fastMovingProducts ?? 0) as number,
              restock_priority_products: (summaryData.restock_priority_products ?? summaryData.restockPriorityProducts ?? 0) as number,
              high_profit_products: (summaryData.high_profit_products ?? summaryData.highProfitProducts ?? 0) as number,
            },
            insights: (data.insights ?? summaryData.insights ?? []) as string[],
          })
        }
        if (f.status === "fulfilled") {
          const data = f.value as unknown as RawRecord
          const rawForecast = (data.forecast ?? (Array.isArray(data) ? data : [])) as RawRecord[]
          setForecast({
            history: (data.history ?? []) as any[],
            forecast: rawForecast.map(normalizeForecast),
          })
        }
        if (tp.status === "fulfilled") {
          const data = tp.value as unknown as RawRecord
          const items = (data.items ?? (Array.isArray(data) ? data : [])) as RawRecord[]
          setTopProducts(items.map(normalizeItem) as TopProductItem[])
        }
        if (hp.status === "fulfilled") {
          const data = hp.value as unknown as RawRecord
          const items = (data.items ?? (Array.isArray(data) ? data : [])) as RawRecord[]
          setHighProfit(items.map(normalizeHighProfit) as HighProfitItem[])
        }
        if (r.status === "fulfilled") {
          const data = r.value as unknown as RawRecord
          const items = (data.items ?? (Array.isArray(data) ? data : [])) as RawRecord[]
          setRestock(items.map(normalizeRestock) as RestockPriorityItem[])
        }
        const rejected = results.filter((r) => r.status === "rejected")
        if (rejected.length > 0) setError("Beberapa data gagal dimuat")
      })
      .catch(() => setError("Gagal memuat data AI"))
      .finally(() => {})
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">AI Insights</h1>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Health Check */}
      <Card className="transition-all duration-200 hover:border-primary/20 hover:shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              health?.status === "healthy" || health?.status === "ok"
                ? "bg-emerald-100 dark:bg-emerald-500/10"
                : "bg-rose-100 dark:bg-rose-500/10"
            }`}>
              {health?.status === "healthy" || health?.status === "ok" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Status Layanan AI</p>
              <p className="text-xs text-muted-foreground">{health?.message || "Tidak tersedia"}</p>
            </div>
          </div>
          <span className={`badge-${
            health?.status === "healthy" || health?.status === "ok" ? "success" : "destructive"
          }`}>
            {health?.status === "healthy" || health?.status === "ok" ? "Aktif" : "Offline"}
          </span>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.summary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/50 bg-card p-3">
                  <p className="text-xl font-heading font-bold text-foreground">{(summary.summary.total_products ?? 0).toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground">Total Produk</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-3">
                  <p className="text-xl font-heading font-bold text-emerald-600 dark:text-emerald-400">{summary.summary.fast_moving_products ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Fast Moving</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-3">
                  <p className="text-xl font-heading font-bold text-rose-600 dark:text-rose-400">{summary.summary.restock_priority_products ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Restock Priority</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-3">
                  <p className="text-xl font-heading font-bold text-amber-600 dark:text-amber-400">{summary.summary.high_profit_products ?? 0}</p>
                  <p className="text-xs text-muted-foreground">High Profit</p>
                </div>
              </div>
              <div className="space-y-1">
                {Array.isArray(summary.insights) && summary.insights.map((insight, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {insight ?? ""}</p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada ringkasan tersedia</p>
          )}
        </CardContent>
      </Card>

      {/* Forecast KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast KPI Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {forecast?.forecast && forecast.forecast.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tanggal</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Biaya</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Laba</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaksi</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.forecast.map((kpi, i) => (
                    <tr key={i} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-2.5">{kpi.date}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">
                        {formatCurrency(kpi.predicted_revenue)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(kpi.predicted_expense)}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${kpi.predicted_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {kpi.predicted_profit >= 0 ? "+" : ""}{formatCurrency(kpi.predicted_profit)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {kpi.predicted_transactions.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada data forecast</p>
          )}
        </CardContent>
      </Card>

      {/* Top Products & High Profit */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada data</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.nama}</p>
                      <p className="text-xs text-muted-foreground">{p.kode_barang}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {p.trx_total_qty.toLocaleString("id-ID")} terjual
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk dengan Laba Tinggi</CardTitle>
          </CardHeader>
          <CardContent>
            {highProfit.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada data</p>
            ) : (
              <div className="space-y-3">
                {highProfit.map((p, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.nama}</p>
                      <p className="text-xs text-muted-foreground">{p.kode_barang}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {p.estimated_profit_percent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restock Priority */}
      <Card>
        <CardHeader>
          <CardTitle>Prioritas Restok</CardTitle>
        </CardHeader>
        <CardContent>
          {restock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada rekomendasi restok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produk</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score Prioritas</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {restock.map((item, i) => (
                    <tr key={i} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-foreground">{item.nama}</p>
                        <p className="text-xs text-muted-foreground">{item.kode_barang}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">
                        {(item.restock_priority_score * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={
                          item.restock_priority_score >= 0.7
                            ? "badge-destructive"
                            : item.restock_priority_score >= 0.4
                            ? "badge-warning"
                            : "badge-primary"
                        }>
                          {item.restock_priority_score >= 0.7
                            ? "Tinggi"
                            : item.restock_priority_score >= 0.4
                            ? "Sedang"
                            : "Rendah"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
