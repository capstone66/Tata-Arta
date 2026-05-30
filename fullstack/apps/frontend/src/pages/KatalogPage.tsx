import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
// Reuse layout styling
import "./KatalogPage.css";
// Specific table styling

type Role = "owner" | "karyawan";

interface BarangItem {
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const getStatus = (stock: number) => {
  if (stock <= 5) return { label: "Kritis", badgeClass: "kritis" };
  if (stock <= 15) return { label: "Perlu Cek", badgeClass: "perlu-cek" };
  return { label: "Normal", badgeClass: "normal" };
};

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

const INITIAL_DATA: BarangItem[] = [
  { code: "R1284", name: "Indomie Goreng", category: "Sembako", price: 3500, stock: 210 },
  { code: "M4342", name: "Beras Medium 5kg", category: "Sembako", price: 62000, stock: 8 },
  { code: "S7514", name: "Aqua 600ml", category: "Minuman", price: 4000, stock: 12 },
  { code: "I0325", name: "Minyak Goreng 2L", category: "Sembako", price: 29000, stock: 48 },
  { code: "G2291", name: "Gula Pasir 1kg", category: "Sembako", price: 14000, stock: 65 },
  { code: "T8812", name: "Tepung Terigu 1kg", category: "Sembako", price: 12000, stock: 30 },
  { code: "A1122", name: "Aqua 1.5L", category: "Minuman", price: 6000, stock: 5 },
  { code: "P3341", name: "Teh Pucuk 350ml", category: "Minuman", price: 5000, stock: 88 },
  { code: "K7721", name: "Kopi Kapal Api 165g", category: "Minuman", price: 15000, stock: 40 },
  { code: "S9912", name: "Sabun Mandi Lifebuoy", category: "Kebutuhan", price: 5500, stock: 55 },
  { code: "D4421", name: "Deterjen Rinso 1kg", category: "Kebutuhan", price: 22000, stock: 3 },
  { code: "H8831", name: "Sampo Pantene 170ml", category: "Kebutuhan", price: 18000, stock: 22 },
  { code: "B2251", name: "Beras Premium 5kg", category: "Sembako", price: 65000, stock: 18 },
  { code: "M5532", name: "Minyak Goreng 1L", category: "Sembako", price: 15000, stock: 70 },
  { code: "C1190", name: "Chitato BBQ 68g", category: "Snack", price: 10000, stock: 45 },
  { code: "L3310", name: "Lays Original 68g", category: "Snack", price: 10000, stock: 33 },
  { code: "W7720", name: "Wafer Tango", category: "Snack", price: 8000, stock: 60 },
];

const CATEGORIES = ["Semua", "Sembako", "Minuman", "Kebutuhan", "Snack"];

const KatalogPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: Role; username?: string } | null;
  const role: Role = state?.role || "karyawan";
  const username = state?.username || "Budi Santoso";
  const isOwner = role === "owner";

  const [katalogData, setKatalogData] = useState<BarangItem[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showModal, setShowModal] = useState(false);

  // Form modal state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Sembako");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  const handleNav = (path: string) => {
    navigate(path, { state: { role, username } });
  };

  // Filter logic
  const filtered = katalogData.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
    return matchSearch && matchCategory;
  });

  // Add new item
  const handleTambah = () => {
    if (!newName || !newPrice || !newStock) return;
    const code = (newCategory[0] + Math.floor(Math.random() * 9000 + 1000)).toUpperCase();
    setKatalogData(prev => [
      { code, name: newName, category: newCategory, price: Number(newPrice.replace(/\D/g, "")), stock: Number(newStock) },
      ...prev,
    ]);
    setNewName(""); setNewCategory("Sembako"); setNewPrice(""); setNewStock("");
    setShowModal(false);
  };

  const formatRupiah = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? Number(num).toLocaleString("id-ID") : "";
  };

  return (
    <div className="login-wrapper">
      <div className="dash">
        {/* ════════ SIDEBAR ════════ */}
        <Sidebar activePage="/katalog" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Katalog Barang</div>
                <div className="topbar-sub">Daftar barang dan status stok</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-search">
                <span>🔍</span> Cari barang, transaksi, atau laporan
              </div>
              {isOwner && <span className="topbar-badge">AI API Ready</span>}
              <button className="topbar-btn outline" onClick={() => handleNav("/input-stok")}>+ Stok</button>
              <button className="topbar-btn primary" onClick={() => handleNav("/catat-transaksi")}>+ Transaksi</button>
            </div>
          </header>

          {/* Content */}
          <div className="dash-content">
            {/* Content Header */}
            <div className="content-header">
              <div>
                <h1 className="content-title">Katalog Barang</h1>
              </div>
              <div className="header-actions">
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "10px 18px", fontSize: "12px", fontWeight: 700,
                    borderRadius: "10px", border: "1.5px solid var(--forest)",
                    background: "var(--forest)", color: "#dff4cf", cursor: "pointer",
                  }}
                >
                  + Tambah Barang
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Cari nama barang, kode, atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", cursor: "pointer",
                      border: activeCategory === cat ? "1.5px solid var(--forest)" : "1px solid rgba(0,0,0,0.1)",
                      background: activeCategory === cat ? "var(--forest)" : "transparent",
                      color: activeCategory === cat ? "#fff" : "var(--ink)",
                      transition: "all 0.15s"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Table Card */}
            <div className="katalog-card">
              <table className="katalog-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Stok</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px", fontSize: "13px" }}>
                        Barang tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const { label, badgeClass } = getStatus(item.stock);
                      return (
                        <tr key={idx}>
                          <td style={{ color: "var(--muted)", fontFamily: "monospace" }}>{item.code}</td>
                          <td><b>{item.name}</b></td>
                          <td>{item.category}</td>
                          <td>{fmt(item.price)}</td>
                          <td style={{ fontWeight: "700", color: item.stock <= 5 ? "var(--red)" : item.stock <= 15 ? "var(--gold)" : "var(--ink)" }}>{item.stock}</td>
                          <td>
                            <span className={`katalog-badge ${badgeClass}`}>
                              {label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "12px", color: "var(--muted)" }}>
                Menampilkan {filtered.length} dari {katalogData.length} barang
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ MODAL TAMBAH BARANG ════════ */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--ink)" }}>+ Tambah Barang</div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>NAMA BARANG</label>
                <input type="text" placeholder="Contoh: Beras Premium 5kg" value={newName} onChange={(e) => setNewName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>KATEGORI</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", cursor: "pointer" }}>
                  {CATEGORIES.filter(c => c !== "Semua").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>HARGA JUAL</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: "700", color: "var(--muted)" }}>Rp</span>
                    <input type="text" placeholder="0" value={newPrice} onChange={(e) => setNewPrice(formatRupiah(e.target.value))}
                      style={{ width: "100%", padding: "10px 10px 10px 32px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>STOK AWAL</label>
                  <input type="number" placeholder="0" min="0" value={newStock} onChange={(e) => setNewStock(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
                Batal
              </button>
              <button onClick={handleTambah} disabled={!newName || !newPrice || !newStock}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: (!newName || !newPrice || !newStock) ? "rgba(0,0,0,0.1)" : "var(--forest)", color: (!newName || !newPrice || !newStock) ? "var(--muted)" : "#fff", cursor: (!newName || !newPrice || !newStock) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "700" }}>
                Simpan Barang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KatalogPage;
