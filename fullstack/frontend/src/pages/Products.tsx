import { useState, useEffect, useRef, type FormEvent } from "react"
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  predictAll,
  searchProducts,
  searchAiProducts,
  type Product,
  type ProductParams,
  type ProductSearchItem,
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
import { formatCurrency, cn } from "@/lib/utils"
import { Search, Plus, Pencil, Trash2, BrainCircuit, Download, Zap, TrendingUp, TrendingDown, BarChart3, PackageOpen, AlertTriangle } from "lucide-react"
import type { PredictAllResponse } from "@/services/api"
import { toast } from "sonner"

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formKode, setFormKode] = useState("")
  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formCost, setFormCost] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const [autoQuery, setAutoQuery] = useState("")
  const [autoSuggestions, setAutoSuggestions] = useState<ProductSearchItem[]>([])
  const [autoOpen, setAutoOpen] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const autoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autoRef.current && !autoRef.current.contains(e.target as Node)) {
        setAutoOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAutoSearch = (q: string) => {
    setAutoQuery(q)
    if (autoTimer.current) clearTimeout(autoTimer.current)
    if (q.length < 2) {
      setAutoSuggestions([])
      setAutoOpen(false)
      return
    }
    autoTimer.current = setTimeout(async () => {
      setAutoLoading(true)
      try {
        const [localRes, aiRes] = await Promise.allSettled([
          searchProducts(q, 8),
          searchAiProducts(q, 8),
        ])
        const localItems = localRes.status === "fulfilled" ? localRes.value.items : []
        const aiItems = aiRes.status === "fulfilled" ? aiRes.value.items : []
        const seen = new Set<string>()
        const merged = [...localItems, ...aiItems].filter((item) => {
          if (seen.has(item.kode_barang)) return false
          seen.add(item.kode_barang)
          return true
        })
        setAutoSuggestions(merged)
        setAutoOpen(merged.length > 0)
      } catch {
        setAutoSuggestions([])
      } finally {
        setAutoLoading(false)
      }
    }, 300)
  }

  const selectSuggestion = (item: ProductSearchItem) => {
    setFormKode(item.kode_barang)
    setFormName(item.nama)
    setFormPrice(String(item.harga_toko_1))
    setFormCost(String(item.hpp))
    setFormCategory(item.kategori)
    setAutoQuery(item.nama)
    setAutoOpen(false)
    setAutoSuggestions([])
  }

  const [predictionDialog, setPredictionDialog] = useState(false)
  const [predictionProduct, setPredictionProduct] = useState<Product | null>(null)
  const [predictionData, setPredictionData] = useState<PredictAllResponse | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState("")

  const fetchData = async (params?: ProductParams) => {
    setLoading(true)
    setError("")
    try {
      const res = await getProducts({ page, limit: 10, search, ...params })
      setProducts(res.data)
      setTotalPages(res.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData({ page, search })
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchData({ page: 1, search })
  }

  const openAddDialog = () => {
    setEditingProduct(null)
    setFormKode("")
    setFormName("")
    setFormPrice("")
    setFormCost("")
    setFormStock("")
    setFormCategory("")
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (p: Product) => {
    setEditingProduct(p)
    setFormKode(p.kodeBarang)
    setFormName(p.name)
    setFormPrice(String(p.price))
    setFormCost(String(p.cost))
    setFormStock(String(p.stock))
    setFormCategory(p.category || "")
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!formKode || !formName || !formPrice || !formCost || formStock === "" || !formCategory) {
      setFormError("Semua field harus diisi")
      return
    }
    setFormLoading(true)
    try {
      const data = {
        kodeBarang: formKode,
        name: formName,
        price: Number(formPrice),
        cost: Number(formCost),
        stock: Number(formStock),
        category: formCategory || "Umum",
      }
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
      } else {
        await createProduct(data)
      }
      setDialogOpen(false)
      fetchData()
      toast.success(editingProduct ? "Produk berhasil diupdate" : "Produk berhasil ditambahkan")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan produk")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    toast("Hapus produk ini?", {
      action: { label: "Ya, hapus", onClick: async () => {
        try {
          await deleteProduct(id)
          fetchData()
          toast.success("Produk berhasil dihapus")
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Gagal menghapus produk")
        }
      }},
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    })
  }

  const handlePredict = async (p: Product) => {
    setPredictionProduct(p)
    setPredictionData(null)
    setPredictionError("")
    setPredictionDialog(true)
    setPredictionLoading(true)
    try {
      const payload = p.trxTotalQty != null
        ? {
            nama_barang: p.name,
            kategori: p.category,
            supplier: p.supplier || undefined,
            hpp: p.cost,
            harga_toko_1: p.price,
            stok_min: p.stokMin ?? undefined,
            stok_max: p.stokMax ?? undefined,
            total_stock: p.stock,
            trx_total_qty: p.trxTotalQty ?? undefined,
            trx_qty_30d: p.trxQty30d ?? undefined,
            trx_qty_90d: p.trxQty90d ?? undefined,
            trx_count: p.trxCount ?? undefined,
            trx_total_revenue: p.trxTotalRevenue ?? undefined,
            trx_total_profit: p.trxTotalProfit ?? undefined,
          }
        : { kode_barang: p.kodeBarang }
      const res = await predictAll(payload)
      setPredictionData(res)
    } catch (err) {
      setPredictionError(err instanceof Error ? err.message : "Gagal mendapatkan prediksi")
    } finally {
      setPredictionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Produk</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const token = localStorage.getItem("auth_token")
            fetch("/api/export/products/csv", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.blob())
              .then((blob) => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "products.csv"
                a.click()
                URL.revokeObjectURL(url)
              })
          }}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button variant="secondary" onClick={handleSearch}>
          Cari
        </Button>
      </div>

      {/* Product List */}
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
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Belum ada produk</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Harga</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modal</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stok</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Laba</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 transition-colors hover:bg-muted/30 cursor-pointer" onClick={() => openEditDialog(p)}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.kodeBarang}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(p.cost)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.stock <= 5 ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-primary font-semibold">
                        {formatCurrency(p.price - p.cost)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handlePredict(p); }}
                            title="Prediksi AI"
                          >
                            <BrainCircuit className="h-4 w-4 text-amber-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); openEditDialog(p); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
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
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
            <DialogDescription>Isi detail produk di bawah ini</DialogDescription>
          </DialogHeader>

          {!editingProduct && (
            <div ref={autoRef} className="relative mb-2">
              <Label>Cari produk dari database</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ketik nama produk..."
                  value={autoQuery}
                  onChange={(e) => handleAutoSearch(e.target.value)}
                  onFocus={() => autoSuggestions.length > 0 && setAutoOpen(true)}
                  className="pl-9"
                />
                {autoLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    Mencari...
                  </span>
                )}
              </div>
              {autoOpen && autoSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {autoSuggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => selectSuggestion(item)}
                    >
                      <span className="font-medium">{item.nama}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.kode_barang} — {item.kategori}
                        {item.supplier ? ` — ${item.supplier}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="p-kode">Kode Barang</Label>
              <Input
                id="p-kode"
                placeholder="BRG-001"
                value={formKode}
                onChange={(e) => setFormKode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-name">Nama Produk</Label>
              <Input
                id="p-name"
                placeholder="Nama produk"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price">Harga (Rp)</Label>
                <Input
                  id="p-price"
                  type="number"
                  placeholder="100000"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-cost">Modal (Rp)</Label>
                <Input
                  id="p-cost"
                  type="number"
                  placeholder="70000"
                  value={formCost}
                  onChange={(e) => setFormCost(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category">Kategori</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger id="p-category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sembako">Sembako</SelectItem>
                  <SelectItem value="Minuman">Minuman</SelectItem>
                  <SelectItem value="Makanan">Makanan</SelectItem>
                  <SelectItem value="Elektronik">Elektronik</SelectItem>
                  <SelectItem value="Umum">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">Stok</Label>
              <Input
                id="p-stock"
                type="number"
                placeholder="0"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />
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
                  : editingProduct
                  ? "Simpan"
                  : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Prediction Result Dialog */}
      <Dialog open={predictionDialog} onOpenChange={setPredictionDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Prediksi AI
            </DialogTitle>
            <DialogDescription>
              {predictionProduct?.name ?? ""} &middot; {predictionProduct?.kodeBarang ?? ""}
            </DialogDescription>
          </DialogHeader>

          {predictionLoading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton h-40 rounded-xl" />
              ))}
            </div>
          ) : predictionError ? (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Gagal memproses prediksi</p>
              <p className="mt-1 text-destructive/80">{predictionError}</p>
            </div>
          ) : predictionData ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Fast Moving Card */}
              <div className={cn(
                "rounded-xl border p-4",
                predictionData.fast_moving?.prediction === "Fast Moving"
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  : predictionData.fast_moving?.prediction === "Slow Moving"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                  : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
              )}>
                <div className="mb-3 flex items-center gap-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    predictionData.fast_moving?.prediction === "Fast Moving"
                      ? "bg-emerald-100 dark:bg-emerald-500/20"
                      : predictionData.fast_moving?.prediction === "Slow Moving"
                      ? "bg-amber-100 dark:bg-amber-500/20"
                      : "bg-blue-100 dark:bg-blue-500/20"
                  )}>
                    {predictionData.fast_moving?.prediction === "Fast Moving" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : predictionData.fast_moving?.prediction === "Slow Moving" ? (
                      <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Perputaran</p>
                </div>
                <p className={cn(
                  "font-heading text-lg font-bold",
                  predictionData.fast_moving?.prediction === "Fast Moving"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : predictionData.fast_moving?.prediction === "Slow Moving"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-blue-700 dark:text-blue-300"
                )}>
                  {predictionData.fast_moving?.prediction === "Fast Moving" ? "Cepat Laku" :
                   predictionData.fast_moving?.prediction === "Slow Moving" ? "Lambat Laku" : "Normal"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confidence {((predictionData.fast_moving?.confidence ?? 0) * 100).toFixed(0)}%
                </p>
              </div>

              {/* Restock Card */}
              <div className={cn(
                "rounded-xl border p-4",
                predictionData.low_stock?.prediction === "Restock Priority"
                  ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
                  : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
              )}>
                <div className="mb-3 flex items-center gap-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    predictionData.low_stock?.prediction === "Restock Priority"
                      ? "bg-rose-100 dark:bg-rose-500/20"
                      : "bg-emerald-100 dark:bg-emerald-500/20"
                  )}>
                    {predictionData.low_stock?.prediction === "Restock Priority" ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <PackageOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Stok</p>
                </div>
                <p className={cn(
                  "font-heading text-lg font-bold",
                  predictionData.low_stock?.prediction === "Restock Priority"
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-emerald-700 dark:text-emerald-300"
                )}>
                  {predictionData.low_stock?.prediction === "Restock Priority" ? "Perlu Restock" : "Stok Aman"}
                </p>
                {predictionData.low_stock?.restock_priority_score != null && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all"
                        style={{ width: `${(predictionData.low_stock.restock_priority_score) * 100}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Skor: {(predictionData.low_stock.restock_priority_score * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Profit Card */}
              <div className={cn(
                "rounded-xl border p-4",
                predictionData.profit?.profit_category === "High Profit"
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                  : predictionData.profit?.profit_category === "Low Profit"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                  : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
              )}>
                <div className="mb-3 flex items-center gap-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    predictionData.profit?.profit_category === "High Profit"
                      ? "bg-emerald-100 dark:bg-emerald-500/20"
                      : predictionData.profit?.profit_category === "Low Profit"
                      ? "bg-amber-100 dark:bg-amber-500/20"
                      : "bg-blue-100 dark:bg-blue-500/20"
                  )}>
                    <Zap className={cn("h-4 w-4",
                      predictionData.profit?.profit_category === "High Profit"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : predictionData.profit?.profit_category === "Low Profit"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-blue-600 dark:text-blue-400"
                    )} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Profit</p>
                </div>
                <p className={cn(
                  "font-heading text-lg font-bold",
                  predictionData.profit?.profit_category === "High Profit"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : predictionData.profit?.profit_category === "Low Profit"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-blue-700 dark:text-blue-300"
                )}>
                  {predictionData.profit?.profit_category === "High Profit" ? "Profit Tinggi" :
                   predictionData.profit?.profit_category === "Low Profit" ? "Profit Rendah" : "Profit Sedang"}
                </p>
                {predictionData.profit?.estimated_profit_percent != null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Estimasi margin {predictionData.profit.estimated_profit_percent.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada hasil prediksi</p>
          )}

          <DialogFooter>
            <Button onClick={() => setPredictionDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
