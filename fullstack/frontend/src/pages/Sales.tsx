import { useState, useEffect, type FormEvent } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  getSales,
  createSale,
  deleteSale,
  getProducts,
  type Sale,
  type Product,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { Plus, Trash2, ShoppingCart, Minus, X, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CartItem {
  product: Product
  qty: number
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedQty, setSelectedQty] = useState("1")
  const [saleDate, setSaleDate] = useState<Date>(new Date())
  const [saving, setSaving] = useState(false)

  const fetchSales = () => {
    setLoading(true)
    getSales({ page, limit: 20 })
      .then((res) => {
        setSales(res.data)
        setTotalPages(res.totalPages)
      })
      .catch(() => toast.error("Gagal memuat penjualan"))
      .finally(() => setLoading(false))
  }

  const fetchProducts = () => {
    getProducts({ limit: 100 })
      .then((res) => setProducts(res.data))
      .catch(() => {})
  }

  useEffect(() => { fetchSales() }, [page])
  useEffect(() => { if (dialogOpen) fetchProducts() }, [dialogOpen])

  const handleAddToCart = () => {
    const id = Number(selectedProductId)
    if (!id) return
    const product = products.find((p) => p.id === id)
    if (!product) return
    const qty = Math.max(1, Number(selectedQty) || 1)

    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === id)
      if (existing) {
        return prev.map((c) =>
          c.product.id === id ? { ...c, qty: c.qty + qty } : c,
        )
      }
      return [...prev, { product, qty }]
    })

    setSelectedProductId("")
    setSelectedQty("1")
  }

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId))
  }

  const handleUpdateQty = (productId: number, qty: number) => {
    if (qty < 1) return
    setCart((prev) =>
      prev.map((c) => (c.product.id === productId ? { ...c, qty } : c)),
    )
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0)
  const cartProfit = cart.reduce((sum, c) => sum + (c.product.price - c.product.cost) * c.qty, 0)

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    setSaving(true)
    try {
      const newSale = await createSale({
        items: cart.map((c) => ({ productId: c.product.id, qty: c.qty })),
        date: format(saleDate, "yyyy-MM-dd"),
      })
      setSales((prev) => [newSale, ...prev])
      setCart([])
      setDialogOpen(false)
      toast.success("Penjualan berhasil dicatat")
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan penjualan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    toast("Hapus penjualan ini?", {
      action: { label: "Ya, hapus", onClick: async () => {
        try {
          await deleteSale(id)
          setSales((prev) => prev.filter((s) => s.id !== id))
          toast.success("Penjualan berhasil dihapus")
        } catch (err: any) {
          toast.error(err.message || "Gagal menghapus penjualan")
        }
      }},
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Penjualan</h1>
        <Button onClick={() => { setSaleDate(new Date()); setDialogOpen(true) }}>
          <Plus className="mr-1.5 h-4 w-4" />
          Catat Penjualan
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Belum ada penjualan</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSaleDate(new Date()); setDialogOpen(true) }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Catat Penjualan Baru
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {sales.map((sale) => (
              <Card key={sale.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDateShort(sale.createdAt)}
                        </span>
                        <span className="text-muted-foreground/30">&middot;</span>
                        <span className="text-sm text-muted-foreground">
                          {sale.items.length} item
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sale.items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground"
                          >
                            {item.product.name}
                            <span className="font-medium text-muted-foreground/60">&times;{item.qty}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className="font-heading text-base font-bold text-foreground">
                        {formatCurrency(sale.total)}
                      </span>
                      {sale.profit != null && (
                        <span className={`text-sm font-medium ${sale.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {sale.profit >= 0 ? "+" : ""}{formatCurrency(sale.profit)}
                        </span>
                      )}
                      <button
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(sale.id)}
                        title="Hapus penjualan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setCart([]); setDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Catat Penjualan
            </DialogTitle>
            <DialogDescription>
              Pilih produk dan jumlah yang terjual
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Date */}
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !saleDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {saleDate ? format(saleDate, "EEEE, d MMMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={saleDate}
                    onSelect={(d) => d && setSaleDate(d)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Add product row */}
            <div className="grid grid-cols-[1fr_5rem_auto] gap-2 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="s-product">Produk</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="s-product" className="h-9">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <SelectItem value="-" disabled>
                        Tidak ada produk tersedia
                      </SelectItem>
                    ) : (
                      products.map((p) => {
                        const inCart = cart.some((c) => c.product.id === p.id)
                        return (
                          <SelectItem
                            key={p.id}
                            value={String(p.id)}
                            disabled={p.stock <= 0 || inCart}
                          >
                            {p.name}
                            <span className="ml-1 text-muted-foreground/50">
                              {p.stock <= 0 ? "(habis)" : inCart ? "(di keranjang)" : ""}
                            </span>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-qty">Qty</Label>
                <Input
                  id="s-qty"
                  type="number"
                  min="1"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                  className="text-center"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!selectedProductId}
                onClick={handleAddToCart}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart */}
            {cart.length > 0 ? (
              <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Keranjang ({cart.length} item)
                </p>
                {cart.map((c) => (
                  <div
                    key={c.product.id}
                    className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{c.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(c.product.price)} &times; {c.qty} = {formatCurrency(c.product.price * c.qty)}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-1">
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => handleUpdateQty(c.product.id, c.qty - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{c.qty}</span>
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => handleUpdateQty(c.product.id, c.qty + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => handleRemoveCartItem(c.product.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-heading text-base font-bold text-foreground">
                      {formatCurrency(cartTotal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimasi Laba</p>
                    <p className={`font-heading text-base font-bold ${cartProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {cartProfit >= 0 ? "+" : ""}{formatCurrency(cartProfit)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-10">
                <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">
                  Belum ada produk dipilih
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setCart([]); setDialogOpen(false) }}>
                Batal
              </Button>
              <Button type="submit" disabled={cart.length === 0 || saving}>
                {saving ? "Menyimpan..." : "Simpan Penjualan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
