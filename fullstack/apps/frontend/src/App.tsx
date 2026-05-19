import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { KatalogBarangPage } from './pages/KatalogBarangPage';
import { InputStokPage } from './pages/InputStokPage';
import { CatatTransaksiPage } from './pages/CatatTransaksiPage';
import { LaporanPenjualanPage } from './pages/LaporanPenjualanPage';
import { KeuanganPage } from './pages/KeuanganPage';
import { AnalisisPenjualanPage } from './pages/AnalisisPenjualanPage';
import { PrediksiHargaPage } from './pages/PrediksiHargaPage';
import { RekomendasiStokPage } from './pages/RekomendasiStokPage';
import type { Role } from './types';

const App = () => {
  // Simulate fetching role from state/auth context
  // Set to 'karyawan' to test limited access or 'owner' for full access
  const userRole: Role = 'owner';
  const userName = 'Budi Santoso';

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard Layout as parent route */}
        <Route path="/" element={<DashboardLayout role={userRole} userFullName={userName} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard Route */}
          <Route path="dashboard" element={<DashboardPage role={userRole} />} />
          
          {/* Mock routes for other menu items to avoid 404s while clicking */}
          <Route path="katalog" element={<KatalogBarangPage />} />
          <Route path="input-barang" element={<InputStokPage />} />
          <Route path="transaksi" element={<CatatTransaksiPage />} />
          <Route path="laporan" element={<LaporanPenjualanPage />} />
          <Route path="keuangan" element={<KeuanganPage />} />
          <Route path="analisis" element={<AnalisisPenjualanPage />} />
          <Route path="prediksi" element={<PrediksiHargaPage />} />
          <Route path="rekomendasi" element={<RekomendasiStokPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
