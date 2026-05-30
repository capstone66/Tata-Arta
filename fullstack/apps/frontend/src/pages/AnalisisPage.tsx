import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
import "./AnalisisPage.css";
type Role = "owner" | "karyawan";

const AnalisisPage = () => {
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
        <Sidebar activePage="/analisis" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Analisis Penjualan</div>
                <div className="topbar-sub">Produk terlaris dan tren penjualan</div>
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
                    <h1 className="content-title">Analisis Penjualan</h1>
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div className="analisis-grid">

                  {/* Left: Top Products */}
                  <div className="analisis-card">
                    <div className="analisis-card-title">Top Produk Terlaris</div>
                    <div className="analisis-card-subtitle">Berdasarkan jumlah terjual bulan ini.</div>

                    <div className="top-product-list">
                      <div className="top-product-item">
                        <div className="rank-badge rank-1">1</div>
                        <div className="product-info">
                          <div className="product-name">Indomie Goreng</div>
                          <div className="product-sold">1.240 pcs terjual</div>
                        </div>
                        <div className="product-revenue">Rp 4,34 jt</div>
                      </div>

                      <div className="top-product-item">
                        <div className="rank-badge rank-2">2</div>
                        <div className="product-info">
                          <div className="product-name">Aqua 600ml</div>
                          <div className="product-sold">980 pcs terjual</div>
                        </div>
                        <div className="product-revenue">Rp 3,92 jt</div>
                      </div>

                      <div className="top-product-item">
                        <div className="rank-badge rank-3">3</div>
                        <div className="product-info">
                          <div className="product-name">Beras Medium 5kg</div>
                          <div className="product-sold">320 pcs terjual</div>
                        </div>
                        <div className="product-revenue">Rp 19,8 jt</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Kategori Terbaik Chart */}
                  <div className="analisis-card">
                    <div className="analisis-card-title">Kategori Terbaik</div>
                    <div className="analisis-card-subtitle">Kategori dengan kontribusi terbesar.</div>

                    <div className="chart-container">
                      <div className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: "140px", background: "var(--forest)" }}></div>
                      </div>
                      <div className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: "100px", background: "#2563eb" }}></div>
                      </div>
                      <div className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: "80px", background: "#d97706" }}></div>
                      </div>
                      <div className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: "60px", background: "#65a30d" }}></div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-around" }}>
                      <div className="chart-label">Sembako</div>
                      <div className="chart-label">Minuman</div>
                      <div className="chart-label">Snack</div>
                      <div className="chart-label">Kebersihan</div>
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

export default AnalisisPage;
