import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
type Role = "owner" | "karyawan";

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: Role; username?: string } | null;
  const role: Role = state?.role || "karyawan";
  const username = state?.username || "Budi Santoso";
  const isOwner = role === "owner";

  const handleNav = (path: string) => {
    navigate(path, { state: { role, username } });
  };

  // Chart data (simulated)
  const chartData = [
    { day: "Sen", green: 55, gold: 30 },
    { day: "Sel", green: 72, gold: 42 },
    { day: "Rab", green: 40, gold: 25 },
    { day: "Kam", green: 60, gold: 35 },
    { day: "Jum", green: 85, gold: 50 },
    { day: "Sab", green: 95, gold: 55 },
    { day: "Min", green: 30, gold: 18 },
  ];

  return (
    <div className="login-wrapper">
      <div className="dash">
        {/* ════════ SIDEBAR ════════ */}
        <Sidebar activePage="/dashboard" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Dashboard</div>
                <div className="topbar-sub">Ringkasan kondisi toko hari ini</div>
              </div>
            </div>
            <div className="topbar-right">
              {isOwner ? (
                <>
                  <div className="topbar-search">
                    <span>🔍</span> Cari barang, transaksi, atau laporan
                  </div>
                  <span className="topbar-badge">AI API Ready</span>
                  <button className="topbar-btn outline" onClick={() => handleNav("/input-stok")}>+ Stok</button>
                  <button className="topbar-btn primary" onClick={() => handleNav("/catat-transaksi")}>+ Transaksi</button>
                </>
              ) : (
                <>
                  <div className="topbar-search">
                    <span>🔍</span> Cari barang, transaksi, atau laporan
                  </div>
                  <button className="topbar-btn outline" onClick={() => handleNav("/input-stok")}>+ Stok</button>
                  <button className="topbar-btn primary" onClick={() => handleNav("/catat-transaksi")}>+ Transaksi</button>
                </>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="dash-content">
            {/* Content Header */}
            <div className="content-header">
              <div>
                <h1 className="content-title">Dashboard Usaha</h1>
                <p className="content-subtitle">
                  {isOwner
                    ? "Pantau omset, laba, transaksi, dan kondisi stok tanpa perlu membuka banyak laporan."
                    : "Pantau transaksi, kondisi stok, dan ringkasan operasional toko hari ini."}
                </p>
              </div>
              <div className="header-actions">
                <div className="date-badge">🗓️ April 2026</div>
                {isOwner && <button className="export-btn">📥 Export</button>}
              </div>
            </div>

            {/* ── Metric Cards ── */}
            {isOwner ? (
              <>
                <div className="metric-grid cols-4">
                  <div className="metric-card">
                <div className="metric-label">Omset Hari Ini</div>
                <div className="metric-value">Rp 1,24 jt</div>
                <div className="metric-detail positive">↑ Naik 8,2% dibanding kemarin</div>
                <div className="metric-icon">💰</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Transaksi Hari Ini</div>
                <div className="metric-value">37</div>
                <div className="metric-detail">Rata-rata Rp 33.500 / transaksi</div>
                <div className="metric-icon">🧾</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Stok Perlu Dicek</div>
                <div className="metric-value">12</div>
                <div className="metric-detail">↓ 3 barang prioritas restock</div>
                <div className="metric-icon">📦</div>
              </div>
              {isOwner && (
                <div className="metric-card">
                  <div className="metric-label">Laba Bulan Ini</div>
                  <div className="metric-value">Rp 8,2 jt</div>
                  <div className="metric-detail">Margin 23,8%</div>
                  <div className="metric-icon">📊</div>
                </div>
              )}
            </div>

            {/* ── Middle: Chart + Insights ── */}
            <div className="middle-grid">
              {/* Chart */}
              <div className="card-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      {isOwner ? "Arus Kas 7 Hari Terakhir" : "Arus Omset 7 Hari Terakhir"}
                    </div>
                    <div className="panel-sub">
                      {isOwner ? "Perbandingan pemasukan dan pembelian stok." : "Perbandingan pemasukan harian."}
                    </div>
                  </div>
                  <span className="panel-badge sehat">Sehat</span>
                </div>
                <div className="bar-chart">
                  {chartData.map((d) => (
                    <div className="bar-group" key={d.day}>
                      <div className="bars">
                        <div className="bar green" style={{ height: `${d.green}%` }} />
                        {isOwner && <div className="bar gold" style={{ height: `${d.gold}%` }} />}
                      </div>
                      <span className="bar-label">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="card-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      {isOwner ? "AI Insight Hari Ini" : "Info Stok Hari Ini"}
                    </div>
                    <div className="panel-sub">
                      {isOwner ? "Bahasa sederhana untuk pemilik toko." : "Barang yang perlu perhatian."}
                    </div>
                  </div>
                  <span className={`panel-badge ${isOwner ? "ai" : "sehat"}`}>
                    {isOwner ? "AI" : "Sehat"}
                  </span>
                </div>
                <div className="insight-list">
                  {isOwner ? (
                    <>
                      <div className="insight-item">
                        <div className="insight-icon green">📦</div>
                        <div>
                          <div className="insight-title">Restock 3 barang dulu</div>
                          <div className="insight-desc">
                            Beras Medium, Aqua 600ml, dan Indomie Soto diprediksi cepat habis.
                          </div>
                        </div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon gold">🔥</div>
                        <div>
                          <div className="insight-title">Produk paling cepat laku</div>
                          <div className="insight-desc">
                            Indomie Goreng masih menjadi produk fast moving minggu ini.
                          </div>
                        </div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon red">📉</div>
                        <div>
                          <div className="insight-title">Margin rendah</div>
                          <div className="insight-desc">
                            Beberapa produk laris punya profit rendah. Owner disarankan cek harga jual.
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="insight-item">
                        <div className="insight-icon green">📦</div>
                        <div>
                          <div className="insight-title">Restock 3 barang dulu</div>
                          <div className="insight-desc">
                            Beras Medium, Aqua 600ml, dan Indomie Soto diprediksi cepat habis.
                          </div>
                        </div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon gold">⚠️</div>
                        <div>
                          <div className="insight-title">Beras Medium — Stok Kritis</div>
                          <div className="insight-desc">
                            Sisa 8 pcs. Segera laporkan ke owner untuk restock.
                          </div>
                        </div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon green">🔥</div>
                        <div>
                          <div className="insight-title">Indomie Goreng paling laku</div>
                          <div className="insight-desc">
                            Produk fast moving hari ini. Pantau stok secara rutin.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Bottom: Transactions + Access ── */}
            <div className="bottom-grid">
              {/* Transactions Table */}
              <div className="card-panel">
                <div className="tx-table-header">
                  <div>
                    <div className="panel-title">Transaksi Terbaru</div>
                    <div className="panel-sub">
                      {isOwner
                        ? "Data yang bisa dilihat Owner dan Karyawan."
                        : "Riwayat penjualan yang bisa dilihat karyawan."}
                    </div>
                  </div>
                  <button className="view-all-btn">Lihat semua</button>
                </div>
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Produk</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>14:23</td>
                      <td><b>Beras Premium 5kg</b></td>
                      <td>Rp 130.000</td>
                      <td><span className="status-badge selesai">Selesai</span></td>
                    </tr>
                    <tr>
                      <td>14:10</td>
                      <td><b>Minyak Goreng 2L</b></td>
                      <td>Rp 87.000</td>
                      <td><span className="status-badge selesai">Selesai</span></td>
                    </tr>
                    <tr>
                      <td>13:55</td>
                      <td><b>Aqua 600ml</b></td>
                      <td>Rp 24.000</td>
                      <td><span className="status-badge diproses">Diproses</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Hak Akses */}
              <div className="card-panel">
                <div className="panel-title" style={{ marginBottom: 4 }}>Hak Akses Aktif</div>
                <div className="panel-sub" style={{ marginBottom: 18 }}>
                  {isOwner
                    ? "Menjelaskan fitur yang bisa dipakai sesuai peran."
                    : "Fitur yang tersedia untuk karyawan."}
                </div>

                {isOwner ? (
                  <>
                    <div className="access-item">
                      <div className="access-icon green">✅</div>
                      <div>
                        <div className="access-title">Akses penuh</div>
                        <div className="access-desc">
                          Owner dapat melihat dashboard, laporan, keuangan, analisis, dan AI insight.
                        </div>
                      </div>
                    </div>
                    <div className="access-item">
                      <div className="access-icon green">✅</div>
                      <div>
                        <div className="access-title">Data sensitif terlihat</div>
                        <div className="access-desc">
                          Laba, pengeluaran, margin, dan rekomendasi bisnis tersedia untuk Owner.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="access-item">
                      <div className="access-icon green">✅</div>
                      <div>
                        <div className="access-title">Akses operasional</div>
                        <div className="access-desc">
                          Karyawan bisa mencatat transaksi, input stok, melihat katalog, dan laporan harian.
                        </div>
                      </div>
                    </div>
                    <div className="access-item">
                      <div className="access-icon red">🔒</div>
                      <div>
                        <div className="access-title">Data Owner dikunci</div>
                        <div className="access-desc">
                          Keuangan, analisis penjualan, dan AI insight tidak ditampilkan untuk karyawan.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* ── Karyawan Metric Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: "16px", right: "16px", height: "4px", background: "var(--forest)", borderRadius: "0 0 4px 4px" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", marginTop: "4px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>PENJUALAN HARI INI</div>
                      <div style={{ fontSize: "16px", color: "rgba(0,0,0,0.2)" }}>🛒</div>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--ink)", marginBottom: "4px" }}>37</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Transaksi tercatat</div>
                  </div>
                  
                  <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: "16px", right: "16px", height: "4px", background: "var(--blue)", borderRadius: "0 0 4px 4px" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", marginTop: "4px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>BARANG MASUK</div>
                      <div style={{ fontSize: "16px", color: "rgba(0,0,0,0.2)" }}>📦</div>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--ink)", marginBottom: "4px" }}>4</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Input stok tercatat</div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: "16px", right: "16px", height: "4px", background: "var(--red)", borderRadius: "0 0 4px 4px" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", marginTop: "4px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>STOK MENIPIS</div>
                      <div style={{ fontSize: "16px", color: "rgba(0,0,0,0.2)" }}>⚠️</div>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--ink)", marginBottom: "4px" }}>3</div>
                    <div style={{ fontSize: "12px", color: "var(--red)", fontWeight: "bold" }}>Laporkan ke Owner</div>
                  </div>
                </div>

                {/* ── Karyawan Bottom Layout ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Left: Tugas Karyawan */}
                  <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Tugas Karyawan Hari Ini</div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>Checklist operasional</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <div style={{ background: "var(--green2)", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✅</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Catat transaksi penjualan</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Masukkan produk, jumlah, dan metode bayar.</div>
                        </div>
                        <button className="tugas-btn" onClick={() => handleNav("/catat-transaksi")}>Buka</button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <div style={{ background: "rgba(0,0,0,0.05)", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📷</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Scan nota barang masuk</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Gunakan OCR lalu cek ulang sebelum simpan.</div>
                        </div>
                        <button className="tugas-btn" onClick={() => handleNav("/input-stok")}>Buka</button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ background: "var(--cream2)", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📦</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Cek katalog dan stok</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Karyawan bisa melihat stok, tapi tidak melihat profit.</div>
                        </div>
                        <button className="tugas-btn" onClick={() => handleNav("/katalog")}>Buka</button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Transaksi Terakhir */}
                  <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--ink)" }}>Transaksi Terakhir</div>
                      <div style={{ background: "var(--blue2)", color: "var(--blue)", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>Operasional</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Indomie ×10</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>14:23 · Tunai</div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)" }}>Rp 35rb</div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Gula 1kg ×4</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>14:18 · QRIS</div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)" }}>Rp 56rb</div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)", marginBottom: "4px" }}>Aqua Krat ×1</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>14:05 · Transfer</div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--ink)" }}>Rp 36rb</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
