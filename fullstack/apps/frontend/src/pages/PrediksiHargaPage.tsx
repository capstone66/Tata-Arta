import React from 'react';

export const PrediksiHargaPage: React.FC = () => {
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Prediksi Harga</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Estimasi harga jual optimal per minggu berdasarkan tren pasar</p>
        </div>
        <div className="bg-blue-light text-blue px-3 py-[6px] rounded-full text-[11px] font-semibold flex items-center gap-[6px] border border-blue/20">
          🤖 AI Powered
        </div>
      </div>

      {/* Selector Card */}
      <div className="bg-surface border border-cream-3 rounded-[14px] p-5 mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Pilih Barang untuk Prediksi</div>
          <div className="flex gap-2">
            <select className="p-[8px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface w-[200px] cursor-pointer">
              <option>Beras Premium 5kg</option>
              <option>Minyak Goreng 2L</option>
              <option>Gula Pasir 1kg</option>
            </select>
            <button className="bg-forest text-leaf-light rounded-[9px] py-[8px] px-4 text-[12px] font-semibold cursor-pointer border-none transition-colors hover:bg-forest-rim">
              Analisis
            </button>
          </div>
        </div>
        <div className="bg-cream-2 text-ink-3 px-3 py-[6px] rounded-lg text-[10px] font-medium border border-cream-3">
          Terakhir update: 28/04 08:00
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - 7 Days Forecast */}
        <div className="lg:col-span-7 bg-surface border border-cream-3 rounded-[14px] p-5">
          <div className="mb-4">
            <div className="text-[13px] font-semibold text-ink">Prediksi 7 Hari ke Depan</div>
            <div className="text-[11px] text-ink-3 mt-1">Beras Premium 5kg · Harga saat ini: Rp 65.000</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-cream-3 bg-cream-2/50">
              <span className="text-[10px] font-semibold text-ink-3 mb-1">SEN</span>
              <span className="text-[12px] font-bold text-ink font-mono mb-[2px]">65.000</span>
              <span className="text-[10px] text-ink-3">→</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-leaf/40 bg-leaf-pale text-forest">
              <span className="text-[10px] font-semibold opacity-70 mb-1">SEL</span>
              <span className="text-[12px] font-bold font-mono mb-[2px]">66.500</span>
              <span className="text-[10px] text-leaf font-bold">↑</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-leaf/40 bg-leaf-pale text-forest">
              <span className="text-[10px] font-semibold opacity-70 mb-1">RAB</span>
              <span className="text-[12px] font-bold font-mono mb-[2px]">67.000</span>
              <span className="text-[10px] text-leaf font-bold">↑</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-cream-3 bg-cream-2/50">
              <span className="text-[10px] font-semibold text-ink-3 mb-1">KAM</span>
              <span className="text-[12px] font-bold text-ink font-mono mb-[2px]">66.000</span>
              <span className="text-[10px] text-red font-bold">↓</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-cream-3 bg-cream-2/50">
              <span className="text-[10px] font-semibold text-ink-3 mb-1">JUM</span>
              <span className="text-[12px] font-bold text-ink font-mono mb-[2px]">65.500</span>
              <span className="text-[10px] text-red font-bold">↓</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-leaf/40 bg-leaf-pale text-forest">
              <span className="text-[10px] font-semibold opacity-70 mb-1">SAB</span>
              <span className="text-[12px] font-bold font-mono mb-[2px]">68.000</span>
              <span className="text-[10px] text-leaf font-bold">↑</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-[10px] border border-cream-3 bg-cream-2/50">
              <span className="text-[10px] font-semibold text-ink-3 mb-1">MIN</span>
              <span className="text-[12px] font-bold text-ink font-mono mb-[2px]">67.500</span>
              <span className="text-[10px] text-red font-bold">↓</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-[11px] text-ink-3">
            <div className="w-3 h-3 rounded-[3px] bg-leaf-pale border border-leaf/40"></div>
            Harga optimal untuk jual
          </div>
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-gold-light border border-gold/20 rounded-[14px] p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-gold mb-3">
              💡 Rekomendasi Harga
            </div>
            <div className="font-mono text-[24px] font-bold text-ink leading-tight mb-2">
              Rp 66.500 - 68.000
            </div>
            <div className="text-[12px] text-ink-2 mb-3 leading-relaxed">
              Harga optimal Selasa–Rabu dan Sabtu. Demand cenderung naik menjelang akhir pekan.
            </div>
            <div className="inline-block bg-gold/20 text-gold-700 px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-wide">
              ↑ Potensi +4,6% margin
            </div>
          </div>

          <div className="bg-blue-light border border-blue/20 rounded-[14px] p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-blue mb-3">
              📈 Faktor Penentu
            </div>
            <div className="text-[12px] text-ink-2 mb-3 leading-relaxed">
              Harga supplier naik 2% · Stok gudang rendah di hari Kamis · Permintaan tinggi akhir pekan
            </div>
            <div className="inline-block bg-blue/20 text-blue-700 px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-wide">
              Berdasarkan 90 hari data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
