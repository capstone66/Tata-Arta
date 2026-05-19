import React from 'react';
import { NavLink } from 'react-router-dom';
import type { Role, MenuItem } from '../../types';

interface SidebarProps {
  role: Role;
  userFullName: string;
}

const NAV_OWNER: MenuItem[] = [
  { id: 'section-1', label: '', section: 'Utama' },
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'section-2', label: '', section: 'Barang & Stok' },
  { id: 'katalog', icon: '📦', label: 'Katalog Barang' },
  { id: 'input-barang', icon: '⬇', label: 'Input Stok' },
  { id: 'section-3', label: '', section: 'Transaksi' },
  { id: 'transaksi', icon: '🛒', label: 'Catat Transaksi' },
  { id: 'laporan', icon: '📋', label: 'Laporan Penjualan' },
  { id: 'section-4', label: '', section: 'Keuangan & Analitik' },
  { id: 'keuangan', icon: '💹', label: 'Keuangan' },
  { id: 'analisis', icon: '📊', label: 'Analisis Penjualan' },
  { id: 'prediksi', icon: '🔮', label: 'Prediksi Harga', badge: 'AI' },
  { id: 'rekomendasi', icon: '💡', label: 'Rekomendasi Stok', badge: 'AI' },
];

const NAV_KARYAWAN: MenuItem[] = [
  { id: 'section-1', label: '', section: 'Utama' },
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'section-2', label: '', section: 'Barang & Stok' },
  { id: 'katalog', icon: '📦', label: 'Katalog Barang' },
  { id: 'input-barang', icon: '⬇', label: 'Input Stok' },
  { id: 'section-3', label: '', section: 'Transaksi' },
  { id: 'transaksi', icon: '🛒', label: 'Catat Transaksi' },
  { id: 'laporan', icon: '📋', label: 'Laporan Penjualan' },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, userFullName }) => {
  // ROLE-BASED RENDERING LOGIC:
  // 1. We define separate menu configurations (NAV_OWNER and NAV_KARYAWAN).
  // 2. Based on the 'role' prop passed to this component, we select the appropriate array.
  // 3. For 'karyawan', certain items have 'locked: true', which disables the link visually and functionally.
  const items = role === 'owner' ? NAV_OWNER : NAV_KARYAWAN;
  const initials = userFullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="w-[var(--spacing-sidebar)] bg-forest flex flex-col fixed top-0 left-0 h-screen z-50 overflow-hidden">
      <div className="pt-6 px-5 pb-[18px] border-b border-white/10">
        <div className="font-serif text-[22px] text-cream tracking-[-0.5px] leading-none">
          Tata<em className="text-leaf italic">Arta</em>
        </div>
        <div className="text-[9px] text-white/35 tracking-[0.14em] uppercase mt-[3px]">
          Aplikasi Keuangan UMKM
        </div>
        <div className={`inline-flex items-center gap-[5px] mt-[10px] py-[3px] px-[10px] rounded-full text-[10px] font-semibold tracking-[0.04em] ${role === 'owner' ? 'bg-gold-light text-gold' : 'bg-blue-light text-blue'}`}>
          {role === 'owner' ? '👑 Owner' : '👤 Karyawan'}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item, idx) => {
          if (item.section) {
            return (
              <div key={`sec-${idx}`} className="py-[10px] px-5 text-[9px] font-semibold text-white/30 tracking-[0.14em] uppercase">
                {item.section}
              </div>
            );
          }

          const baseClasses = "flex items-center gap-[10px] py-[9px] px-5 text-white/60 cursor-pointer text-[12.5px] font-normal transition-all duration-150 border-l-2 border-transparent relative";
          
          if (item.locked) {
            return (
              <div key={item.id} className={`${baseClasses} opacity-35 cursor-not-allowed hover:bg-white/5`}>
                <span className="text-[15px] w-[18px] text-center shrink-0">{item.icon}</span>
                {item.label}
                <span className="ml-auto text-[10px]">🔒</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) => 
                isActive 
                  ? `${baseClasses} bg-white/10 text-white border-l-leaf`
                  : `${baseClasses} hover:bg-white/5 hover:text-white`
              }
            >
              <span className="text-[15px] w-[18px] text-center shrink-0">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-leaf text-forest text-[9px] font-bold rounded-full py-[1px] px-[7px]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-5 border-t border-white/10">
        <div className="flex items-center gap-[10px]">
          <div className="w-8 h-8 rounded-full bg-forest-rim border-[1.5px] border-leaf flex items-center justify-center text-[12px] font-semibold text-leaf-light shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-[12px] font-medium text-cream">{userFullName}</div>
            <div className="text-[10px] text-white/35 mt-[1px]">
              {role === 'owner' ? 'Owner' : 'Karyawan'} — Toko Makmur
            </div>
          </div>
        </div>
        <button className="mt-[10px] w-full p-[7px] rounded-lg bg-white/5 border border-white/10 text-white/50 font-sans text-[11px] cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white/80">
          ← Keluar
        </button>
      </div>
    </aside>
  );
};
