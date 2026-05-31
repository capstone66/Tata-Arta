import { useState, useEffect, type FormEvent } from "react"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
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
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"
import { toast } from "sonner"

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchData = () => {
    setLoading(true)
    setError("")
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openAddDialog = () => {
    setEditing(null)
    setFormName("")
    setFormType("EXPENSE")
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (cat: Category) => {
    setEditing(cat)
    setFormName(cat.name)
    setFormType(cat.type)
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!formName.trim()) { setFormError("Nama kategori harus diisi"); return }
    setFormLoading(true)
    try {
      if (editing) {
        await updateCategory(editing.id, { name: formName, type: formType })
        toast.success("Kategori berhasil diupdate")
      } else {
        await createCategory({ name: formName, type: formType })
        toast.success("Kategori berhasil ditambahkan")
      }
      setDialogOpen(false)
      fetchData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = (id: number, name: string) => {
    toast(`Hapus kategori "${name}"?`, {
      description: "Kategori dengan transaksi tidak bisa dihapus",
      action: { label: "Ya, hapus", onClick: async () => {
        try {
          await deleteCategory(id)
          toast.success("Kategori berhasil dihapus")
          fetchData()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Gagal menghapus")
        }
      }},
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    })
  }

  const incomeCategories = categories.filter((c) => c.type === "INCOME")
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Kategori</h1>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Tambah
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <FolderOpen className="h-4 w-4" /> Pemasukan
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : incomeCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kategori</p>
            ) : (
              <div className="space-y-1">
                {incomeCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => openEditDialog(cat)}>
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat._count.transactions} transaksi</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDialog(cat); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(cat.id, cat.name); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              <FolderOpen className="h-4 w-4" /> Pengeluaran
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : expenseCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kategori</p>
            ) : (
              <div className="space-y-1">
                {expenseCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => openEditDialog(cat)}>
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat._count.transactions} transaksi</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDialog(cat); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(cat.id, cat.name); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>Isi detail kategori di bawah ini</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nama Kategori</Label>
              <Input id="cat-name" placeholder="Nama kategori" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-type">Tipe</Label>
              <Select value={formType} onValueChange={(v: "INCOME" | "EXPENSE") => setFormType(v)}>
                <SelectTrigger id="cat-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Pemasukan</SelectItem>
                  <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
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
