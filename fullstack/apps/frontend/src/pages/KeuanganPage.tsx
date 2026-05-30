import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
type Role = "owner" | "karyawan";

const KeuanganPage = () => {
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
        <Sidebar activePage="/keuangan" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Keuangan Owner</div>
                <div className="topbar-sub">Pemasukan, pengeluaran, dan laba</div>
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
                <div className="content-header">
                  <div>
                    <h1 className="content-title">Keuangan Owner</h1>
                  </div>
                  <div className="header-actions">
                    <button style={{
                      fontSize: "12px", fontWeight: 700, padding: "8px 18px",
                      borderRadius: "10px", border: "1.5px solid #b98212",
                      background: "#fff", color: "#b98212", cursor: "pointer",
                    }}>
                      Export Laporan Keuangan
                    </button>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="metric-grid cols-3" style={{ marginBottom: "24px" }}>
                  {/* Pemasukan */}
                  <div className="metric-card" style={{ borderTop: "3px solid var(--green)" }}>
                    <div className="metric-label">Pemasukan Bulan Ini</div>
                    <div className="metric-value">Rp 34,7 jt</div>
                    <div className="metric-detail positive">↑ Naik 11,4%</div>
                    <div className="metric-icon">📈</div>
                  </div>

                  {/* Pengeluaran */}
                  <div className="metric-card" style={{ borderTop: "3px solid var(--red)" }}>
                    <div className="metric-label">Pengeluaran</div>
                    <div className="metric-value">Rp 26,5 jt</div>
                    <div className="metric-detail">Mayoritas pembelian stok</div>
                    <div className="metric-icon">📤</div>
                  </div>

                  {/* Laba Bersih */}
                  <div className="metric-card" style={{ borderTop: "3px solid var(--green)" }}>
                    <div className="metric-label">Laba Bersih</div>
                    <div className="metric-value">Rp 8,2 jt</div>
                    <div className="metric-detail positive">Margin 23,6%</div>
                    <div className="metric-icon">✅</div>
                  </div>
                </div>

                {/* Analisis Arus Kas */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Analisis Arus Kas</div>
                      <div className="panel-sub">Membantu Owner memahami kondisi uang masuk dan keluar.</div>
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(98,178,70,0.08)",
                    border: "1px solid rgba(98,178,70,0.25)",
                    borderLeft: "4px solid var(--green)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>
                      💡 Insight untuk Owner
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                      Pembelian stok minggu ini meningkat, tetapi omset akhir pekan juga naik. Prioritaskan restock produk fast moving dengan margin sedang–tinggi.
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

export default KeuanganPage;
