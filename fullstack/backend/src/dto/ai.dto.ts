export type PredictPayload =
  | { kode_barang: string }
  | { nama_barang: string }
  | {
      nama_barang: string;
      kategori?: string;
      sub_kategori?: string;
      supplier?: string;
      hpp?: number;
      harga_toko_1?: number;
      stok_min?: number;
      stok_max?: number;
      total_stock?: number;
      trx_total_qty?: number;
      trx_qty_30d?: number;
      trx_qty_60d?: number;
      trx_qty_90d?: number;
      trx_count?: number;
      trx_total_revenue?: number;
      trx_total_profit?: number;
    };

export interface RealtimeProduct {
  kode_barang: string;
  nama_barang: string;
  kategori?: string;
  sub_kategori?: string;
  supplier?: string;
  hpp?: number;
  harga_toko_1?: number;
  stok_min?: number;
  stok_max?: number;
  total_stock?: number;
  trx_total_qty?: number;
  trx_qty_30d?: number;
  trx_qty_60d?: number;
  trx_qty_90d?: number;
  trx_count?: number;
  trx_total_revenue?: number;
  trx_total_profit?: number;
}

export interface KpiHistoryEntry {
  date: string;
  revenue: number;
  expense: number;
  profit: number;
  transactions: number;
}

export type PredictBody = Record<string, unknown>;
