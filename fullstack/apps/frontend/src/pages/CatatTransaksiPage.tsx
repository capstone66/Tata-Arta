import React, { useState } from 'react';

type TabMode = 'penjualan' | 'pengeluaran';

export const CatatTransaksiPage: React.FC = () => {
  const [tab, setTab] = useState<TabMode>('penjualan');
  
  return (
    <div className="animate-[fadeUp_0.2s_ease]">
      {/* Page Header */}
      <div className="mb-[22px]">
        <h1 className="font-serif text-[22px] font-normal text-ink tracking-[-0.3px]">Catat Transaksi</h1>
        <p className="text-[12px] text-ink-3 mt-[3px]">Penjualan & pengeluaran manual</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-cream-2 rounded-lg p-[3px] mb-4 w-fit">
        <button 
          onClick={() => setTab('penjualan')}
          className={`py-[5px] px-[14px] rounded-md text-[11px] font-semibold cursor-pointer transition-all font-sans border-none ${
            tab === 'penjualan' ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-ink-3 hover:text-ink'
          }`}
        >
          🛒 Penjualan
        </button>
        <button 
          onClick={() => setTab('pengeluaran')}
          className={`py-[5px] px-[14px] rounded-md text-[11px] font-semibold cursor-pointer transition-all font-sans border-none ${
            tab === 'pengeluaran' ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-ink-3 hover:text-ink'
          }`}
        >
          ➖ Pengeluaran
        </button>
      </div>
      
      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - Main Form */}
        <div className="flex-1">
          {tab === 'penjualan' && (
            <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
              <div className="flex items-center mb-4">
                <div className="text-[13px] font-semibold text-ink">🛒 Keranjang Penjualan</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Tanggal</label>
                  <input type="date" defaultValue="2026-04-28" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Metode Bayar</label>
                  <select className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full cursor-pointer">
                    <option>Tunai</option>
                    <option>Transfer Bank</option>
                    <option>QRIS</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-[5px] mb-4">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Cari & Tambah Barang</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]">🔍</div>
                  <input type="text" placeholder="Ketik nama barang..." className="p-[9px_12px_9px_34px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
                </div>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Barang</th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[100px]">Harga</th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[80px]">Qty</th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[100px]">Subtotal</th>
                      <th className="text-center py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-cream border-b border-dashed border-cream-3">
                      <td className="py-[12px] px-3 align-middle font-medium text-ink">Beras Premium 5kg</td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 65rb</td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="number" defaultValue="2" className="w-[50px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] text-center outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 130rb</td>
                      <td className="py-[12px] px-3 align-middle text-center text-red cursor-pointer hover:bg-red/10 rounded-md">✖</td>
                    </tr>
                    <tr className="hover:bg-cream border-b border-dashed border-cream-3">
                      <td className="py-[12px] px-3 align-middle font-medium text-ink">Minyak Goreng 2L</td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 29rb</td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="number" defaultValue="3" className="w-[50px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] text-center outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 87rb</td>
                      <td className="py-[12px] px-3 align-middle text-center text-red cursor-pointer hover:bg-red/10 rounded-md">✖</td>
                    </tr>
                    <tr className="hover:bg-cream border-b border-dashed border-cream-3">
                      <td className="py-[12px] px-3 align-middle font-medium text-ink">Aqua 600ml</td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 4rb</td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="number" defaultValue="6" className="w-[50px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] text-center outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 24rb</td>
                      <td className="py-[12px] px-3 align-middle text-center text-red cursor-pointer hover:bg-red/10 rounded-md">✖</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-[6px] pt-4">
                <div className="flex justify-between text-[12px] text-ink-3">
                  <span>Subtotal</span>
                  <span className="font-mono">Rp 241.000</span>
                </div>
                <div className="flex justify-between text-[12px] text-ink-3">
                  <span>Diskon</span>
                  <span className="font-mono text-red">- Rp 0</span>
                </div>
                <div className="flex justify-between text-[15px] font-bold text-ink mt-2">
                  <span className="text-leaf">Total</span>
                  <span className="font-mono text-leaf">Rp 241.000</span>
                </div>
              </div>
              
              <button className="w-full mt-5 bg-forest text-leaf-light rounded-[10px] py-[12px] text-[13px] font-semibold cursor-pointer border-none flex items-center justify-center gap-[6px] transition-colors hover:bg-forest-rim">
                ✓ Selesaikan Penjualan
              </button>
            </div>
          )}
          {tab === 'pengeluaran' && (
            <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
              <div className="flex items-center mb-4">
                <div className="text-[13px] font-semibold text-ink">💸 Form Pengeluaran</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Tanggal</label>
                  <input type="date" defaultValue="2026-04-28" className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Metode Bayar</label>
                  <select className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full cursor-pointer">
                    <option>Tunai</option>
                    <option>Transfer Bank</option>
                    <option>QRIS</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-[5px] mb-4">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Kategori Pengeluaran</label>
                <div className="flex flex-wrap gap-2">
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-red/30 bg-red-light text-red cursor-pointer transition-all">
                    📦 Pembelian Stok
                  </button>
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-cream-3 bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink cursor-pointer transition-all">
                    💡 Utilitas
                  </button>
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-cream-3 bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink cursor-pointer transition-all">
                    👷 Gaji Karyawan
                  </button>
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-cream-3 bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink cursor-pointer transition-all">
                    🚚 Pengiriman
                  </button>
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-cream-3 bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink cursor-pointer transition-all">
                    🛠️ Perawatan
                  </button>
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-cream-3 bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink cursor-pointer transition-all">
                    📣 Promosi
                  </button>
                  <button className="py-[6px] px-3 rounded-full text-[11px] font-semibold border border-cream-3 bg-cream-2 text-ink-3 hover:bg-cream-3 hover:text-ink cursor-pointer transition-all">
                    📁 Lainnya
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-[5px] mb-4">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Nama / Keterangan Pengeluaran</label>
                <input type="text" placeholder="Contoh: Beli stok indomie dari supplier..." className="p-[9px_12px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
              </div>

              <div className="flex flex-col gap-[5px] mb-4">
                <label className="text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase">Rincian Item (Opsional)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]">🔍</div>
                  <input type="text" placeholder="Cari atau ketik nama item..." className="p-[9px_12px_9px_34px] rounded-[9px] border-[1.5px] border-cream-3 bg-cream-2 text-[13px] font-sans outline-none focus:border-leaf focus:bg-surface transition-all w-full" />
                </div>
              </div>

              <div className="overflow-x-auto mb-4 border border-cream-3 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3">Item / Barang</th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[120px]">Harga Satuan</th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[80px]">Qty</th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[120px]">Subtotal</th>
                      <th className="text-center py-2 px-3 text-[10px] font-semibold text-ink-3 tracking-[0.1em] uppercase bg-cream border-b border-cream-3 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-cream-3">
                      <td className="py-[12px] px-3 align-middle text-ink">Indomie Goreng (dus)</td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="text" defaultValue="Rp 120rb" className="w-[80px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="number" defaultValue="5" className="w-[50px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] text-center outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 600rb</td>
                      <td className="py-[12px] px-3 align-middle text-center text-ink-3 hover:text-red cursor-pointer">✖</td>
                    </tr>
                    <tr className="border-b border-cream-3">
                      <td className="py-[12px] px-3 align-middle text-ink">Gula Pasir 50kg (karung)</td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="text" defaultValue="Rp 750rb" className="w-[80px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="number" defaultValue="2" className="w-[50px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] text-center outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 1,5jt</td>
                      <td className="py-[12px] px-3 align-middle text-center text-ink-3 hover:text-red cursor-pointer">✖</td>
                    </tr>
                    <tr className="border-b border-cream-3">
                      <td className="py-[12px] px-3 align-middle text-ink">Minyak Goreng 20L</td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="text" defaultValue="Rp 280rb" className="w-[80px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle">
                        <input type="number" defaultValue="3" className="w-[50px] p-[4px_8px] rounded-[6px] border border-cream-3 bg-cream-2 text-[12px] text-center outline-none focus:border-leaf" />
                      </td>
                      <td className="py-[12px] px-3 align-middle font-mono text-[11px] text-ink-3">Rp 840rb</td>
                      <td className="py-[12px] px-3 align-middle text-center text-ink-3 hover:text-red cursor-pointer">✖</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-3">
                         <button className="w-full py-[8px] border border-dashed border-cream-3 text-ink-3 text-[11px] font-semibold rounded-md hover:bg-cream hover:text-ink cursor-pointer transition-colors">
                           + Tambah Item
                         </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-[6px] pt-2">
                <div className="flex justify-between text-[12px] text-ink-3">
                  <span>Subtotal</span>
                  <span className="font-mono">Rp 2.940.000</span>
                </div>
                <div className="flex justify-between text-[12px] text-ink-3">
                  <span>PPN / Pajak (0%)</span>
                  <span className="font-mono">- Rp 0</span>
                </div>
                <div className="flex justify-between text-[15px] font-bold text-red mt-2">
                  <span>Total Pengeluaran</span>
                  <span className="font-mono">Rp 2.940.000</span>
                </div>
              </div>
              
              <button className="w-full mt-5 bg-red text-white rounded-[10px] py-[12px] text-[13px] font-semibold cursor-pointer border-none flex items-center justify-center gap-[6px] transition-colors hover:bg-red/90">
                💸 Simpan Pengeluaran
              </button>
            </div>
          )}
        </div>
        
        {/* Right Column - Summary & History (Only for Penjualan) */}
        {tab === 'penjualan' && (
          <div className="w-full lg:w-[320px] flex flex-col gap-4">
            <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
              <div className="text-[13px] font-semibold text-ink mb-3">Ringkasan Hari Ini</div>
              <div className="font-mono text-[28px] font-medium text-leaf leading-tight">
                Rp 1,24jt
              </div>
              <div className="text-[11px] text-ink-3 mt-1">
                37 transaksi - avg Rp 33.500
              </div>
            </div>

            <div className="bg-surface border border-cream-3 rounded-[14px] p-5">
              <div className="text-[13px] font-semibold text-ink mb-4">Transaksi Terakhir</div>
              <div className="flex flex-col gap-[14px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-medium text-ink">Indomie <span className="text-ink-3">x10</span></span>
                    <span className="text-[10px] text-ink-3">14:23 · Tunai</span>
                  </div>
                  <span className="text-[12px] font-mono font-medium text-ink">Rp 35rb</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-medium text-ink">Gula 1kg <span className="text-ink-3">x4</span></span>
                    <span className="text-[10px] text-ink-3">14:18 · QRIS</span>
                  </div>
                  <span className="text-[12px] font-mono font-medium text-ink">Rp 56rb</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-medium text-ink">Aqua Krat <span className="text-ink-3">x1</span></span>
                    <span className="text-[10px] text-ink-3">14:05 · Transfer</span>
                  </div>
                  <span className="text-[12px] font-mono font-medium text-ink">Rp 36rb</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
