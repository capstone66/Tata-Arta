import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
import "./KatalogPage.css";
type Role = "owner" | "karyawan";

const LaporanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: Role; username?: string } | null;
  const role: Role = state?.role || "owner";
  const username = state?.username || "Budi Santoso";
  const isOwner = role === "owner";

  const handleNav = (path: string) => navigate(path, { state: { role, username } });

  const laporanData = [
    { no: "#1042", tanggal: "28/04 14:23", item: "Beras Premium 5kg", metode: "Tunai", total: "Rp 130.000", status: "Selesai" },
    { no: "#1041", tanggal: "28/04 13:50", item: "Minyak, Gula", metode: "QRIS", total: "Rp 143.000", status: "Selesai" },
    { no: "#1040", tanggal: "28/04 12:15", item: "Aqua Krat", metode: "Transfer", total: "Rp 72.000", status: "Selesai" },
  ];

  return (
    <div className="login-wrapper">
      <div className="dash">
        {/* ════════ SIDEBAR ════════ */}
        <Sidebar activePage="/laporan" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Laporan Penjualan</div>
                <div className="topbar-sub">Riwayat transaksi toko</div>
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
            {/* Header */}
            <div className="content-header">
              <div>
                <h1 className="content-title">Laporan Penjualan</h1>
              </div>
              <div className="header-actions">
                <button
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "8px 18px",
                    borderRadius: "10px",
                    border: "1.5px solid #b98212",
                    background: "#fff",
                    color: "#b98212",
                    cursor: "pointer",
                  }}
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Table Card */}
            <div className="katalog-card">
              <table className="katalog-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Item</th>
                    <th>Metode</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanData.map((row, i) => (
                    <tr key={i}>
                      <td style={{ color: "var(--muted)" }}>{row.no}</td>
                      <td>{row.tanggal}</td>
                      <td><b>{row.item}</b></td>
                      <td>{row.metode}</td>
                      <td>{row.total}</td>
                      <td>
                        <span className="katalog-badge normal">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;
