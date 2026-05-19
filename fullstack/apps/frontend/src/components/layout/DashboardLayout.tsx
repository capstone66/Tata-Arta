import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import type { Role } from '../../types';

interface DashboardLayoutProps {
  role: Role;
  userFullName: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, userFullName }) => {
  const location = useLocation();
  
  let title = "Dashboard";
  let subtitle = "Selamat pagi 👋";
  
  if (location.pathname.includes('/transaksi')) {
    title = "Catat Transaksi";
    subtitle = "";
  } else if (location.pathname.includes('/input-barang')) {
    title = "Input Stok";
    subtitle = "";
  } else if (location.pathname.includes('/katalog')) {
    title = "Katalog Barang";
    subtitle = "";
  } else if (location.pathname.includes('/laporan')) {
    title = "Laporan Penjualan";
    subtitle = "";
  } else if (location.pathname.includes('/keuangan')) {
    title = "Keuangan";
    subtitle = "";
  } else if (location.pathname.includes('/analisis')) {
    title = "Analisis Penjualan";
    subtitle = "";
  } else if (location.pathname.includes('/prediksi')) {
    title = "Prediksi Harga";
    subtitle = "";
  } else if (location.pathname.includes('/rekomendasi')) {
    title = "Rekomendasi Stok";
    subtitle = "";
  }
  
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} userFullName={userFullName} />
      
      <div className="ml-[var(--spacing-sidebar)] flex-1 flex flex-col min-h-screen">
        <TopNavbar title={title} subtitle={subtitle} />
        
        <main className="p-6 md:p-7 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
