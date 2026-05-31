import { useState, useEffect, useRef, type FormEvent } from "react"
import {
  getTransactions,
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  scanReceipt,
  type Transaction,
  type Category,
  type TransactionParams,
} from "@/services/api"
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
import { formatCurrency, formatDateShort, cn } from "@/lib/utils"
import { Search, Plus, Pencil, Trash2, Scan, Upload, Download, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [formAmount, setFormAmount] = useState("")
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [formDescription, setFormDescription] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formCategoryId, setFormCategoryId] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [scanLoading, setScanLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async (params?: TransactionParams) => {
    setLoading(true)
    setError("")
    try {
      const apiParams: TransactionParams = { page, limit: 10, search, ...params }
      if (typeFilter && typeFilter !== "all") apiParams.type = typeFilter
      const [txRes, catData] = await Promise.all([
        getTransactions(apiParams),
        getCategories(),
      ])
      setTransactions(txRes.data)
      setTotalPages(txRes.totalPages)
      setCategories(catData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, typeFilter])

  const handleSearch = () => {
    setPage(1)
    fetchData({ page: 1, search })
  }

  const openAddDialog = () => {
    setEditingTx(null)
    setFormAmount("")
    setFormType("EXPENSE")
    setFormDescription("")
    setFormDate(new Date().toISOString().split("T")[0])
    setFormCategoryId("")
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (tx: Transaction) => {
    setEditingTx(tx)
    setFormAmount(String(tx.amount))
    setFormType(tx.type)
    setFormDescription(tx.description)
    setFormDate(tx.date.split("T")[0])
    setFormCategoryId(String(tx.categoryId))
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!formAmount || !formDescription || !formDate || !formCategoryId) {
      setFormError("Semua field harus diisi")
      return
    }
    setFormLoading(true)
    try {
      const data = {
        amount: Number(formAmount),
        type: formType,
        description: formDescription,
        date: formDate,
        categoryId: Number(formCategoryId),
      }
      if (editingTx) {
        await updateTransaction(editingTx.id, data)
      } else {
        await createTransaction(data)
      }
      setDialogOpen(false)
      fetchData()
      toast.success(editingTx ? "Transaksi berhasil diupdate" : "Transaksi berhasil ditambahkan")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan transaksi")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    toast("Hapus transaksi ini?", {
      action: { label: "Ya, hapus", onClick: async () => {
        try {
          await deleteTransaction(id)
          fetchData()
          toast.success("Transaksi berhasil dihapus")
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Gagal menghapus transaksi")
        }
      }},
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    })
  }

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanLoading(true)
    setFormError("")
    try {
      const result = await scanReceipt(file)

      if (result.total_transaksi) setFormAmount(String(result.total_transaksi))
      if (result.merchant_name) setFormDescription(`Nota dari ${result.merchant_name}`)
      if (result.transaction_date) setFormDate(result.transaction_date.split("T")[0])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal scan nota")
    } finally {
      setScanLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const filteredCategories = categories.filter(
    (c) => c.type === formType
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Transaksi</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const token = localStorage.getItem("auth_token")
            fetch("/api/export/transactions/csv", {
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
          }}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = ".csv"
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (!file) return
              const formData = new FormData()
              formData.append("file", file)
              const token = localStorage.getItem("auth_token")
              try {
                const res = await fetch("/api/import/transactions", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData,
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.message)
                toast.success(data.message)
                if (data.errors?.length) {
                  data.errors.forEach((e: string) => toast.error(e))
                }
                fetchData()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal import")
              }
            }
            input.click()
          }}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="INCOME">Pendapatan</SelectItem>
            <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="secondary" onClick={handleSearch}>
          Cari
        </Button>
      </div>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deskripsi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipe</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0 transition-colors hover:bg-muted/30 cursor-pointer" onClick={() => openEditDialog(tx)}>
                      <td className="px-4 py-3">{formatDateShort(tx.date)}</td>
                      <td className="px-4 py-3 font-medium">{tx.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tx.category?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={tx.type === "INCOME"
                          ? "badge-primary"
                          : "badge-accent"
                        }>
                          {tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); openEditDialog(tx); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTx ? "Edit Transaksi" : "Tambah Transaksi"}
            </DialogTitle>
            <DialogDescription>
              Isi detail transaksi di bawah ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            {!editingTx && (
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScan}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={scanLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  {scanLoading ? "Memproses OCR..." : "Scan Nota (OCR)"}
                </Button>
              </div>
            )}
            {formError && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tx-type">Tipe</Label>
              <Select
                value={formType}
                onValueChange={(v: "INCOME" | "EXPENSE") => setFormType(v)}
              >
                <SelectTrigger id="tx-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Pemasukan</SelectItem>
                  <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Jumlah (Rp)</Label>
              <Input
                id="tx-amount"
                type="number"
                placeholder="100000"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-desc">Deskripsi</Label>
              <Input
                id="tx-desc"
                placeholder="Deskripsi transaksi"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(new Date(formDate + "T00:00:00"), "EEEE, d MMMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate ? new Date(formDate + "T00:00:00") : undefined}
                    onSelect={(d) => d && setFormDate(format(d, "yyyy-MM-dd"))}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-category">Kategori</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger id="tx-category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading
                  ? "Menyimpan..."
                  : editingTx
                  ? "Simpan"
                  : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
