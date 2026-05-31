import { useState, useEffect, type FormEvent } from "react"
import { getCategories, type Category } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Plus, Pencil, Trash2, Wallet } from "lucide-react"
import { toast } from "sonner"

const API_BASE = ""

interface BudgetItem {
  id: number
  categoryId: number
  amount: number
  month: number
  year: number
  category: { id: number; name: string; type: string }
}

interface SpendingReport {
  id: number
  category: { id: number; name: string; type: string }
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  month: number
  year: number
}

async function apiGet<T>(url: string): Promise<T> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ message: "Gagal" }))).message)
  return res.json() as Promise<T>
}

async function apiPost(url: string, body: unknown) {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ message: "Gagal" }))).message)
  return res.json()
}

async function apiPut(url: string, body: unknown) {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ message: "Gagal" }))).message)
  return res.json()
}

async function apiDelete(url: string) {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}${url}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({ message: "Gagal" }))).message)
  return res.json()
}

export default function Budgets() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [spending, setSpending] = useState<SpendingReport[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)
  const [formCategoryId, setFormCategoryId] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [budgetRes, spendingRes, catData] = await Promise.all([
        apiGet<{ budgets: BudgetItem[] }>(`/api/budgets?month=${month}&year=${year}`),
        apiGet<{ report: SpendingReport[] }>(`/api/budgets/spending?month=${month}&year=${year}`),
        getCategories(),
      ])
      setBudgets(budgetRes.budgets)
      setSpending(spendingRes.report)
      setCategories(catData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [month, year])

  const openAddDialog = () => {
    setEditing(null)
    setFormCategoryId("")
    setFormAmount("")
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (b: BudgetItem) => {
    setEditing(b)
    setFormCategoryId(String(b.categoryId))
    setFormAmount(String(b.amount))
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!formCategoryId || !formAmount) { setFormError("Semua field harus diisi"); return }
    setFormLoading(true)
    try {
      const data = { categoryId: Number(formCategoryId), amount: Number(formAmount), month, year }
      if (editing) {
        await apiPut(`/api/budgets/${editing.id}`, data)
        toast.success("Anggaran diperbarui")
      } else {
        await apiPost("/api/budgets", data)
        toast.success("Anggaran berhasil dibuat")
      }
      setDialogOpen(false)
      fetchAll()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    toast("Hapus anggaran ini?", {
      action: { label: "Ya, hapus", onClick: async () => {
        try {
          await apiDelete(`/api/budgets/${id}`)
          toast.success("Anggaran berhasil dihapus")
          fetchAll()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Gagal menghapus")
        }
      }},
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    })
  }

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i).toLocaleDateString("id-ID", { month: "long" }) }))
  const currentYear = now.getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Anggaran</h1>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Tambah
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Bulan</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tahun</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : spending.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Belum ada anggaran untuk bulan ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {spending.map((item) => (
            <Card key={item.id} className="transition-all duration-200 hover:border-primary/20 hover:shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Anggaran {formatCurrency(item.budgeted)} &middot; Terpakai {formatCurrency(item.spent)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      item.remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {item.remaining >= 0 ? "Sisa" : "Lebih"} {formatCurrency(Math.abs(item.remaining))}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                      const b = budgets.find((x) => x.categoryId === item.category.id)
                      if (b) openEditDialog(b)
                    }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => {
                      const b = budgets.find((x) => x.categoryId === item.category.id)
                      if (b) handleDelete(b.id)
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percentage > 100
                        ? "bg-red-500"
                        : item.percentage > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Terpakai {item.percentage}%</span>
                  <span>{formatCurrency(item.budgeted - item.spent > 0 ? item.budgeted - item.spent : 0)} tersisa</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Anggaran" : "Tambah Anggaran"}</DialogTitle>
            <DialogDescription>Atur batas pengeluaran per kategori</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
            )}
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId} disabled={!!editing}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c.type === "EXPENSE").map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah Anggaran (Rp)</Label>
              <Input type="number" placeholder="1000000" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
