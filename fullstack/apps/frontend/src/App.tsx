import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
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
          <Route path="katalog" element={<div className="p-4">Katalog Barang Page</div>} />
          <Route path="input-barang" element={<div className="p-4">Input Stok Page</div>} />
          <Route path="transaksi" element={<div className="p-4">Catat Transaksi Page</div>} />
          <Route path="laporan" element={<div className="p-4">Laporan Penjualan Page</div>} />
          <Route path="keuangan" element={<div className="p-4">Keuangan Page</div>} />
          <Route path="analisis" element={<div className="p-4">Analisis Penjualan Page</div>} />
          <Route path="prediksi" element={<div className="p-4">Prediksi Harga Page</div>} />
          <Route path="rekomendasi" element={<div className="p-4">Rekomendasi Stok Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
