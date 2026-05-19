import React from 'react';

export const LaporanPenjualanPage: React.FC = () => {
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Laporan Penjualan</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Riwayat & rekap seluruh transaksi</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface border border-cream-3 text-ink-2 rounded-lg py-[7px] px-3 text-[12px] font-semibold cursor-pointer flex items-center gap-[6px] transition-colors hover:bg-cream-2">
            🖨️ Cetak
          </button>
          <button className="bg-surface border border-cream-3 text-ink-2 rounded-lg py-[7px] px-3 text-[12px] font-semibold cursor-pointer flex items-center gap-[6px] transition-colors hover:bg-cream-2">
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-cream-3 rounded-[14px] p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-cream-2 p-1 rounded-[10px] border border-cream-3">
          <input type="date" defaultValue="2026-04-01" className="p-[7px_10px] rounded-[7px] border-none bg-transparent text-[12px] font-sans outline-none cursor-pointer" />
          <span className="text-[11px] text-ink-3 font-medium">s/d</span>
          <input type="date" defaultValue="2026-04-28" className="p-[7px_10px] rounded-[7px] border-none bg-transparent text-[12px] font-sans outline-none cursor-pointer" />
        </div>

        <select className="p-[8px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[12px] font-sans outline-none focus:border-leaf focus:bg-surface cursor-pointer min-w-[140px]">
          <option>Semua Metode</option>
          <option>Tunai</option>
          <option>Transfer Bank</option>
          <option>QRIS</option>
        </select>

        <select className="p-[8px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[12px] font-sans outline-none focus:border-leaf focus:bg-surface cursor-pointer min-w-[140px]">
          <option>Semua Kategori</option>
          <option>Sembako</option>
          <option>Minuman</option>
          <option>Snack</option>
        </select>

        <button className="bg-forest text-leaf-light rounded-[9px] py-[8px] px-5 text-[12px] font-semibold cursor-pointer border-none transition-colors hover:bg-forest-rim ml-auto">
          Filter
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-surface border border-cream-3 rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[60px]">#</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Tanggal</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Item</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[60px]">Qty</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[100px]">Metode</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[100px]">Total</th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[80px]">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-cream-2 hover:bg-cream-2/50 transition-colors">
                <td className="py-[14px] px-4 align-middle text-ink-3 font-mono text-[11px]">#1042</td>
                <td className="py-[14px] px-4 align-middle text-ink">28/04 14:23</td>
                <td className="py-[14px] px-4 align-middle font-medium text-ink">Indomie Goreng, Aqua</td>
                <td className="py-[14px] px-4 align-middle text-ink">16</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf border border-leaf/20">
                    Tunai
                  </span>
                </td>
                <td className="py-[14px] px-4 align-middle font-mono text-[11px] text-ink-3">Rp 59rb</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="border-b border-cream-2 hover:bg-cream-2/50 transition-colors">
                <td className="py-[14px] px-4 align-middle text-ink-3 font-mono text-[11px]">#1041</td>
                <td className="py-[14px] px-4 align-middle text-ink">28/04 13:50</td>
                <td className="py-[14px] px-4 align-middle font-medium text-ink">Beras Premium 5kg</td>
                <td className="py-[14px] px-4 align-middle text-ink">2</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-blue-light text-blue border border-blue/20">
                    Transfer
                  </span>
                </td>
                <td className="py-[14px] px-4 align-middle font-mono text-[11px] text-ink-3">Rp 130rb</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="border-b border-cream-2 hover:bg-cream-2/50 transition-colors">
                <td className="py-[14px] px-4 align-middle text-ink-3 font-mono text-[11px]">#1040</td>
                <td className="py-[14px] px-4 align-middle text-ink">28/04 12:15</td>
                <td className="py-[14px] px-4 align-middle font-medium text-ink">Minyak, Gula</td>
                <td className="py-[14px] px-4 align-middle text-ink">5</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-gold-light text-gold border border-gold/20">
                    QRIS
                  </span>
                </td>
                <td className="py-[14px] px-4 align-middle font-mono text-[11px] text-ink-3">Rp 143rb</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="border-b border-cream-2 hover:bg-cream-2/50 transition-colors">
                <td className="py-[14px] px-4 align-middle text-ink-3 font-mono text-[11px]">#1039</td>
                <td className="py-[14px] px-4 align-middle text-ink">28/04 10:32</td>
                <td className="py-[14px] px-4 align-middle font-medium text-ink">Aqua Krat x2</td>
                <td className="py-[14px] px-4 align-middle text-ink">2</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf border border-leaf/20">
                    Tunai
                  </span>
                </td>
                <td className="py-[14px] px-4 align-middle font-mono text-[11px] text-ink-3">Rp 72rb</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="border-b border-cream-2 hover:bg-cream-2/50 transition-colors">
                <td className="py-[14px] px-4 align-middle text-ink-3 font-mono text-[11px]">#1038</td>
                <td className="py-[14px] px-4 align-middle text-ink">28/04 09:14</td>
                <td className="py-[14px] px-4 align-middle font-medium text-ink">Sabun, Shampo</td>
                <td className="py-[14px] px-4 align-middle text-ink">4</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-blue-light text-blue border border-blue/20">
                    Transfer
                  </span>
                </td>
                <td className="py-[14px] px-4 align-middle font-mono text-[11px] text-ink-3">Rp 87,5rb</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-cream-2/50 transition-colors">
                <td className="py-[14px] px-4 align-middle text-ink-3 font-mono text-[11px]">#1037</td>
                <td className="py-[14px] px-4 align-middle text-ink">27/04 17:45</td>
                <td className="py-[14px] px-4 align-middle font-medium text-ink">Snack Chitato, Oreo</td>
                <td className="py-[14px] px-4 align-middle text-ink">8</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-gold-light text-gold border border-gold/20">
                    QRIS
                  </span>
                </td>
                <td className="py-[14px] px-4 align-middle font-mono text-[11px] text-ink-3">Rp 44rb</td>
                <td className="py-[14px] px-4 align-middle">
                  <span className="inline-block px-2 py-[2px] rounded-full text-[10px] font-semibold bg-leaf-pale text-leaf">
                    Selesai
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination & Summary */}
        <div className="p-4 border-t border-cream-3 flex items-center justify-between">
          <div className="text-[11px] text-ink-3">
            Menampilkan 1-6 dari 1.042 transaksi
          </div>
          <div className="flex gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded bg-transparent border border-cream-3 text-ink-3 hover:bg-cream-2 transition-colors cursor-pointer text-[12px]">
              ←
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-forest text-leaf-light font-semibold border-none cursor-pointer text-[12px]">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-transparent border border-cream-3 text-ink hover:bg-cream-2 transition-colors cursor-pointer text-[12px]">
              2
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-transparent border border-cream-3 text-ink hover:bg-cream-2 transition-colors cursor-pointer text-[12px]">
              3
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-transparent border border-cream-3 text-ink-3 hover:bg-cream-2 transition-colors cursor-pointer text-[12px]">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
