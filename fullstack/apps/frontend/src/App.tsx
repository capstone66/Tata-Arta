import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ManajemenKaryawanPage from "./pages/ManajemenKaryawanPage";
import KatalogPage from "./pages/KatalogPage";
import InputStokPage from "./pages/InputStokPage";
import CatatTransaksiPage from "./pages/CatatTransaksiPage";
import LaporanPage from "./pages/LaporanPage";
import KeuanganPage from "./pages/KeuanganPage";
import AnalisisPage from "./pages/AnalisisPage";
import AiInsightPage from "./pages/AiInsightPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/karyawan" element={<ManajemenKaryawanPage />} />
        <Route path="/katalog" element={<KatalogPage />} />
        <Route path="/input-stok" element={<InputStokPage />} />
        <Route path="/catat-transaksi" element={<CatatTransaksiPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        <Route path="/keuangan" element={<KeuanganPage />} />
        <Route path="/analisis" element={<AnalisisPage />} />
        <Route path="/ai-insight" element={<AiInsightPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
