import React from 'react';
import type { Product } from '../types';

const mockProducts: Product[] = [
  { id: '1', sku: 'BRS-001', name: 'Beras Premium 5kg', category: 'Sembako', categoryColor: 'green', buyPrice: 'Rp 58rb', sellPrice: 'Rp 65rb', stock: 42, status: 'Normal' },
  { id: '2', sku: 'BRS-002', name: 'Beras Medium 5kg', category: 'Sembako', categoryColor: 'green', buyPrice: 'Rp 48rb', sellPrice: 'Rp 55rb', stock: 2, status: 'Kritis' },
  { id: '3', sku: 'MIN-001', name: 'Aqua 600ml (krat)', category: 'Minuman', categoryColor: 'blue', buyPrice: 'Rp 28rb', sellPrice: 'Rp 36rb', stock: 3, status: 'Kritis' },
  { id: '4', sku: 'SBK-001', name: 'Minyak Goreng 2L', category: 'Sembako', categoryColor: 'green', buyPrice: 'Rp 26rb', sellPrice: 'Rp 29rb', stock: 56, status: 'Normal' },
  { id: '5', sku: 'SNK-003', name: 'Indomie Goreng', category: 'Sembako', categoryColor: 'gold', buyPrice: 'Rp 2,8rb', sellPrice: 'Rp 3,5rb', stock: 120, status: 'Normal' },
  { id: '6', sku: 'SNK-011', name: 'Gula Pasir 1kg', category: 'Sembako', categoryColor: 'green', buyPrice: 'Rp 14rb', sellPrice: 'Rp 16,5rb', stock: 38, status: 'Normal' },
];

export const KatalogBarangPage: React.FC = () => {
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Katalog Barang</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">284 item aktif dalam 6 kategori</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-transparent border border-cream-3 text-ink-2 rounded-lg py-[7px] px-[14px] text-[12px] font-medium font-sans cursor-pointer hover:bg-cream-2 transition-colors">
            Export
          </button>
          <button className="bg-forest text-leaf-light rounded-lg py-[7px] px-[14px] text-[12px] font-medium font-sans cursor-pointer hover:bg-forest-rim transition-colors">
            + Tambah Barang
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-surface border border-cream-3 rounded-[14px] p-4 mb-[14px]">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2 bg-cream-2 border border-cream-3 rounded-lg py-[6px] px-3 text-[12px] text-ink-3 w-[200px] font-sans">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Cari nama / SKU..." 
              className="bg-transparent border-none outline-none w-full text-ink"
            />
          </div>
          
          <select className="bg-cream-2 border border-cream-3 rounded-lg py-[7px] px-3 text-[12px] text-ink-2 outline-none cursor-pointer w-[140px] font-sans hover:border-leaf focus:border-leaf focus:bg-surface transition-all">
            <option>Semua Kategori</option>
            <option>Sembako</option>
            <option>Minuman</option>
            <option>Snack</option>
          </select>

          <select className="bg-cream-2 border border-cream-3 rounded-lg py-[7px] px-3 text-[12px] text-ink-2 outline-none cursor-pointer w-[140px] font-sans hover:border-leaf focus:border-leaf focus:bg-surface transition-all">
            <option>Semua Status</option>
            <option>Normal</option>
            <option>Kritis</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">SKU</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Nama Barang</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Kategori</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">H. Beli</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">H. Jual</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Stok</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Status</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((p, idx) => {
                const getCategoryBadgeClass = (color: string) => {
                  switch (color) {
                    case 'green': return 'bg-leaf-pale text-[#2A6A10]';
                    case 'blue': return 'bg-blue-light text-blue';
                    case 'gold': return 'bg-gold-light text-gold';
                    case 'red': return 'bg-red-light text-red';
                    default: return 'bg-cream-2 text-ink-3';
                  }
                };

                return (
                  <tr key={p.id} className="hover:bg-cream">
                    <td className={`py-[10px] px-3 font-mono text-[11px] text-ink-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      {p.sku}
                    </td>
                    <td className={`py-[10px] px-3 font-medium text-ink align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      {p.name}
                    </td>
                    <td className={`py-[10px] px-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      <span className={`inline-flex items-center py-[2px] px-2 rounded-[20px] text-[10px] font-semibold ${getCategoryBadgeClass(p.categoryColor)}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className={`py-[10px] px-3 font-mono text-[11px] text-ink-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      {p.buyPrice}
                    </td>
                    <td className={`py-[10px] px-3 font-mono text-[11px] text-ink-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      {p.sellPrice}
                    </td>
                    <td className={`py-[10px] px-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''} ${p.status === 'Kritis' ? 'text-red font-semibold' : 'text-ink-2'}`}>
                      {p.stock}
                    </td>
                    <td className={`py-[10px] px-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      <span className={`inline-flex items-center py-[2px] px-2 rounded-[20px] text-[10px] font-semibold ${p.status === 'Normal' ? 'bg-leaf-pale text-[#2A6A10]' : 'bg-red-light text-red'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={`py-[10px] px-3 align-middle ${idx !== mockProducts.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      <button className="bg-transparent border border-cream-3 text-ink-2 rounded-lg py-[5px] px-[10px] text-[11px] font-medium font-sans cursor-pointer hover:bg-cream-2 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-[14px] pt-[14px] border-t border-cream-2 text-[11px] text-ink-3">
          <span>Menampilkan 1–6 dari 284 barang</span>
          <div className="flex gap-1">
            <button className="py-1 px-[10px] rounded-md border border-cream-3 bg-surface text-ink-2 text-[11px] font-sans cursor-pointer hover:bg-cream-2">←</button>
            <button className="py-1 px-[10px] rounded-md border border-forest bg-forest text-white text-[11px] font-sans cursor-pointer">1</button>
            <button className="py-1 px-[10px] rounded-md border border-cream-3 bg-surface text-ink-2 text-[11px] font-sans cursor-pointer hover:bg-cream-2">2</button>
            <button className="py-1 px-[10px] rounded-md border border-cream-3 bg-surface text-ink-2 text-[11px] font-sans cursor-default">...</button>
            <button className="py-1 px-[10px] rounded-md border border-cream-3 bg-surface text-ink-2 text-[11px] font-sans cursor-pointer hover:bg-cream-2">48</button>
            <button className="py-1 px-[10px] rounded-md border border-cream-3 bg-surface text-ink-2 text-[11px] font-sans cursor-pointer hover:bg-cream-2">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};
