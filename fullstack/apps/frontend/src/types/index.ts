export type Role = 'owner' | 'karyawan';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  section?: string;
  badge?: string;
  locked?: boolean;
}

export interface SummaryData {
  id: string;
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down';
  icon: string;
  color: 'green' | 'gold' | 'red' | 'blue';
}

export interface Transaction {
  id: string;
  name: string;
  qty: number;
  total: string;
  status: 'Selesai' | 'Proses';
}

export interface StockAlert {
  id: string;
  name: string;
  category: string;
  remaining: number;
  status: 'kritis' | 'normal' | 'peringatan';
  icon: string;
}
