import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
import "./CatatTransaksiPage.css";

type Role = "owner" | "karyawan";
type TabState = "penjualan" | "pengeluaran";

interface CartItem {
  nama: string;
  harga: number;
  qty: number;
}

const PRODUK_LIST = [
  { nama: "Beras Premium 5kg", harga: 65000 },
  { nama: "Beras Medium 5kg", harga: 52000 },
  { nama: "Minyak Goreng 2L", harga: 29000 },
  { nama: "Minyak Goreng 1L", harga: 15000 },
  { nama: "Gula Pasir 1kg", harga: 14000 },
  { nama: "Gula Pasir 5kg", harga: 68000 },
  { nama: "Tepung Terigu 1kg", harga: 12000 },
  { nama: "Indomie Goreng", harga: 3500 },
  { nama: "Indomie Soto", harga: 3500 },
  { nama: "Aqua 600ml", harga: 4000 },
  { nama: "Aqua 1.5L", harga: 6000 },
  { nama: "Teh Pucuk 350ml", harga: 5000 },
  { nama: "Sabun Cuci Sunlight", harga: 8500 },
  { nama: "Rinso 1kg", harga: 22000 },
  { nama: "Sampo Pantene 170ml", harga: 18000 },
];

const fmt = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

const kategoriList = [
  { id: "pembelian", label: "🛒 Pembelian Stok" },
  { id: "utilitas", label: "💡 Utilitas" },
  { id: "gaji", label: "💼 Gaji/Karyawan" },
  { id: "pengiriman", label: "🚚 Pengiriman" },
  { id: "perawatan", label: "🛠️ Perawatan" },
  { id: "promosi", label: "📢 Promosi" },
  { id: "lainnya", label: "🏷️ Lainnya" },
];

const ringkasanPengeluaran = [
  { icon: "🛒", iconClass: "red", label: "Pembelian Stok", desc: "Rp 8.400.000 - 12 transaksi", amount: "−Rp 8,4jt" },
  { icon: "💡", iconClass: "gold", label: "Utilitas & Listrik", desc: "Rp 1.200.000 - 3 transaksi", amount: "−Rp 1,2jt" },
  { icon: "💼", iconClass: "blue", label: "Gaji Karyawan", desc: "Rp 4.500.000 - 2 karyawan", amount: "−Rp 4,5jt" },
  { icon: "📢", iconClass: "green", label: "Promosi & Iklan", desc: "Rp 300.000 - 1 transaksi", amount: "−Rp 300rb" },
];

const CatatTransaksiPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: Role; username?: string } | null;
  const role: Role = state?.role || "owner";
  const username = state?.username || "Budi Santoso";
  const isOwner = role === "owner";

  // ── Penjualan state ──
  const [activeTab, setActiveTab] = useState<TabState>("penjualan");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [transaksiSelesai, setTransaksiSelesai] = useState(false);

  // ── Pengeluaran state ──
  const [activeCategory, setActiveCategory] = useState("pembelian");
  const [keteranganInput, setKeteranganInput] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [pengeluaranTersimpan, setPengeluaranTersimpan] = useState(false);

  const handleNav = (path: string) => navigate(path, { state: { role, username } });

  // ── Search & Cart Logic ──
  const filteredProduk = PRODUK_LIST.filter((p) =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (produk: { nama: string; harga: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.nama === produk.nama);
      if (existing) {
        return prev.map((i) => i.nama === produk.nama ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { nama: produk.nama, harga: produk.harga, qty: 1 }];
    });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const changeQty = (nama: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => i.nama === nama ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (nama: string) => {
    setCartItems((prev) => prev.filter((i) => i.nama !== nama));
  };

  const totalBayar = cartItems.reduce((sum, i) => sum + i.harga * i.qty, 0);

  const selesaikanTransaksi = () => {
    if (cartItems.length === 0) return;
    setTransaksiSelesai(true);
    setTimeout(() => {
      setCartItems([]);
      setTransaksiSelesai(false);
    }, 2500);
  };

  // ── Pengeluaran Logic ──
  const formatRupiah = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? Number(num).toLocaleString("id-ID") : "";
  };

  const simpanPengeluaran = () => {
    if (!keteranganInput || !totalInput) return;
    setPengeluaranTersimpan(true);
    setTimeout(() => {
      setKeteranganInput("");
      setTotalInput("");
      setActiveCategory("pembelian");
      setPengeluaranTersimpan(false);
    }, 2500);
  };

  return (
    <div className="login-wrapper">
      <div className="dash">
        {/* ════════ SIDEBAR ════════ */}
        <Sidebar activePage="/catat-transaksi" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Kasir & Pencatatan</div>
                <div className="topbar-sub">Catat penjualan dan pengeluaran harian</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-search">
                <span>🔍</span> Cari barang, transaksi, atau laporan
              </div>
              {isOwner && <span className="topbar-badge">AI API Ready</span>}
              <button className="topbar-btn outline" onClick={() => handleNav("/input-stok")}>+ Stok</button>
            </div>
          </header>

          {/* Content */}
          <div className="dash-content">
            <div className="tab-switcher" style={{ marginBottom: "20px" }}>
              <button
                className={`tab-btn ${activeTab === "penjualan" ? "active" : ""}`}
                onClick={() => setActiveTab("penjualan")}
              >
                🛒 Penjualan
              </button>
              <button
                className={`tab-btn ${activeTab === "pengeluaran" ? "active" : ""}`}
                onClick={() => setActiveTab("pengeluaran")}
              >
                💸 Pengeluaran
              </button>
            </div>

            <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              {/* LEFT COLUMN */}
              <div className="panel-box" style={{ padding: "20px" }}>
                {activeTab === "penjualan" ? (
                  <>
                    {/* Success banner */}
                    {transaksiSelesai && (
                      <div style={{ background: "var(--forest)", color: "#fff", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        ✅ Transaksi berhasil dicatat! Keranjang direset.
                      </div>
                    )}

                    <div className="panel-header-row" style={{ marginBottom: "20px" }}>
                      <div>
                        <div className="panel-title-text" style={{ fontSize: "16px" }}>Keranjang Penjualan</div>
                      </div>
                    </div>

                    <div className="manual-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>TANGGAL</label>
                        <input type="date" className="form-input" defaultValue={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>METODE BAYAR</label>
                        <select className="form-input" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer" }}>
                          <option>Tunai</option>
                          <option>Transfer</option>
                          <option>QRIS</option>
                          <option>Debit</option>
                        </select>
                      </div>
                      {/* Search with dropdown */}
                      <div className="form-group manual-form-full" style={{ gridColumn: "1 / -1", position: "relative" }}>
                        <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>CARI BARANG</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ketik nama barang untuk mencari..."
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                          onFocus={() => setShowDropdown(true)}
                          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }}
                        />
                        {showDropdown && searchQuery && filteredProduk.length > 0 && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, maxHeight: "200px", overflowY: "auto" }}>
                            {filteredProduk.map((p) => (
                              <button
                                key={p.nama}
                                onMouseDown={() => addToCart(p)}
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: "13px" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <span style={{ fontWeight: "600", color: "var(--ink)" }}>{p.nama}</span>
                                <span style={{ color: "var(--forest)", fontWeight: "700", fontSize: "12px" }}>{fmt(p.harga)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {showDropdown && searchQuery && filteredProduk.length === 0 && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", padding: "14px", fontSize: "13px", color: "var(--muted)", zIndex: 100 }}>
                            Barang tidak ditemukan.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cart table */}
                    <div className="table-responsive">
                      <table className="riwayat-table">
                        <thead>
                          <tr>
                            <th>BARANG</th>
                            <th>HARGA</th>
                            <th style={{ textAlign: "center" }}>QTY</th>
                            <th style={{ textAlign: "right" }}>SUBTOTAL</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "24px", fontSize: "13px" }}>
                                Belum ada barang. Cari dan tambahkan barang di atas.
                              </td>
                            </tr>
                          ) : (
                            cartItems.map((item) => (
                              <tr key={item.nama}>
                                <td><b>{item.nama}</b></td>
                                <td style={{ color: "var(--muted)" }}>{fmt(item.harga)}</td>
                                <td style={{ textAlign: "center" }}>
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                    <button onClick={() => changeQty(item.nama, -1)} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontWeight: "bold", display: "grid", placeItems: "center" }}>−</button>
                                    <span style={{ fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                                    <button onClick={() => changeQty(item.nama, 1)} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontWeight: "bold", display: "grid", placeItems: "center" }}>+</button>
                                  </div>
                                </td>
                                <td style={{ textAlign: "right", fontWeight: "700" }}>{fmt(item.harga * item.qty)}</td>
                                <td style={{ textAlign: "center" }}>
                                  <button onClick={() => removeItem(item.nama)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>✕</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "16px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>TOTAL BAYAR</div>
                        <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--ink)" }}>{fmt(totalBayar)}</div>
                      </div>
                      <button
                        onClick={selesaikanTransaksi}
                        disabled={cartItems.length === 0}
                        style={{ padding: "12px 24px", borderRadius: "8px", border: "none", background: cartItems.length === 0 ? "rgba(0,0,0,0.1)" : "var(--forest)", color: cartItems.length === 0 ? "var(--muted)" : "#fff", fontSize: "13px", fontWeight: "700", cursor: cartItems.length === 0 ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                      >
                        Selesaikan Transaksi
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Pengeluaran Success */}
                    {pengeluaranTersimpan && (
                      <div style={{ background: "var(--forest)", color: "#fff", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        ✅ Pengeluaran berhasil disimpan! Form direset.
                      </div>
                    )}

                    <div className="panel-header-row" style={{ marginBottom: "20px" }}>
                      <div>
                        <div className="panel-title-text" style={{ fontSize: "16px" }}>Form Pengeluaran</div>
                      </div>
                    </div>

                    <div className="manual-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>TANGGAL</label>
                        <input type="date" className="form-input" defaultValue={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>METODE BAYAR</label>
                        <select className="form-input" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer" }}>
                          <option>Tunai</option>
                          <option>Transfer</option>
                          <option>QRIS</option>
                          <option>Debit</option>
                        </select>
                      </div>
                    </div>

                    <label className="form-label" style={{ display: "block", marginBottom: "10px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>KATEGORI PENGELUARAN</label>
                    <div className="category-pills" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                      {kategoriList.map(cat => {
                        const iconMatch = cat.label.match(/^([^ ]+)\s+(.+)$/);
                        const icon = iconMatch ? iconMatch[1] : "";
                        const label = iconMatch ? iconMatch[2] : cat.label;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                              padding: "6px 14px", borderRadius: "20px",
                              border: activeCategory === cat.id ? "1.5px solid var(--red)" : "1px solid rgba(0,0,0,0.1)",
                              background: activeCategory === cat.id ? "var(--red2)" : "transparent",
                              fontSize: "12px", fontWeight: "700", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: "6px"
                            }}
                          >
                            <span style={{ fontSize: "14px", opacity: activeCategory === cat.id ? 1 : 0.7 }}>{icon}</span>
                            <span style={{ color: activeCategory === cat.id ? "var(--red)" : "var(--ink)" }}>{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="form-group" style={{ marginBottom: "20px" }}>
                      <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>NAMA / KETERANGAN PENGELUARAN</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Bayar listrik bulan Mei, gaji karyawan, dll"
                        value={keteranganInput}
                        onChange={(e) => setKeteranganInput(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: "32px" }}>
                      <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>TOTAL PENGELUARAN</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", fontWeight: "800", color: "var(--muted)" }}>Rp</span>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="0"
                          value={totalInput}
                          onChange={(e) => setTotalInput(formatRupiah(e.target.value))}
                          style={{ width: "100%", padding: "14px 14px 14px 38px", borderRadius: "8px", border: "1.5px solid rgba(0,0,0,0.12)", background: "#fff", fontSize: "20px", fontWeight: "900", color: "var(--red)" }}
                        />
                      </div>
                    </div>

                    <div style={{ borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={simpanPengeluaran}
                        disabled={!keteranganInput || !totalInput}
                        style={{ padding: "13px 28px", borderRadius: "8px", border: "none", background: (!keteranganInput || !totalInput) ? "rgba(0,0,0,0.1)" : "var(--forest)", color: (!keteranganInput || !totalInput) ? "var(--muted)" : "#fff", fontSize: "14px", fontWeight: "700", cursor: (!keteranganInput || !totalInput) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" }}
                      >
                        💾 Simpan Pengeluaran
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="panel-box" style={{ padding: "20px" }}>
                {activeTab === "penjualan" ? (
                  <>
                    <div className="panel-title-text" style={{ fontSize: "16px", marginBottom: "4px" }}>Ringkasan Kasir</div>
                    <div className="panel-desc-text" style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "24px" }}>Terlihat oleh karyawan.</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
                        <div style={{ background: "var(--gold2)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>💰</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)", marginBottom: "2px" }}>Penjualan shift ini</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Rp 1.240.000 dari 37 transaksi</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "16px" }}>
                        <div style={{ background: "var(--green2)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🧾</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)", marginBottom: "2px" }}>Transaksi terakhir</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>14:23 • Tunai • Rp 130.000</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ background: "var(--cream2)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📦</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)", marginBottom: "2px" }}>Stok otomatis berkurang</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Setiap transaksi mengurangi stok barang.</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="panel-title-text" style={{ marginBottom: "4px" }}>Ringkasan Pengeluaran</div>
                    <div className="panel-desc-text" style={{ marginBottom: "20px", fontSize: "12px", color: "var(--muted)" }}>Bulan ini</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                      {ringkasanPengeluaran.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div className={`access-icon ${item.iconClass}`} style={{ width: "36px", height: "36px", borderRadius: "8px", display: "grid", placeItems: "center", fontSize: "16px", background: "rgba(0,0,0,0.04)" }}>
                            {item.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>{item.label}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>{item.desc}</div>
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: "bold" }}>{item.amount}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Pengeluaran<br/>Bulan Ini</div>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: "var(--red)" }}>Rp 14.400.000</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatatTransaksiPage;
