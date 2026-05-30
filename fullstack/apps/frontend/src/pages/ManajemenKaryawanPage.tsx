import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../lib/axios";
import "./DashboardPage.css";
import "./KatalogPage.css"; // Reuse table styling

const ManajemenKaryawanPage = () => {
  const location = useLocation();
  const state = location.state as { role: "owner" | "karyawan"; username: string } | null;

  // Protect route
  if (!state || state.role !== "owner") {
    return <Navigate to="/" replace />;
  }

  const { role, username } = state;

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Dummy data states for UI (because no GET /children API yet)
  const [karyawanList, setKaryawanList] = useState([
    { id: "1", name: "Budi Santoso", email: "budi@toko.com", role: "Karyawan" },
    { id: "2", name: "Siti Aminah", email: "siti@toko.com", role: "Karyawan" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const response = await axiosInstance.post("/auth/children", {
        name,
        email,
        password,
      });

      if (response.data.status === "success" || response.status === 201) {
        setMsg({ text: "Karyawan berhasil didaftarkan!", type: "success" });
        
        // Add to dummy list for visual feedback
        setKaryawanList([
          ...karyawanList,
          { id: Date.now().toString(), name, email, role: "Karyawan" }
        ]);

        // Reset form
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          setMsg({ text: data.errors[firstErrorKey][0], type: "error" });
        } else {
          setMsg({ text: data.message || "Gagal mendaftarkan karyawan.", type: "error" });
        }
      } else {
        setMsg({ text: "Tidak dapat terhubung ke server.", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="dash">
        <Sidebar activePage="/karyawan" role={role} username={username} />

        <div className="dash-main">
          <header className="dash-topbar">
            <div className="topbar-left">
              <div>
                <div className="topbar-title">Manajemen Karyawan</div>
                <div className="topbar-sub">Kelola akses staf dan operasional tokomu</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-search">
                <span>🔍</span> Cari karyawan...
              </div>
              <button className="topbar-btn primary">
                ⚙️ Pengaturan Akses
              </button>
            </div>
          </header>

          <div className="dash-content">
            <div className="content-header">
              <h1 className="content-title">Manajemen Karyawan</h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginTop: "16px" }}>
              
              {/* Formulir Pendaftaran */}
              <div className="katalog-card" style={{ padding: "24px", alignSelf: "start" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "8px", color: "var(--ink)", letterSpacing: "-0.01em" }}>Daftarkan Karyawan Baru</h2>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px", lineHeight: 1.5 }}>Akun ini akan memiliki akses terbatas untuk transaksi dan stok.</p>

                {msg && (
                  <div style={{ 
                    background: msg.type === "success" ? "#dcfce7" : "#fee2e2", 
                    color: msg.type === "success" ? "#166534" : "#b91c1c", 
                    padding: "12px", 
                    borderRadius: "8px", 
                    fontSize: "13px", 
                    marginBottom: "16px", 
                    fontWeight: "700" 
                  }}>
                    {msg.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>NAMA LENGKAP</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="Misal: Andi"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>ALAMAT EMAIL</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="andi@toko.com"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "10px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>PASSWORD SEMENTARA</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="Minimal 8 karakter"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                      width: "100%", 
                      justifyContent: "center", 
                      marginTop: "12px", 
                      padding: "14px", 
                      border: "none",
                      borderRadius: "10px",
                      background: "var(--forest)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    {isLoading ? "Memproses..." : "+ Buat Akun Karyawan"}
                  </button>
                </form>
              </div>

              {/* Daftar Karyawan (Table) */}
              <div className="katalog-card">
                <div style={{ padding: "20px 20px 16px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: "4px" }}>Daftar Karyawan Aktif</h2>
                  <p style={{ fontSize: "13px", color: "var(--muted)" }}>Karyawan yang terdaftar di bawah jaringan tokomu.</p>
                </div>
                
                <table className="katalog-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th>Karyawan</th>
                      <th>Email</th>
                      <th>Hak Akses</th>
                      <th style={{ textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {karyawanList.map((karyawan) => (
                      <tr key={karyawan.id}>
                        <td>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--forest)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
                            {karyawan.name.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td><b>{karyawan.name}</b></td>
                        <td style={{ color: "var(--muted)" }}>{karyawan.email}</td>
                        <td>
                          <span className="katalog-badge normal">
                            {karyawan.role}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {karyawanList.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--muted)", fontSize: "13px" }}>Belum ada karyawan terdaftar</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManajemenKaryawanPage;
