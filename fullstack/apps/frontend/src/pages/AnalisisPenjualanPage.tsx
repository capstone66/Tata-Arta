import React from 'react';

export const AnalisisPenjualanPage: React.FC = () => {
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Analisis Penjualan</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Tren, performa produk, dan insight bisnis</p>
        </div>
        <div>
          <select className="p-[7px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[12px] font-sans font-medium outline-none focus:border-leaf focus:bg-surface cursor-pointer text-ink-2">
            <option>📅 April 2026</option>
            <option>📅 Maret 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-leaf"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Total Omset</div>
            <div className="text-[14px] opacity-60">💰</div>
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            Rp 34,7jt
          </div>
          <div className="text-[11px] font-medium text-leaf flex items-center gap-1">
            ↑ 11,4%
          </div>
        </div>

        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-gold"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Laba Kotor</div>
            <div className="text-[14px] opacity-60">📊</div>
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            Rp 8,2jt
          </div>
          <div className="text-[11px] font-medium text-ink-3 flex items-center gap-1">
            Margin 23,6%
          </div>
        </div>

        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-blue"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Total Transaksi</div>
            <div className="text-[14px] opacity-60">🛒</div>
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            847
          </div>
          <div className="text-[11px] font-medium text-leaf flex items-center gap-1">
            ↑ 53 tx
          </div>
        </div>

        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[40px] h-1 bg-ink-3"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Avg Per TX</div>
            <div className="text-[14px] opacity-60">🧾</div>
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            Rp 41rb
          </div>
          <div className="text-[11px] font-medium text-leaf flex items-center gap-1">
            ↑ 3,2%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Top 5 Products */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[13px] font-semibold text-ink">Top 5 Barang Terlaris</div>
            <div className="bg-leaf-pale text-forest px-2 py-1 rounded-[6px] text-[10px] font-bold">April 2026</div>
          </div>
          
          <div className="flex flex-col gap-5">
            {/* Item 1 */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-[12px] font-medium text-ink">
                <span className="flex gap-3"><span className="text-ink-3 w-3 inline-block">1</span> Indomie Goreng</span>
                <span className="font-mono text-leaf">Rp 5,2jt</span>
              </div>
              <div className="w-full bg-cream-2 h-2 rounded-full overflow-hidden">
                <div className="bg-leaf h-full rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-[12px] font-medium text-ink">
                <span className="flex gap-3"><span className="text-ink-3 w-3 inline-block">2</span> Beras Premium 5kg</span>
                <span className="font-mono text-leaf">Rp 4,2jt</span>
              </div>
              <div className="w-full bg-cream-2 h-2 rounded-full overflow-hidden">
                <div className="bg-leaf h-full rounded-full opacity-80" style={{ width: '70%' }}></div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-[12px] font-medium text-ink">
                <span className="flex gap-3"><span className="text-ink-3 w-3 inline-block">3</span> Minyak Goreng 2L</span>
                <span className="font-mono text-leaf">Rp 3,4jt</span>
              </div>
              <div className="w-full bg-cream-2 h-2 rounded-full overflow-hidden">
                <div className="bg-leaf h-full rounded-full opacity-70" style={{ width: '55%' }}></div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-[12px] font-medium text-ink">
                <span className="flex gap-3"><span className="text-ink-3 w-3 inline-block">4</span> Aqua 600ml</span>
                <span className="font-mono text-leaf">Rp 2,6jt</span>
              </div>
              <div className="w-full bg-cream-2 h-2 rounded-full overflow-hidden">
                <div className="bg-leaf h-full rounded-full opacity-60" style={{ width: '40%' }}></div>
              </div>
            </div>

            {/* Item 5 */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-[12px] font-medium text-ink">
                <span className="flex gap-3"><span className="text-ink-3 w-3 inline-block">5</span> Gula Pasir 1kg</span>
                <span className="font-mono text-leaf">Rp 2,0jt</span>
              </div>
              <div className="w-full bg-cream-2 h-2 rounded-full overflow-hidden">
                <div className="bg-leaf h-full rounded-full opacity-50" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Charts (Mocked) */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-cream-3 rounded-[14px] p-5 flex-1 flex flex-col">
            <div className="text-[13px] font-semibold text-ink mb-1">Jam Ramai Transaksi</div>
            <div className="text-[10px] text-ink-3 mb-4 opacity-0">spacer</div>
            <div className="flex-1 min-h-[100px] flex items-end relative border-b border-cream-3 pb-2 mt-auto">
              <div className="absolute bottom-[-20px] w-full flex justify-between px-2 text-[9px] text-ink-3 font-mono">
                <span>7</span>
                <span>9</span>
                <span>11</span>
                <span>13</span>
                <span>15</span>
                <span>17</span>
                <span>19</span>
                <span>21</span>
              </div>
            </div>
            <div className="text-[11px] text-ink-3 mt-6">
              Paling ramai: <strong className="text-ink font-semibold">11.00-12.00</strong> & <strong className="text-ink font-semibold">17.00-18.00</strong>
            </div>
          </div>

          <div className="bg-surface border border-cream-3 rounded-[14px] p-5 flex-1 flex flex-col">
            <div className="text-[13px] font-semibold text-ink mb-1">Omset Bulanan</div>
            <div className="text-[10px] text-ink-3 mb-4 opacity-0">spacer</div>
            <div className="flex-1 min-h-[100px] flex items-end relative border-b border-cream-3 pb-2 mt-auto">
              <div className="absolute bottom-[-20px] w-full flex justify-between px-2 text-[9px] text-ink-3 font-mono">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
