import React from 'react';

export const KeuanganPage: React.FC = () => {
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Keuangan</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Perhitungan pemasukan, pengeluaran, dan laba</p>
        </div>
        <div>
          <select className="p-[7px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[12px] font-sans font-medium outline-none focus:border-leaf focus:bg-surface cursor-pointer text-ink-2">
            <option>📅 April 2026</option>
            <option>📅 Maret 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-leaf"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Total Pemasukan</div>
            <div className="w-5 h-5 rounded-full bg-blue-light text-blue flex items-center justify-center text-[10px]">⬆</div>
          </div>
          <div className="font-mono text-[28px] font-medium text-ink leading-tight mb-1">
            Rp 34,7jt
          </div>
          <div className="text-[11px] font-medium text-leaf flex items-center gap-1">
            ↑ 11,4% vs Maret
          </div>
        </div>

        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-red"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Total Pengeluaran</div>
            <div className="w-5 h-5 rounded-full bg-blue-light text-blue flex items-center justify-center text-[10px]">⬇</div>
          </div>
          <div className="font-mono text-[28px] font-medium text-ink leading-tight mb-1">
            Rp 26,5jt
          </div>
          <div className="text-[11px] font-medium text-red flex items-center gap-1">
            ↑ 8,2% vs Maret
          </div>
        </div>

        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-gold"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Laba Bersih</div>
            <div className="w-5 h-5 rounded flex items-center justify-center text-[14px] bg-leaf-pale text-leaf border border-leaf/20">📈</div>
          </div>
          <div className="font-mono text-[28px] font-medium text-ink leading-tight mb-1">
            Rp 8,2jt
          </div>
          <div className="text-[11px] font-medium text-leaf flex items-center gap-1">
            Margin 23,6%
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Detail Pemasukan */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="text-[13px] font-semibold text-ink mb-4">Detail Pemasukan</div>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Sumber</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[120px]">Jumlah</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[80px]">Porsi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dashed border-cream-3">
                <td className="py-[12px] px-3 font-medium text-ink">Penjualan Tunai</td>
                <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">Rp 20,1jt</td>
                <td className="py-[12px] px-3">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    58%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-dashed border-cream-3">
                <td className="py-[12px] px-3 font-medium text-ink">Penjualan Transfer</td>
                <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">Rp 9,4jt</td>
                <td className="py-[12px] px-3">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-blue-light text-blue">
                    27%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-dashed border-cream-3">
                <td className="py-[12px] px-3 font-medium text-ink">Penjualan QRIS</td>
                <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">Rp 5,2jt</td>
                <td className="py-[12px] px-3">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-gold-light text-gold">
                    15%
                  </span>
                </td>
              </tr>
              <tr className="bg-leaf-pale">
                <td className="py-[12px] px-3 font-semibold text-ink rounded-l-lg">Total</td>
                <td className="py-[12px] px-3 font-mono text-[11px] font-semibold text-leaf">Rp 34,7jt</td>
                <td className="py-[12px] px-3 font-medium text-leaf rounded-r-lg">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detail Pengeluaran */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="text-[13px] font-semibold text-ink mb-4">Detail Pengeluaran</div>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Kategori</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[120px]">Jumlah</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[80px]">Porsi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dashed border-cream-3">
                <td className="py-[12px] px-3 font-medium text-ink">Pembelian Stok</td>
                <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">Rp 22,4jt</td>
                <td className="py-[12px] px-3">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-red-light text-red">
                    84%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-dashed border-cream-3">
                <td className="py-[12px] px-3 font-medium text-ink">Operasional</td>
                <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">Rp 2,8jt</td>
                <td className="py-[12px] px-3">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-gold-light text-gold">
                    11%
                  </span>
                </td>
              </tr>
              <tr className="border-b border-dashed border-cream-3">
                <td className="py-[12px] px-3 font-medium text-ink">Barang Rusak/Susut</td>
                <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">Rp 1,3jt</td>
                <td className="py-[12px] px-3">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-cream border border-cream-3 text-ink-3">
                    5%
                  </span>
                </td>
              </tr>
              <tr className="bg-red-light/50">
                <td className="py-[12px] px-3 font-semibold text-ink rounded-l-lg">Total</td>
                <td className="py-[12px] px-3 font-mono text-[11px] font-semibold text-red">Rp 26,5jt</td>
                <td className="py-[12px] px-3 font-medium text-red rounded-r-lg">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-surface border border-cream-3 rounded-[14px] p-5 min-h-[300px] flex flex-col">
        <div className="text-[13px] font-semibold text-ink mb-6">Arus Kas Harian — April 2026</div>
        
        {/* Mock Chart Area */}
        <div className="flex-1 flex items-end relative border-b border-cream-3 pb-2 mt-auto min-h-[200px]">
          {/* We would normally render a canvas/svg chart here. For now, it's mostly blank per screenshot, just showing x-axis */}
          
          <div className="absolute bottom-[-24px] w-full flex justify-between px-4 text-[10px] text-ink-3 font-mono">
            <span>1</span>
            <span>3</span>
            <span>7</span>
            <span>10</span>
            <span>17</span>
            <span>24</span>
            <span>28</span>
          </div>
        </div>
      </div>
    </div>
  );
};
