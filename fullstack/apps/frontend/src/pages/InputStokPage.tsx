import React, { useState } from 'react';

type InputMode = 'ocr' | 'manual';

export const InputStokPage: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('ocr');
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const handleScanOCR = () => {
    if (ocrStatus === 'scanning') return;
    setOcrStatus('scanning');
    // Simulate OCR processing delay
    setTimeout(() => {
      setOcrStatus('success');
    }, 1800);
  };

  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Input Barang</h1>
          <p className="text-[12px] text-ink-3 mt-[3px]">Catat stok masuk dengan OCR atau manual</p>
        </div>
      </div>

      {/* Toggle Row */}
      <div className="flex bg-cream-2 rounded-lg p-[3px] mb-4 w-fit">
        <button 
          onClick={() => setMode('ocr')}
          className={`py-[5px] px-[14px] rounded-md text-[11px] font-semibold cursor-pointer transition-all font-sans border-none ${
            mode === 'ocr' ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-ink-3 hover:text-ink'
          }`}
        >
          📷 Scan OCR
        </button>
        <button 
          onClick={() => setMode('manual')}
          className={`py-[5px] px-[14px] rounded-md text-[11px] font-semibold cursor-pointer transition-all font-sans border-none ${
            mode === 'manual' ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-ink-3 hover:text-ink'
          }`}
        >
          ✏️ Input Manual
        </button>
      </div>

      {/* Mode Content */}
      {mode === 'ocr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scan Card */}
          <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-ink">📷 Scan Nota / Faktur</div>
            </div>
            
            <div 
              onClick={handleScanOCR}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                ocrStatus !== 'idle' ? 'border-leaf bg-leaf-pale' : 'border-cream-3 bg-cream hover:border-leaf hover:bg-leaf-pale'
              }`}
            >
              {ocrStatus === 'idle' && (
                <>
                  <div className="text-[28px] mb-[10px]">📸</div>
                  <div className="text-[13px] font-semibold text-ink">Klik untuk unggah foto nota</div>
                  <div className="text-[11px] text-ink-3 mt-1">JPG, PNG, PDF · Maks 10MB</div>
                  <div className="mt-[14px] flex gap-2 justify-center">
                    <button className="bg-forest text-leaf-light border-none rounded-lg py-[5px] px-[10px] text-[11px] font-semibold cursor-pointer flex items-center gap-[6px]" onClick={(e) => { e.stopPropagation(); handleScanOCR(); }}>
                      📷 Kamera
                    </button>
                    <button className="bg-transparent border border-cream-3 text-ink-2 rounded-lg py-[5px] px-[10px] text-[11px] font-semibold cursor-pointer flex items-center gap-[6px]" onClick={(e) => { e.stopPropagation(); handleScanOCR(); }}>
                      🗂 Upload File
                    </button>
                  </div>
                </>
              )}
              {ocrStatus === 'scanning' && (
                <>
                  <div className="text-[28px] mb-[10px] animate-pulse">⏳</div>
                  <div className="text-[13px] font-semibold text-ink">Memproses OCR...</div>
                  <div className="text-[11px] text-ink-3 mt-1">Membaca teks dari foto nota</div>
                </>
              )}
              {ocrStatus === 'success' && (
                <>
                  <div className="text-[28px] mb-[10px]">✅</div>
                  <div className="text-[13px] font-semibold text-ink">OCR Berhasil!</div>
                  <div className="text-[11px] text-ink-3 mt-1">Data terbaca dari nota</div>
                </>
              )}
            </div>

            {ocrStatus === 'success' && (
              <div className="mt-4 bg-forest text-cream rounded-[10px] p-[14px_16px] text-left animate-[fadeUp_0.2s_ease]">
                <div className="text-[9px] text-leaf-light tracking-[0.1em] uppercase mb-2 font-semibold">✓ Terbaca dari nota</div>
                <div className="flex justify-between text-[12px] py-1 border-b border-white/10">
                  <span className="text-white/50">Supplier</span>
                  <span className="text-leaf-light font-mono font-medium">UD. Maju Jaya</span>
                </div>
                <div className="flex justify-between text-[12px] py-1 border-b border-white/10">
                  <span className="text-white/50">Tanggal</span>
                  <span className="text-leaf-light font-mono font-medium">28/04/2026</span>
                </div>
                <div className="flex justify-between text-[12px] py-1 border-b border-white/10">
                  <span className="text-white/50">No. Faktur</span>
                  <span className="text-leaf-light font-mono font-medium">INV-20260428-014</span>
                </div>
                <div className="flex justify-between text-[12px] py-1 border-b border-white/10">
                  <span className="text-white/50">Total Item</span>
                  <span className="text-leaf-light font-mono font-medium">4 jenis barang</span>
                </div>
                <div className="flex justify-between text-[12px] py-1">
                  <span className="text-white/50">Total Bayar</span>
                  <span className="text-leaf-light font-mono font-medium">Rp 2.900.000</span>
                </div>
                <div className="mt-[10px] text-[10px] text-white/40">
                  Akurasi OCR: 97% — periksa data sebelum simpan
                </div>
              </div>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-ink">Konfirmasi Data OCR</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Tanggal</label>
                <input type="date" defaultValue="2026-04-28" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Supplier</label>
                <input defaultValue="UD. Maju Jaya" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px] col-span-2">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Barang</label>
                <select className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full cursor-pointer">
                  <option>Beras Premium 5kg — 100 pcs @ Rp 58.000</option>
                  <option>Tambah baris...</option>
                </select>
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Jumlah</label>
                <input type="number" defaultValue="100" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Harga Beli / pcs</label>
                <input defaultValue="Rp 58.000" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px] col-span-2">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Total</label>
                <input defaultValue="Rp 5.800.000" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full font-semibold text-leaf" />
              </div>
            </div>
            <div className="flex gap-2 mt-[6px]">
              <button className="bg-forest text-leaf-light rounded-lg py-[9px] px-4 text-[12px] font-semibold cursor-pointer border-none flex items-center gap-[6px] transition-colors hover:bg-forest-rim">
                💾 Simpan Stok Masuk
              </button>
              <button className="bg-transparent border border-cream-3 text-ink-2 rounded-lg py-[9px] px-4 text-[12px] font-semibold cursor-pointer flex items-center gap-[6px] transition-colors hover:bg-cream-2">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manual Form Card */}
          <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-ink">✏️ Input Manual Barang Masuk</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Tanggal Masuk</label>
                <input type="date" defaultValue="2026-04-28" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Supplier</label>
                <select className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full cursor-pointer">
                  <option>-- Pilih Supplier --</option>
                  <option>UD. Maju Jaya</option>
                  <option>Toko Grosir Sentral</option>
                </select>
              </div>
              <div className="flex flex-col gap-[5px] col-span-2">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Nama Barang</label>
                <select className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full cursor-pointer">
                  <option>-- Pilih Barang --</option>
                  <option>Beras Premium 5kg</option>
                  <option>Minyak Goreng 2L</option>
                  <option>Aqua 600ml</option>
                </select>
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Jumlah (pcs)</label>
                <input type="number" placeholder="0" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Harga Beli / pcs</label>
                <input type="number" placeholder="0" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>
              <div className="flex flex-col gap-[5px] col-span-2">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Total Bayar</label>
                <input placeholder="Rp 0" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full font-semibold" />
              </div>
              <div className="flex flex-col gap-[5px] col-span-2">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Catatan</label>
                <textarea placeholder="Catatan tambahan..." className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full min-h-[60px] resize-y" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="bg-forest text-leaf-light rounded-lg py-[9px] px-4 text-[12px] font-semibold cursor-pointer border-none flex items-center gap-[6px] transition-colors hover:bg-forest-rim">
                💾 Simpan
              </button>
              <button className="bg-transparent border border-cream-3 text-ink-2 rounded-lg py-[9px] px-4 text-[12px] font-semibold cursor-pointer flex items-center gap-[6px] transition-colors hover:bg-cream-2">
                Reset
              </button>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-ink">Riwayat Masuk Terbaru</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Tgl</th>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Barang</th>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Qty</th>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-cream">
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2">28/4</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2 font-medium text-ink">Beras Premium</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2">100</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2 font-mono text-[11px] text-ink-3">Rp 5,8jt</td>
                  </tr>
                  <tr className="hover:bg-cream">
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2">27/4</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2 font-medium text-ink">Minyak 2L</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2">48</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2 font-mono text-[11px] text-ink-3">Rp 1,25jt</td>
                  </tr>
                  <tr className="hover:bg-cream">
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2">26/4</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2 font-medium text-ink">Aqua Krat</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2">20</td>
                    <td className="py-[10px] px-3 align-middle border-b border-cream-2 font-mono text-[11px] text-ink-3">Rp 560rb</td>
                  </tr>
                  <tr className="hover:bg-cream">
                    <td className="py-[10px] px-3 align-middle">25/4</td>
                    <td className="py-[10px] px-3 align-middle font-medium text-ink">Indomie Goreng</td>
                    <td className="py-[10px] px-3 align-middle">200</td>
                    <td className="py-[10px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 560rb</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
