import React from "react";
import { useNavigate } from "react-router-dom";

type Role = "owner" | "karyawan";

interface SidebarProps {
  activePage: string;
  role: Role;
  username: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, role, username }) => {
  const navigate = useNavigate();
  const isOwner = role === "owner";

  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    navigate("/");
  };

  const handleNav = (path: string) => {
    navigate(path, { state: { role, username } });
  };

  return (
    <aside className="dash-sidebar">
      <div>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">TA</div>
          <div>
            <div className="sidebar-wordmark">
              Tata<em>Arta</em>
            </div>
            <div className="sidebar-app-label">UMKM Finance App</div>
          </div>
        </div>

        {/* Role Badge */}
        <div className={`role-badge ${role}`}>
          {isOwner ? "🔒 Owner · Akses penuh" : "🔓 Karyawan · Akses terbatas"}
        </div>

        {/* Nav: Utama */}
        <div className="nav-section-label">Utama</div>
        <button className={`nav-item ${activePage === "/dashboard" ? "active" : ""}`} onClick={() => handleNav("/dashboard")}>
          <span className="nav-icon">📊</span> Dashboard
        </button>
        <button className={`nav-item ${activePage === "/katalog" ? "active" : ""}`} onClick={() => handleNav("/katalog")}>
          <span className="nav-icon">📦</span> Katalog Barang
        </button>
        <button className={`nav-item ${activePage === "/input-stok" ? "active" : ""}`} onClick={() => handleNav("/input-stok")}>
          <span className="nav-icon">📥</span> Input Stok
        </button>
        <button className={`nav-item ${activePage === "/catat-transaksi" ? "active" : ""}`} onClick={() => handleNav("/catat-transaksi")}>
          <span className="nav-icon">🧾</span> Catat Transaksi
        </button>
        <button className={`nav-item ${activePage === "/laporan" ? "active" : ""}`} onClick={() => handleNav("/laporan")}>
          <span className="nav-icon">📋</span> Laporan Penjualan
        </button>

        {/* Nav: Owner section */}
        {isOwner ? (
          <>
            <div className="nav-section-label">Owner</div>
            <button className={`nav-item ${activePage === "/keuangan" ? "active" : ""}`} onClick={() => handleNav("/keuangan")}>
              <span className="nav-icon">💰</span> Keuangan
            </button>
            <button className={`nav-item ${activePage === "/karyawan" ? "active" : ""}`} onClick={() => handleNav("/karyawan")}>
              <span className="nav-icon">👥</span> Manajemen Karyawan
            </button>
            <button className={`nav-item ${activePage === "/analisis" ? "active" : ""}`} onClick={() => handleNav("/analisis")}>
              <span className="nav-icon">📈</span> Analisis Penjualan
            </button>
            <button className={`nav-item ${activePage === "/ai-insight" ? "active" : ""}`} onClick={() => handleNav("/ai-insight")}>
              <span className="nav-icon">🤖</span> AI Insight
              <span className="lock-badge" style={{ background: "rgba(185,130,18,0.25)", color: "#ffe08a" }}>AI</span>
            </button>
          </>
        ) : (
          <>
            <div className="nav-section-label">Terkunci untuk Karyawan</div>
            <button className="nav-item locked" onClick={() => handleNav("/keuangan")}>
              <span className="nav-icon">💰</span> Keuangan
              <span className="lock-badge">Owner</span>
            </button>
            <button className="nav-item locked" onClick={() => handleNav("/karyawan")}>
              <span className="nav-icon">👥</span> Manajemen Karyawan
              <span className="lock-badge">Owner</span>
            </button>
            <button className="nav-item locked" onClick={() => handleNav("/analisis")}>
              <span className="nav-icon">📈</span> Analisis Penjualan
              <span className="lock-badge">Owner</span>
            </button>
            <button className="nav-item locked" onClick={() => handleNav("/ai-insight")}>
              <span className="nav-icon">🤖</span> AI Insight
              <span className="lock-badge">Owner</span>
            </button>
          </>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{username}</div>
            <div className="user-role-label">
              {isOwner ? "Owner · Akses penuh" : "Karyawan · Akses operasional"}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
