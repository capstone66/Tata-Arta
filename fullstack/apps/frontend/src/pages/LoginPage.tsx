import { useState } from "react";

type Role = "owner" | "karyawan";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("owner");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Nama / Username tidak boleh kosong");
      return;
    }

    setIsLoading(true);

    // Simulate login — replace with actual API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Login:", { username, role: selectedRole });
    } catch {
      setError("Gagal masuk. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen min-h-dvh flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--color-forest)" }}
    >
      {/* ── Background Circles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full animate-blob1"
          style={{
            width: 400,
            height: 400,
            top: -100,
            right: -80,
            background: "var(--color-forest-rim)",
            opacity: 0.4,
          }}
        />
        <div
          className="absolute rounded-full animate-blob2"
          style={{
            width: 250,
            height: 250,
            bottom: -60,
            left: -50,
            background: "var(--color-forest-rim)",
            opacity: 0.3,
          }}
        />
        <div
          className="absolute rounded-full animate-blob3"
          style={{
            width: 120,
            height: 120,
            top: "40%",
            left: "20%",
            background: "var(--color-forest-rim)",
            opacity: 0.2,
          }}
        />
      </div>

      {/* ── Login Card ── */}
      <div className="relative z-10 w-full max-w-[380px] mx-4 animate-fadeInUp">
        <div
          className="rounded-[20px]"
          style={{
            background: "var(--color-cream)",
            padding: "44px 40px",
            boxShadow: "0 24px 60px rgba(0,0,0,.4)",
          }}
        >
          {/* Logo */}
          <header className="text-center mb-8">
            <h1
              className="font-serif leading-none select-none"
              style={{
                fontSize: 38,
                color: "var(--color-forest)",
                letterSpacing: "-1px",
              }}
            >
              Tata<em style={{ color: "var(--color-leaf)", fontStyle: "italic" }}>Arta</em>
            </h1>
            <p
              className="uppercase select-none"
              style={{
                fontSize: 10,
                color: "var(--color-ink3)",
                letterSpacing: "0.15em",
                marginTop: 4,
              }}
            >
              Rapi Keuangane &middot; Maju Usahane
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Username Input ── */}
            <div>
              <label
                htmlFor="username-input"
                className="block uppercase"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-ink3)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                Nama / Username
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Masukkan nama kamu"
                autoComplete="username"
                className="w-full outline-none transition-all duration-150"
                style={{
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${error ? "var(--color-red)" : "var(--color-cream3)"}`,
                  background: error ? "var(--color-red-light)" : "var(--color-cream2)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--color-ink)",
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = "var(--color-leaf)";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = "var(--color-cream3)";
                    e.currentTarget.style.background = "var(--color-cream2)";
                  }
                }}
              />
            </div>

            {/* ── Error Message ── */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 animate-shake"
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  background: "var(--color-red-light)",
                  border: "1px solid #f0c0c0",
                  borderRadius: 10,
                  fontSize: 11,
                  color: "var(--color-red)",
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            {/* ── Role Selection ── */}
            <div>
              <label
                className="block uppercase"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-ink3)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                  marginTop: 16,
                }}
              >
                Masuk sebagai
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Owner Card */}
                <button
                  id="role-owner"
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === "owner"}
                  onClick={() => setSelectedRole("owner")}
                  className="cursor-pointer text-center transition-all duration-150"
                  style={{
                    padding: "12px 10px",
                    borderRadius: 10,
                    border: `1.5px solid ${selectedRole === "owner" ? "var(--color-leaf)" : "var(--color-cream3)"}`,
                    background: selectedRole === "owner" ? "var(--color-leaf-pale)" : "var(--color-cream2)",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRole !== "owner") {
                      e.currentTarget.style.borderColor = "var(--color-leaf-light)";
                      e.currentTarget.style.background = "var(--color-leaf-pale)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRole !== "owner") {
                      e.currentTarget.style.borderColor = "var(--color-cream3)";
                      e.currentTarget.style.background = "var(--color-cream2)";
                    }
                  }}
                >
                  <span className="block" style={{ fontSize: 20, marginBottom: 4 }}>👑</span>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink2)" }}>
                    Owner
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-ink3)", marginTop: 2 }}>
                    Akses penuh
                  </div>
                </button>

                {/* Karyawan Card */}
                <button
                  id="role-karyawan"
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === "karyawan"}
                  onClick={() => setSelectedRole("karyawan")}
                  className="cursor-pointer text-center transition-all duration-150"
                  style={{
                    padding: "12px 10px",
                    borderRadius: 10,
                    border: `1.5px solid ${selectedRole === "karyawan" ? "var(--color-leaf)" : "var(--color-cream3)"}`,
                    background: selectedRole === "karyawan" ? "var(--color-leaf-pale)" : "var(--color-cream2)",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRole !== "karyawan") {
                      e.currentTarget.style.borderColor = "var(--color-leaf-light)";
                      e.currentTarget.style.background = "var(--color-leaf-pale)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRole !== "karyawan") {
                      e.currentTarget.style.borderColor = "var(--color-cream3)";
                      e.currentTarget.style.background = "var(--color-cream2)";
                    }
                  }}
                >
                  <span className="block" style={{ fontSize: 20, marginBottom: 4 }}>👤</span>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink2)" }}>
                    Karyawan
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-ink3)", marginTop: 2 }}>
                    Akses terbatas
                  </div>
                </button>
              </div>
            </div>

            {/* ── Submit Button ── */}
            <button
              id="login-button"
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                padding: 13,
                background: "var(--color-forest)",
                color: "var(--color-leaf-light)",
                border: "none",
                borderRadius: 10,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 600,
                marginTop: 24,
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "var(--color-forest-rim)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-forest)";
              }}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>Masuk ke TataArta →</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
