import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
import "./AiInsightPage.css";
type Role = "owner" | "karyawan";

const AiInsightPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: Role; username?: string } | null;
  const role: Role = state?.role || "owner";
  const username = state?.username || "Budi Santoso";
  const isOwner = role === "owner";

  const handleNav = (path: string) => navigate(path, { state: { role, username } });

return (
    <div className="login-wrapper">
      <div className="dash">
        {/* ════════ SIDEBAR ════════ */}
        <Sidebar activePage="/ai-insight" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">AI Insight Center</div>
                <div className="topbar-sub">Rekomendasi restock, fast moving, dan profit</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-search">
                <span>🔍</span> Cari barang, transaksi, atau laporan
              </div>
              <span className="topbar-badge">AI API Ready</span>
              <button className="topbar-btn outline" onClick={() => handleNav("/input-stok")}>+ Stok</button>
              <button className="topbar-btn primary" onClick={() => handleNav("/catat-transaksi")}>+ Transaksi</button>
            </div>
          </header>

          {/* Content */}
          <div className="dash-content">
            {isOwner ? (
              // ── OWNER VIEW ──
              <>
                <div className="content-header" style={{ marginBottom: "24px" }}>
                  <div>
                    <h1 className="content-title">AI Insight Center</h1>
                  </div>
                  <div className="header-actions">
                    <button style={{
                      fontSize: "12px", fontWeight: 700, padding: "8px 18px",
                      borderRadius: "10px", border: "1.5px solid var(--forest)",
                      background: "var(--forest)", color: "#dff4cf", cursor: "pointer",
                    }}>
                      Refresh Insight
                    </button>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="metric-grid cols-3" style={{ marginBottom: "24px" }}>
                  <div className="metric-card" style={{ borderTop: "3px solid #6366f1" }}>
                    <div className="metric-label">FAST MOVING</div>
                    <div className="metric-value">85.41%</div>
                    <div className="metric-detail">Akurasi model klasifikasi</div>
                    <div className="metric-icon">🤖</div>
                  </div>

                  <div className="metric-card" style={{ borderTop: "3px solid #d97706" }}>
                    <div className="metric-label">RESTOCK PRIORITY</div>
                    <div className="metric-value">89.50%</div>
                    <div className="metric-detail">Akurasi prioritas restock</div>
                    <div className="metric-icon">📦</div>
                  </div>

                  <div className="metric-card" style={{ borderTop: "3px solid var(--green)" }}>
                    <div className="metric-label">PROFIT PREDICTION</div>
                    <div className="metric-value">0.0179</div>
                    <div className="metric-detail">MAE prediksi profit</div>
                    <div className="metric-icon">📈</div>
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div className="ai-grid">

                  {/* Left: Restock Table */}
                  <div className="ai-table-card">
                    <div className="ai-table-header">
                      <div>
                        <div className="ai-table-title">Rekomendasi Restock</div>
                        <div className="ai-table-subtitle">Urutan barang yang sebaiknya dibeli lebih dulu.</div>
                      </div>
                      <div className="ai-badge">AI</div>
                    </div>

                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th>Prioritas</th>
                          <th>Barang</th>
                          <th>Alasan</th>
                          <th>Saran</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="priority-badge priority-high">Tinggi</span></td>
                          <td><b>Beras Medium 5kg</b></td>
                          <td style={{ color: "var(--muted)" }}>Fast moving dan stok rendah</td>
                          <td style={{ color: "var(--muted)" }}>Restock 100 pcs</td>
                        </tr>
                        <tr>
                          <td><span className="priority-badge priority-high">Tinggi</span></td>
                          <td><b>Aqua 600ml</b></td>
                          <td style={{ color: "var(--muted)" }}>Permintaan tinggi akhir pekan</td>
                          <td style={{ color: "var(--muted)" }}>Restock 20 krat</td>
                        </tr>
                        <tr>
                          <td><span className="priority-badge priority-medium">Sedang</span></td>
                          <td><b>Indomie Soto</b></td>
                          <td style={{ color: "var(--muted)" }}>Stok mendekati minimum</td>
                          <td style={{ color: "var(--muted)" }}>Restock 80 pcs</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right: Decision Summary */}
                  <div className="decision-card-container">
                    <div style={{ padding: "0 4px" }}>
                      <div className="ai-table-title">Ringkasan Keputusan</div>
                      <div className="ai-table-subtitle">Kalimat yang bisa langsung dimengerti pemilik toko.</div>
                    </div>

                    <div className="decision-card decision-green">
                      <div className="decision-icon">✅</div>
                      <div>
                        <div className="decision-title">Fokus belanja stok minggu ini</div>
                        <div className="decision-desc">
                          Utamakan barang yang cepat laku dan stoknya rendah. Jangan menambah stok produk yang lambat laku kecuali ada permintaan khusus.
                        </div>
                      </div>
                    </div>

                    <div className="decision-card decision-yellow">
                      <div className="decision-icon">⚠️</div>
                      <div>
                        <div className="decision-title">Periksa harga jual produk laris</div>
                        <div className="decision-desc">
                          Beberapa produk fast moving memiliki margin rendah. Owner disarankan mengecek ulang harga jual atau supplier.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              // ── KARYAWAN VIEW (LOCKED) ──
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minHeight: "60vh",
              }}>
                <div style={{
                  background: "#fff",
                  border: "1px solid var(--line)",
                  borderRadius: "24px",
                  padding: "48px 40px",
                  textAlign: "center",
                  maxWidth: "420px",
                  width: "100%",
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>
                  <div style={{
                    fontFamily: "var(--serif)",
                    fontSize: "22px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    letterSpacing: "-0.02em",
                  }}>
                    Fitur ini khusus Owner
                  </div>
                  <p style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    marginBottom: "28px",
                  }}>
                    Karyawan hanya dapat menggunakan fitur operasional seperti catat transaksi, input stok, katalog, dan laporan harian. Data keuangan, analisis, dan AI insight hanya dapat dibuka oleh Owner.
                  </p>
                  <button
                    onClick={() => handleNav("/dashboard")}
                    style={{
                      background: "var(--forest)",
                      color: "#dff4cf",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsightPage;
