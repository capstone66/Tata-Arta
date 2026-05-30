import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardPage.css";
// Reuse layout styling
import "./InputStokPage.css";
// Specific input stok styling

type Role = "owner" | "karyawan";
type TabState = "ocr" | "manual";

const InputStokPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { role?: Role; username?: string } | null;
  const role: Role = state?.role || "owner"; // fallback to owner for easier viewing if direct visit
  const username = state?.username || "Budi Santoso";
  const isOwner = role === "owner";

  const [activeTab, setActiveTab] = useState<TabState>("ocr");
  const [jumlahMasuk, setJumlahMasuk] = useState(0);

  const handleNav = (path: string) => {
    navigate(path, { state: { role, username } });
  };

  const riwayatData = [
    { tgl: "28/4", barang: "Beras Premium", qty: 50, total: "Rp 2,9jt", sumber: "OCR", badgeClass: "ocr" },
    { tgl: "27/4", barang: "Minyak 2L", qty: 48, total: "Rp 1,25jt", sumber: "Manual", badgeClass: "manual" },
    { tgl: "26/4", barang: "Aqua Krat", qty: 20, total: "Rp 560rb", sumber: "OCR", badgeClass: "ocr" },
    { tgl: "25/4", barang: "Indomie Goreng", qty: 120, total: "Rp 384rb", sumber: "Manual", badgeClass: "manual" },
    { tgl: "24/4", barang: "Gula Pasir 1kg", qty: 30, total: "Rp 435rb", sumber: "OCR", badgeClass: "ocr" },
  ];

  return (
    <div className="login-wrapper">
      <div className="dash">
        {/* ════════ SIDEBAR ════════ */}
        <Sidebar activePage="/input-stok" role={role} username={username} />

        {/* ════════ MAIN ════════ */}
        <div className="dash-main">
          {/* Top Bar */}
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Input Stok</div>
                <div className="topbar-sub">Catat barang masuk atau scan nota</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-search">
                <span>🔍</span> Cari barang, transaksi...
              </div>
              {isOwner && <span className="topbar-badge">AI API Ready</span>}
              <button className="topbar-btn primary" onClick={() => handleNav("/catat-transaksi")}>+ Transaksi</button>
            </div>
          </header>

          {/* Content */}
          <div className="dash-content">
            {/* Content Header */}
            <div className="content-header" style={{ marginBottom: "16px" }}>
              <div>
                <h1 className="content-title">Input Stok</h1>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === "ocr" ? "active" : ""}`}
                onClick={() => setActiveTab("ocr")}
              >
                📠 OCR Nota
              </button>
              <button
                className={`tab-btn ${activeTab === "manual" ? "active" : ""}`}
                onClick={() => setActiveTab("manual")}
              >
                🖍️ Input Manual
              </button>
            </div>

            {/* 2-Column Layout */}
            <div className="input-stok-grid">

              {activeTab === "ocr" ? (
                <>
                  {/* Left Column OCR */}
                  <div className="panel-box">
                    <div>
                      <div className="panel-header-row" style={{ alignItems: "center" }}>
                        <div>
                          <div className="panel-title-text">📠 Scan Nota / Faktur</div>
                          
                        </div>
                        <div style={{ background: "#eaf0fb", color: "#315ea8", padding: "6px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>POST /ocr/scan-receipt</div>
                      </div>

                      <div className="ocr-upload-area" style={{ padding: "64px 24px", marginTop: "24px", background: "var(--cream2)" }}>
                        <div className="ocr-icon" style={{ fontSize: "36px" }}>📷</div>
                        <div className="ocr-title" style={{ fontSize: "15px" }}>Klik untuk unggah atau foto nota</div>
                        <div className="ocr-desc" style={{ maxWidth: "100%", marginBottom: "20px" }}>
                          
                        </div>
                        <div className="ocr-actions" style={{ display: "flex", justifyContent: "center", width: "100%", gap: "12px" }}>
                          <button className="ocr-btn primary" style={{ background: "var(--forest)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>📷 Ambil Foto</button>
                          <button className="ocr-btn secondary" style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--line)", padding: "10px 18px", borderRadius: "10px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>📁 Upload File</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column OCR Konfirmasi */}
                  <div className="panel-box">
                    <div>
                      <div className="panel-header-row" style={{ marginBottom: "24px" }}>
                        <div>
                          <div className="panel-title-text" style={{ fontSize: "16px" }}>Konfirmasi Data OCR</div>
                          
                        </div>
                      </div>

                      <div className="manual-form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                          <label className="form-label">TANGGAL NOTA</label>
                          <input type="date" className="form-input" defaultValue={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">SUPPLIER</label>
                          <input type="text" className="form-input" defaultValue="UD. Maju Jaya" />
                        </div>
                        <div className="form-group manual-form-full" style={{ gridColumn: "1 / -1" }}>
                          <label className="form-label">BARANG 1</label>
                          <select className="form-input" style={{ appearance: "auto", width: "100%" }}>
                            <option>Beras Premium 5kg — 50 pcs @ Rp 58.000</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">JUMLAH</label>
                          <input type="text" className="form-input" defaultValue="50" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">HARGA BELI / PCS</label>
                          <input type="text" className="form-input" defaultValue="58000" />
                        </div>

                        <div className="form-group manual-form-full" style={{ gridColumn: "1 / -1" }}>
                          <label className="form-label">TOTAL NOTA</label>
                          <input type="text" className="form-input" defaultValue="2900000" style={{ fontWeight: "bold", color: "var(--green)", background: "rgba(66, 133, 244, 0.05)" }} />
                        </div>

                        <div className="form-group manual-form-full" style={{ gridColumn: "1 / -1" }}>
                          <label className="form-label">CATATAN</label>
                          <textarea className="form-input" defaultValue="Data sudah cocok dengan nota supplier." style={{ minHeight: "60px", width: "100%" }}></textarea>
                        </div>
                      </div>

                      <div className="form-actions" style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
                        <button className="form-btn primary" style={{ background: "var(--forest)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>💾 Simpan Stok Masuk</button>
                        <button className="form-btn secondary" style={{ background: "#fff", border: "1px solid var(--line)", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Edit Hasil OCR</button>
                        <button className="form-btn secondary" style={{ background: "rgba(255,0,0,0.08)", color: "var(--red)", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Batalkan</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Left Column Manual */}
                  <div className="panel-box">
                    <div>
                      <div className="panel-header-row" style={{ marginBottom: "32px" }}>
                        <div>
                          <div className="panel-title-text">🖍️ Input Manual Barang Masuk</div>
                          <div className="panel-desc-text">Dipakai jika nota tidak jelas atau OCR gagal</div>
                        </div>
                      </div>

                      <div className="manual-form-grid">
                        <div className="form-group">
                          <label className="form-label">Tanggal Masuk</label>
                          <input type="date" className="form-input" defaultValue={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Supplier</label>
                          <input type="text" className="form-input" defaultValue="UD. Maju Jaya" />
                        </div>
                        <div className="form-group manual-form-full">
                          <label className="form-label">Nama Barang</label>
                          <input type="text" className="form-input" defaultValue="Beras Premium 5kg" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Jumlah Masuk</label>
                          <div className="number-input-wrap">
                            <button className="number-btn" onClick={() => setJumlahMasuk(Math.max(0, jumlahMasuk - 1))}>−</button>
                            <input
                              type="text"
                              className="number-value"
                              value={jumlahMasuk}
                              onChange={(e) => setJumlahMasuk(Number(e.target.value) || 0)}
                            />
                            <button className="number-btn" onClick={() => setJumlahMasuk(jumlahMasuk + 1)}>+</button>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Harga Beli / Pcs</label>
                          <input type="text" className="form-input" defaultValue="58000" />
                          <div className="form-hint">💡 Harga terakhir: Rp 58.000</div>
                        </div>

                        <div className="form-group manual-form-full">
                          <label className="form-label">Total Pembelian</label>
                          <input type="text" className="form-input readonly" readOnly value="Rp 0" />
                        </div>

                        <div className="form-group manual-form-full">
                          <label className="form-label">Catatan</label>
                          <textarea className="form-input" placeholder="Contoh: barang diterima lengkap, harga sesuai nota."></textarea>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button className="form-btn primary">💾 Simpan Stok Masuk</button>
                        <button className="form-btn secondary">Reset</button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column History */}
                  <div className="panel-box" style={{ padding: "20px" }}>
                    <div className="panel-header-row" style={{ marginBottom: "16px" }}>
                      <div>
                        <div className="panel-title-text" style={{ fontSize: "14px" }}>Riwayat Barang Masuk</div>
                        <div className="panel-desc-text" style={{ fontSize: "11px" }}>Transaksi stok terbaru</div>
                      </div>
                    </div>

                    <table className="riwayat-table">
                      <thead>
                        <tr>
                          <th>TGL</th>
                          <th>BARANG</th>
                          <th>QTY</th>
                          <th>TOTAL</th>
                          <th>SUMBER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riwayatData.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.tgl}</td>
                            <td><b>{item.barang}</b></td>
                            <td>{item.qty}</td>
                            <td>{item.total}</td>
                            <td>
                              <span className={`sumber-badge ${item.badgeClass}`}>
                                {item.sumber}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputStokPage;
