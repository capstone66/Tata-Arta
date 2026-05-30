import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import "./LoginPage.css"; // Reuse the same CSS as LoginPage

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.status === "success" || response.status === 201) {
        // Redirect to login page after successful registration
        navigate("/");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errors) {
          // If Zod validation errors from backend
          const firstErrorKey = Object.keys(data.errors)[0];
          setErrorMsg(data.errors[firstErrorKey][0]);
        } else {
          setErrorMsg(data.message || "Gagal mendaftar. Silakan coba lagi.");
        }
      } else {
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan backend menyala.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <section id="login" className="login">
        <div className="login-left">
          <div className="brand">
            <div className="logo">TA</div>
            <div>
              <div className="wordmark">
                Tata<em>Arta</em>
              </div>
              <div className="tag">Aplikasi keuangan, stok, dan AI insight untuk UMKM</div>
            </div>
          </div>
          <div className="hero">
            <h1>
              Mulai kelola usaha dengan <span>sistem pintar dan modern.</span>
            </h1>
            <p>
              Daftar sekarang sebagai Owner. TataArta memberikan kontrol penuh pada usaha Anda mulai dari 
              stok, transaksi, hingga laporan keuangan cerdas.
            </p>
            <div className="hero-grid">
              <div className="hero-tile">
                <b>Real-time</b>
                <span>Pantau data dari mana saja</span>
              </div>
              <div className="hero-tile">
                <b>Praktis</b>
                <span>Pencatatan kasir dan stok mudah</span>
              </div>
              <div className="hero-tile">
                <b>Cerdas</b>
                <span>AI Insight siap bantu usahamu</span>
              </div>
            </div>
          </div>
          <div className="login-note"></div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Daftar Akun Baru</h2>

            {errorMsg && (
              <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="label">Nama Lengkap / Nama Toko</div>
              <input
                type="text"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama"
                required
              />

              <div className="label" style={{ marginTop: "18px" }}>Alamat Email</div>
              <input
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: owner@bisnis.com"
                required
              />

              <div className="label" style={{ marginTop: "18px" }}>Password</div>
              <input
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
              />

              <button type="submit" className="login-btn" disabled={isLoading} style={{ marginTop: "32px" }}>
                {isLoading ? "Memproses..." : "Daftar Sekarang →"}
              </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>
              Sudah punya akun? <Link to="/" style={{ color: "var(--forest)", fontWeight: "700", textDecoration: "none" }}>Masuk di sini</Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
