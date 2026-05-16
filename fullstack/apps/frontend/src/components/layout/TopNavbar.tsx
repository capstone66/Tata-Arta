import React from 'react';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ title, subtitle }) => {
  return (
    <header className="h-[52px] bg-surface border-b border-cream-3 flex items-center px-[28px] gap-[14px] sticky top-0 z-40">
      <div className="font-serif text-[17px] text-ink flex-1 tracking-[-0.2px]">
        {title}
        {subtitle && (
          <span className="text-ink-3 italic text-[14px] ml-[6px]">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 bg-cream-2 border border-cream-3 rounded-lg py-[6px] px-3 text-[12px] text-ink-3 w-[200px]">
        <span>🔍</span>
        <span>Cari barang, transaksi...</span>
      </div>

      <div className="w-[34px] h-[34px] rounded-[9px] bg-cream-2 border border-cream-3 flex items-center justify-center cursor-pointer text-[15px] relative">
        🔔
        <div className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-red rounded-full border-[1.5px] border-white"></div>
      </div>

      <button className="inline-flex items-center gap-[6px] py-[7px] px-[14px] rounded-lg text-[12px] font-medium cursor-pointer font-sans transition-all duration-150 tracking-[0.01em] bg-transparent border border-cream-3 text-ink-2 hover:bg-cream-2">
        + Stok
      </button>

      <button className="inline-flex items-center gap-[6px] py-[7px] px-[14px] rounded-lg text-[12px] font-medium cursor-pointer font-sans transition-all duration-150 tracking-[0.01em] bg-forest text-leaf-light hover:bg-forest-rim">
        + Transaksi
      </button>
    </header>
  );
};
