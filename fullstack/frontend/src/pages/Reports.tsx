import { useState, useEffect } from "react"
import {
  getProfitLoss,
  getCashflow,
  type ReportProfitLoss,
  type ReportCashflow,
} from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, cn } from "@/lib/utils"
import { Download, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#4f46e5", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"]

export default function Reports() {
  const [profitLoss, setProfitLoss] = useState<ReportProfitLoss | null>(null)
  const [cashflow, setCashflow] = useState<ReportCashflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [cashflowMonths, setCashflowMonths] = useState("12")

  const fetchData = (sd?: string, ed?: string) => {
    setLoading(true)
    setError("")
    Promise.all([
      getProfitLoss(sd || undefined, ed || undefined),
      getCashflow(Number(cashflowMonths) || undefined),
    ])
      .then(([pl, cf]) => {
        setProfitLoss(pl)
        setCashflow(cf)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat laporan")
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFilter = () => {
    fetchData(startDate || undefined, endDate || undefined)
  }

  const exportCsv = () => {
    const token = localStorage.getItem("auth_token")
    const a = document.createElement("a")
    a.href = `/api/export/transactions/csv`
    a.style.display = "none"
    if (token) a.href += `?token=${token}`
    fetch(`/api/export/transactions/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "transactions.csv"
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="page-title">Laporan</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="skeleton h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="skeleton h-60" />
            </CardContent>
          </Card>
        ))}
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

  const combinedItems = [
    ...(profitLoss?.incomeByCategory?.map((c) => ({
      name: c.categoryName,
      income: c.total,
      expense: 0,
    })) ?? []),
    ...(profitLoss?.expenseByCategory?.map((c) => ({
      name: c.categoryName,
      income: 0,
      expense: c.total,
    })) ?? []),
  ]

  const pieData = profitLoss
    ? [...(profitLoss.incomeByCategory ?? []), ...(profitLoss.expenseByCategory ?? [])].map(
        (c) => ({ name: c.categoryName, value: c.total })
      )
    : []

  return (
    <div className="space-y-6">
      <h1 className="page-title">Laporan</h1>

      {/* Profit & Loss */}
      <Card>
        <CardHeader>
          <CardTitle>Laba / Rugi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Dari</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-44 justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(new Date(startDate + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate + "T00:00:00") : undefined}
                    onSelect={(d) => d && setStartDate(format(d, "yyyy-MM-dd"))}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sampai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-44 justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(new Date(endDate + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate + "T00:00:00") : undefined}
                    onSelect={(d) => d && setEndDate(format(d, "yyyy-MM-dd"))}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <Button size="sm" onClick={handleFilter}>Terapkan</Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Pendapatan</p>
              <p className="mt-1 text-xl font-heading font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(profitLoss?.totalIncome ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Pengeluaran</p>
              <p className="mt-1 text-xl font-heading font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(profitLoss?.totalExpense ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">Laba Bersih</p>
              <p className={`mt-1 text-xl font-heading font-bold ${
                (profitLoss?.netProfit ?? 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}>
                {formatCurrency(profitLoss?.netProfit ?? 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income vs Expense Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {combinedItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada data
              </p>
            ) : (
              <div className="space-y-3">
                {combinedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      {item.income > 0 && (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(item.income)}
                        </p>
                      )}
                      {item.expense > 0 && (
                        <p className="text-xs text-rose-600 dark:text-rose-400">
                          -{formatCurrency(item.expense)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {!Array.isArray(pieData) || pieData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada data
              </p>
            ) : (
              <div style={{ width: "100%", height: 256 }}>
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name }) => name}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cashflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Arus Kas</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="cf-months" className="text-sm">
                Bulan
              </Label>
              <Input
                id="cf-months"
                type="number"
                className="w-20"
                value={cashflowMonths}
                onChange={(e) => setCashflowMonths(e.target.value)}
                onBlur={() => fetchData()}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!cashflow?.cashflow || !Array.isArray(cashflow.cashflow) || cashflow.cashflow.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada data
            </p>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={cashflow.cashflow} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Pemasukan"
                    stackId="1"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.12}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Pengeluaran"
                    stackId="2"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.12}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Saldo"
                    stroke="#10b981"
                    fill="none"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
