import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.data.status === "success") {
        const { role, email: userEmail } = response.data.user;
        // Map backend role to frontend role representation if needed
        // Assuming backend returns "USER" for Karyawan or "OWNER" for Owner
        const uiRole = role === "USER" ? "karyawan" : "owner";
        
        // Navigate to dashboard
        navigate("/dashboard", { state: { role: uiRole, username: userEmail.split("@")[0] } });
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errors) {
          // If Zod validation errors from backend
          const firstErrorKey = Object.keys(data.errors)[0];
          setErrorMsg(data.errors[firstErrorKey][0]);
        } else {
          // Normal error message
          setErrorMsg(data.message || "Gagal masuk. Periksa kembali email dan password.");
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
              Kelola toko lebih rapi, <span>ambil keputusan lebih cepat.</span>
            </h1>
            <p>
              TataArta membantu owner melihat kondisi usaha, mengontrol stok, mencatat transaksi, dan
              mendapat rekomendasi AI yang mudah dipahami.
            </p>
            <div className="hero-grid">
              <div className="hero-tile">
                <b>85.41%</b>
                <span>Akurasi deteksi produk cepat laku</span>
              </div>
              <div className="hero-tile">
                <b>89.50%</b>
                <span>Akurasi prioritas restock</span>
              </div>
              <div className="hero-tile">
                <b>0.0179</b>
                <span>MAE prediksi profit</span>
              </div>
            </div>
          </div>
          <div className="login-note"></div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Masuk ke TataArta</h2>

            {errorMsg && (
              <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="label">Alamat Email</div>
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
                placeholder="Masukkan password"
                required
              />

              <button type="submit" className="login-btn" disabled={isLoading} style={{ marginTop: "32px" }}>
                {isLoading ? "Memproses..." : "Masuk ke Dashboard →"}
              </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--muted)" }}>
              Belum punya akun? <Link to="/register" style={{ color: "var(--forest)", fontWeight: "700", textDecoration: "none" }}>Daftar sekarang</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
