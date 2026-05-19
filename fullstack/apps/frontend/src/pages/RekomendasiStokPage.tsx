import React from 'react';

export const RekomendasiStokPage: React.FC = () => {
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Rekomendasi Stok</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Saran restock otomatis berdasarkan pola penjualan</p>
        </div>
        <div className="bg-blue-light text-blue px-3 py-[6px] rounded-full text-[11px] font-semibold flex items-center gap-[6px] border border-blue/20">
          🤖 AI Powered
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gold-light border border-gold/20 rounded-[14px] p-5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-ink mb-3">
            ⚠️ Perlu Restock Segera
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            3 <span className="font-sans text-[16px] text-ink-2 font-normal">barang</span>
          </div>
          <div className="text-[11px] text-ink-3">
            Diperkirakan habis dalam 2–3 hari
          </div>
        </div>

        <div className="bg-leaf-pale border border-leaf/20 rounded-[14px] p-5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-ink mb-3">
            📦 Restock Minggu Ini
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            7 <span className="font-sans text-[16px] text-ink-2 font-normal">barang</span>
          </div>
          <div className="text-[11px] text-ink-3">
            Stok akan habis dalam 5–7 hari
          </div>
        </div>

        <div className="bg-blue-light border border-blue/20 rounded-[14px] p-5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-ink mb-3">
            ✅ Stok Cukup
          </div>
          <div className="font-mono text-[24px] font-medium text-ink leading-tight mb-1">
            274 <span className="font-sans text-[16px] text-ink-2 font-normal">barang</span>
          </div>
          <div className="text-[11px] text-ink-3">
            Aman untuk 2+ minggu ke depan
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Restock Mendesak */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[13px] font-semibold text-ink flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red"></span>
              Restock Mendesak
            </div>
            <button className="text-[11px] font-semibold text-leaf bg-transparent border-none cursor-pointer hover:underline">
              + Order Sekarang
            </button>
          </div>
          
          <div className="flex flex-col gap-5 flex-1">
            {/* Item 1 */}
            <div className="flex flex-col gap-[6px] pb-5 border-b border-cream-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-ink mb-[2px]">Beras Medium 5kg</span>
                  <span className="text-[10px] text-ink-3">Sisa 2 dari 50 min.</span>
                </div>
                <button className="bg-red-light text-red border border-red/20 px-3 py-[6px] rounded-lg text-[11px] font-semibold cursor-pointer transition-colors hover:bg-red hover:text-white">
                  Order
                </button>
              </div>
              <div className="w-full bg-cream-2 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-red h-full rounded-full" style={{ width: '4%' }}></div>
              </div>
              <div className="text-[10px] font-semibold text-red text-right">
                Habis ~1 hari
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-[6px] pb-5 border-b border-cream-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-ink mb-[2px]">Aqua 600ml (krat)</span>
                  <span className="text-[10px] text-ink-3">Sisa 3 dari 25 min.</span>
                </div>
                <button className="bg-red-light text-red border border-red/20 px-3 py-[6px] rounded-lg text-[11px] font-semibold cursor-pointer transition-colors hover:bg-red hover:text-white">
                  Order
                </button>
              </div>
              <div className="w-full bg-cream-2 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-red h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
              <div className="text-[10px] font-semibold text-red text-right">
                Habis ~2 hari
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-ink mb-[2px]">Indomie Soto</span>
                  <span className="text-[10px] text-ink-3">Sisa 8 dari 25 min.</span>
                </div>
                <button className="bg-gold-light text-gold-700 border border-gold/30 px-3 py-[6px] rounded-lg text-[11px] font-semibold cursor-pointer transition-colors hover:bg-gold hover:text-white">
                  Order
                </button>
              </div>
              <div className="w-full bg-cream-2 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-gold h-full rounded-full" style={{ width: '32%' }}></div>
              </div>
              <div className="text-[10px] font-semibold text-gold text-right">
                Habis ~3 hari
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Restock Minggu Ini */}
        <div className="bg-surface border border-cream-3 rounded-[14px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold text-ink flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold"></span>
              Restock Minggu Ini
            </div>
          </div>
          
          <div className="flex-1">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Barang</th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[80px]">Sisa</th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[140px]">Rekomendasi Order</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dashed border-cream-3">
                  <td className="py-[12px] px-3 font-medium text-ink">Minyak Goreng 2L</td>
                  <td className="py-[12px] px-3 font-mono font-medium text-[11px] text-gold">12</td>
                  <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">50 pcs</td>
                </tr>
                <tr className="border-b border-dashed border-cream-3">
                  <td className="py-[12px] px-3 font-medium text-ink">Gula Pasir 1kg</td>
                  <td className="py-[12px] px-3 font-mono font-medium text-[11px] text-gold">15</td>
                  <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">40 pcs</td>
                </tr>
                <tr className="border-b border-dashed border-cream-3">
                  <td className="py-[12px] px-3 font-medium text-ink">Sabun Mandi</td>
                  <td className="py-[12px] px-3 font-mono font-medium text-[11px] text-gold">18</td>
                  <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">36 pcs</td>
                </tr>
                <tr className="border-b border-dashed border-cream-3">
                  <td className="py-[12px] px-3 font-medium text-ink">Telur Ayam</td>
                  <td className="py-[12px] px-3 font-mono font-medium text-[11px] text-gold">2 kg</td>
                  <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">10 kg</td>
                </tr>
                <tr className="">
                  <td className="py-[12px] px-3 font-medium text-ink">Kopi Kapal Api</td>
                  <td className="py-[12px] px-3 font-mono font-medium text-[11px] text-gold">28</td>
                  <td className="py-[12px] px-3 font-mono text-[11px] text-ink-3">48 pcs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-light border border-blue/20 rounded-[10px] p-3 mt-4 text-[11px] text-ink-2 leading-relaxed flex items-start gap-2">
            <span>💡</span>
            <span>Berdasarkan rata-rata penjualan 30 hari terakhir dan estimasi demand akhir bulan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
