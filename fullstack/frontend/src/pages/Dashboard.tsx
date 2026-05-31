import { useState, useEffect } from "react"
import {
  getSummary,
  getMonthly,
  getStats,
  type DashboardSummary,
  type MonthlyData,
  type DashboardStats,
} from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDateShort, cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getSummary(), getMonthly(), getStats()])
      .then(([s, m, st]) => {
        setSummary(s)
        setMonthly(m)
        setStats(st)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="page-title">Dashboard</h1>
        <div className="h-32 skeleton" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
        <div className="h-80 skeleton" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const totalExpense = summary?.totalExpense ?? 0

  const statsCards = [
    {
      title: "Total Pendapatan",
      value: summary?.totalIncome ?? 0,
      icon: ArrowUpRight,
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
      change: "+12%",
    },
    {
      title: "Total Pengeluaran",
      value: summary?.totalExpense ?? 0,
      icon: ArrowDownRight,
      color: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-100 dark:bg-rose-500/10",
    },
    {
      title: "Laba Bersih",
      value: summary?.totalProfit ?? 0,
      icon: Wallet,
      color: summary && summary.totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Transaksi",
      value: stats?.totalTransactions ?? 0,
      icon: Receipt,
      color: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
      isCount: true,
    },
  ]

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ringkasan keuangan Anda</p>
        </div>
      </div>

      {/* Hero: Net Profit */}
      <div className="hero-card animate-fade-in-up">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Laba Bersih</p>
              <p className="mt-1 text-3xl font-heading font-bold tracking-tight text-white">
                {formatCurrency(summary?.totalProfit ?? 0)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-5 flex gap-6">
            <div className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] text-white/60">Pemasukan</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(summary?.totalIncome ?? 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-400/20">
                <TrendingDown className="h-3.5 w-3.5 text-rose-300" />
              </div>
              <div>
                <p className="text-[11px] text-white/60">Pengeluaran</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(summary?.totalExpense ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.iconBg)}>
                  <Icon className={cn("h-4.5 w-4.5", card.color)} />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">{card.title}</p>
              <p className={cn("mt-0.5 text-xl font-heading font-bold tracking-tight", card.color)}>
                {card.isCount
                  ? (card.value as number).toLocaleString("id-ID")
                  : formatCurrency(card.value)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Monthly Chart */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <CardContent className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground">Pendapatan & Pengeluaran Bulanan</h2>
              <p className="text-xs text-muted-foreground">Tahun berjalan</p>
            </div>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            {Array.isArray(monthly) && monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthly.map((m) => ({ ...m, month: monthNames[m.month - 1] || String(m.month) }))}
                  margin={{ top: 5, right: 8, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value || 0))}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Pendapatan"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Belum ada data bulanan
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions + Top Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-heading text-sm font-semibold text-foreground">Transaksi Terbaru</h2>
              </div>
              <Link to="/transactions" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {summary?.recentTransactions?.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada transaksi</p>
            ) : (
              <div className="divide-y divide-border/50">
                  {summary?.recentTransactions?.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 transition-colors hover:bg-muted/30 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        tx.type === "INCOME" ? "bg-emerald-100 dark:bg-emerald-500/10" : "bg-rose-100 dark:bg-rose-500/10"
                      )}>
                        {tx.type === "INCOME" ? (
                          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(tx.date)} &middot; {tx.category?.name ?? "-"}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="animate-fade-in-up" style={{ animationDelay: "220ms" }}>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10">
                <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-heading text-sm font-semibold text-foreground">Kategori Pengeluaran</h2>
            </div>
            {summary?.topExpenseCategories?.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data kategori</p>
            ) : (
              <div className="space-y-4">
                {summary?.topExpenseCategories?.map((cat, i) => {
                  const percentage = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{cat.categoryName}</span>
                        <span className="font-medium text-foreground">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            background: i === 0 ? "var(--accent)" : i === 1 ? "#f59e0b" : "var(--primary)",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
