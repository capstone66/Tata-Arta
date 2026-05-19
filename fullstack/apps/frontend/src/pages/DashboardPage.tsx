import React from 'react';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import type { SummaryData, Transaction, StockAlert, Role } from '../types';

interface DashboardPageProps {
  role: Role;
}

const mockSummaryData: SummaryData[] = [
  { id: '1', label: 'Omset Hari Ini', value: 'Rp 1,24jt', sub: '↑ 8,2% vs kemarin', trend: 'up', icon: '💰', color: 'green' },
  { id: '2', label: 'Transaksi', value: '37', sub: '↑ 5 transaksi', trend: 'up', icon: '🛒', color: 'gold' },
  { id: '3', label: 'Stok Aktif', value: '284', sub: '3 item kritis', trend: 'down', icon: '📦', color: 'blue' },
  { id: '4', label: 'Pengeluaran', value: 'Rp 8,7jt', sub: '↑ 12% bulan ini', trend: 'down', icon: '📉', color: 'red' },
];

const mockTransactions: Transaction[] = [
  { id: 't1', name: 'Beras Premium 5kg', qty: 2, total: 'Rp 130rb', status: 'Selesai' },
  { id: 't2', name: 'Minyak Goreng 2L', qty: 3, total: 'Rp 87rb', status: 'Selesai' },
  { id: 't3', name: 'Indomie Goreng ×10', qty: 10, total: 'Rp 35rb', status: 'Selesai' },
  { id: 't4', name: 'Aqua 600ml', qty: 6, total: 'Rp 24rb', status: 'Proses' },
];

const mockStocks: StockAlert[] = [
  { id: 's1', name: 'Beras Medium 5kg', category: 'Sembako', remaining: 2, status: 'kritis', icon: '🌾' },
  { id: 's2', name: 'Aqua 600ml (krat)', category: 'Minuman', remaining: 3, status: 'kritis', icon: '🥤' },
  { id: 's3', name: 'Indomie Soto', category: 'Sembako', remaining: 8, status: 'peringatan', icon: '🍜' },
  { id: 's4', name: 'Sabun Lifebuoy', category: 'Kebersihan', remaining: 24, status: 'normal', icon: '🧴' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ role }) => {
  // Only using role here as an example to satisfy typescript unused variables 
  console.log('Current role in dashboard:', role);
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Dashboard</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Ringkasan performa toko hari ini — Senin, 28 April 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-transparent border border-cream-3 text-ink-2 rounded-lg py-[5px] px-[10px] text-[11px] font-medium font-sans cursor-pointer hover:bg-cream-2 transition-colors">
            📅 April 2026
          </button>
          <button className="bg-gold-light text-gold border border-[#F0D090] rounded-lg py-[5px] px-[10px] text-[11px] font-medium font-sans cursor-pointer transition-colors">
            📥 Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px] mb-[20px]">
        {mockSummaryData.map((data) => (
          <SummaryCard key={data.id} data={data} />
        ))}
      </div>

      {/* Main Grid 6-4 */}
      <div className="grid grid-cols-1 md:grid-cols-[6fr_4fr] gap-4 mb-4">
        {/* Sales Chart Section */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold text-ink">Omset 7 Hari Terakhir</div>
              <div className="text-[11px] text-ink-3 mt-[2px]">Pemasukan vs Pengeluaran</div>
            </div>
            <div className="flex gap-3 text-[10px] text-ink-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-leaf inline-block"></span>Masuk
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-gold inline-block"></span>Keluar
              </span>
            </div>
          </div>
          
          <div className="flex items-end gap-[5px] h-[120px] px-[2px]">
            {[
              { day: '22/4', a: '62%', b: '44%' },
              { day: '23/4', a: '78%', b: '50%' },
              { day: '24/4', a: '52%', b: '38%' },
              { day: '25/4', a: '92%', b: '56%' },
              { day: '26/4', a: '68%', b: '58%' },
              { day: '27/4', a: '100%', b: '46%' },
              { day: '28/4', a: '74%', b: '34%' },
            ].map((chartData, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="flex items-end gap-[2px] flex-1 w-full justify-center">
                  <div className="rounded-t-[4px] flex-1 min-w-[8px] max-w-[18px] transition-opacity duration-200 cursor-pointer hover:opacity-75 bg-leaf" style={{ height: chartData.a }}></div>
                  <div className="rounded-t-[4px] flex-1 min-w-[8px] max-w-[18px] transition-opacity duration-200 cursor-pointer hover:opacity-75 bg-gold" style={{ height: chartData.b }}></div>
                </div>
                <div className="text-[9px] text-ink-3 mt-1 font-mono">{chartData.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Laba Kotor & Metode Bayar */}
        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-cream-3 rounded-[14px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-ink">Laba Kotor Bulan Ini</div>
            </div>
            <div className="font-mono text-[24px] font-medium text-leaf">Rp 8,2jt</div>
            <div className="text-[11px] text-ink-3 mt-1">Margin 23,6% · ↑11,4% vs Maret</div>
            <div className="bg-cream-2 rounded-[20px] h-[5px] overflow-hidden mt-[10px]">
              <div className="h-full rounded-[20px] bg-leaf w-[72%]"></div>
            </div>
            <div className="text-[10px] text-ink-3 mt-1">Target: Rp 11,4jt (72%)</div>
          </div>

          <div className="bg-surface border border-cream-3 rounded-[14px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-ink">Metode Bayar</div>
            </div>
            <div className="flex items-center gap-3 py-[6px]">
              <div className="flex-1">
                <div className="text-[12px] font-medium text-ink mb-1">Tunai</div>
                <div className="bg-cream-2 rounded-[20px] h-[5px] overflow-hidden">
                  <div className="h-full rounded-[20px] bg-leaf w-[58%]"></div>
                </div>
              </div>
              <div className="font-mono text-[11px] font-medium text-ink">58%</div>
            </div>
            <div className="flex items-center gap-3 py-[6px]">
              <div className="flex-1">
                <div className="text-[12px] font-medium text-ink mb-1">Transfer</div>
                <div className="bg-cream-2 rounded-[20px] h-[5px] overflow-hidden">
                  <div className="h-full rounded-[20px] bg-gold w-[27%]"></div>
                </div>
              </div>
              <div className="font-mono text-[11px] font-medium text-ink">27%</div>
            </div>
            <div className="flex items-center gap-3 py-[6px]">
              <div className="flex-1">
                <div className="text-[12px] font-medium text-ink mb-1">QRIS</div>
                <div className="bg-cream-2 rounded-[20px] h-[5px] overflow-hidden">
                  <div className="h-full rounded-[20px] bg-red w-[15%]"></div>
                </div>
              </div>
              <div className="font-mono text-[11px] font-medium text-ink">15%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid 5-5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Transaksi Terbaru */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold text-ink">Transaksi Terbaru</div>
            <span className="text-[11px] text-leaf cursor-pointer font-medium hover:underline">Lihat semua</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Barang</th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Qty</th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Total</th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-cream">
                    <td className={`py-[10px] px-3 text-ink-2 align-middle ${idx !== mockTransactions.length - 1 ? 'border-b border-cream-2' : ''} font-medium text-ink`}>{t.name}</td>
                    <td className={`py-[10px] px-3 text-ink-2 align-middle ${idx !== mockTransactions.length - 1 ? 'border-b border-cream-2' : ''}`}>{t.qty}</td>
                    <td className={`py-[10px] px-3 text-ink-2 align-middle ${idx !== mockTransactions.length - 1 ? 'border-b border-cream-2' : ''} font-mono text-[11px] text-ink-3`}>{t.total}</td>
                    <td className={`py-[10px] px-3 text-ink-2 align-middle ${idx !== mockTransactions.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      <span className={`inline-flex items-center py-[2px] px-2 rounded-[20px] text-[10px] font-semibold ${t.status === 'Selesai' ? 'bg-leaf-pale text-[#2A6A10]' : 'bg-gold-light text-gold'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stok Kritis */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold text-ink">⚠ Stok Kritis</div>
            <span className="text-[11px] text-leaf cursor-pointer font-medium hover:underline">+ Restock</span>
          </div>
          
          <div className="flex flex-col">
            {mockStocks.map((stock, idx) => {
              const getBgColor = () => {
                if (stock.status === 'kritis') return 'bg-red-light';
                if (stock.status === 'peringatan') return 'bg-gold-light';
                return 'bg-leaf-pale';
              };
              
              const getValColor = () => {
                if (stock.status === 'kritis') return 'text-red';
                if (stock.status === 'peringatan') return 'text-gold';
                return 'text-leaf';
              };

              return (
                <div key={stock.id} className={`flex items-center gap-3 py-[9px] ${idx !== mockStocks.length - 1 ? 'border-b border-cream-2' : ''}`}>
                  <div className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[16px] shrink-0 ${getBgColor()}`}>
                    {stock.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[12.5px] font-medium text-ink">{stock.name}</div>
                    <div className="text-[10px] text-ink-3 mt-[1px]">{stock.category}</div>
                  </div>
                  <div className={`font-mono text-[13px] font-medium ${getValColor()}`}>
                    {stock.status === 'normal' ? `Normal ${stock.remaining}` : `Sisa ${stock.remaining}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
