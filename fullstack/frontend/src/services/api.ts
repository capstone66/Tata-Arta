const API_BASE = ""

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token")
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Terjadi kesalahan jaringan" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

// ── Auth ──

export interface User {
  id: number
  email: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<{ message: string; token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then((res) => ({ token: res.token, user: res.user }))
}

export function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return request<{ message: string; token: string; user: User }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  }).then((res) => ({ token: res.token, user: res.user }))
}

export function getProfile(): Promise<User> {
  return request<{ user: User }>("/api/auth/profile").then((res) => res.user)
}

// ── Categories ──

export interface Category {
  id: number
  name: string
  type: "INCOME" | "EXPENSE"
  userId: number
  _count: { transactions: number }
}

export function getCategories(type?: string): Promise<Category[]> {
  const params = type ? `?type=${type}` : ""
  return request<{ categories: Category[] }>(`/api/categories${params}`).then(
    (res) => res.categories,
  )
}

export function getCategory(id: number): Promise<Category> {
  return request<{ category: Category }>(`/api/categories/${id}`).then((res) => res.category)
}

export function createCategory(data: { name: string; type: "INCOME" | "EXPENSE" }): Promise<Category> {
  return request<{ message: string; category: Category }>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res.category)
}

export function updateCategory(
  id: number,
  data: { name?: string; type?: "INCOME" | "EXPENSE" },
): Promise<Category> {
  return request<{ message: string; category: Category }>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then((res) => res.category)
}

export function deleteCategory(id: number): Promise<void> {
  return request<{ message: string }>(`/api/categories/${id}`, { method: "DELETE" }).then(
    () => undefined,
  )
}

// ── Transactions ──

export interface Transaction {
  id: number
  amount: number
  type: "INCOME" | "EXPENSE"
  description: string
  date: string
  categoryId: number
  category?: { id: number; name: string; type: "INCOME" | "EXPENSE" }
}

export interface TransactionParams {
  page?: number
  limit?: number
  type?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

interface TransactionsResponse {
  transactions: Transaction[]
  pagination: Pagination
}

export function getTransactions(params?: TransactionParams): Promise<PaginatedResponse<Transaction>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.type) searchParams.set("type", params.type)
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId)
  if (params?.startDate) searchParams.set("startDate", params.startDate)
  if (params?.endDate) searchParams.set("endDate", params.endDate)
  if (params?.search) searchParams.set("search", params.search)
  const qs = searchParams.toString()
  return request<TransactionsResponse>(`/api/transactions${qs ? `?${qs}` : ""}`).then((res) => ({
    data: res.transactions,
    ...res.pagination,
  }))
}

export function getTransaction(id: number): Promise<Transaction> {
  return request<{ transaction: Transaction }>(`/api/transactions/${id}`).then(
    (res) => res.transaction,
  )
}

export function createTransaction(
  data: Omit<Transaction, "id" | "category">,
): Promise<Transaction> {
  return request<{ message: string; transaction: Transaction }>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res.transaction)
}

export function updateTransaction(
  id: number,
  data: Partial<Omit<Transaction, "id" | "category">>,
): Promise<Transaction> {
  return request<{ message: string; transaction: Transaction }>(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then((res) => res.transaction)
}

export function deleteTransaction(id: number): Promise<void> {
  return request<{ message: string }>(`/api/transactions/${id}`, { method: "DELETE" }).then(
    () => undefined,
  )
}

// ── Products ──

export interface Product {
  id: number
  kodeBarang: string
  name: string
  price: number
  cost: number
  stock: number
  category: string
  subCategory?: string | null
  supplier?: string | null
  stokMin?: number | null
  stokMax?: number | null
  trxTotalQty?: number | null
  trxQty30d?: number | null
  trxQty90d?: number | null
  trxCount?: number | null
  trxTotalRevenue?: number | null
  trxTotalProfit?: number | null
}

export interface ProductParams {
  page?: number
  limit?: number
  search?: string
}

interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

export function getProducts(params?: ProductParams): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.search) searchParams.set("search", params.search)
  const qs = searchParams.toString()
  return request<ProductsResponse>(`/api/products${qs ? `?${qs}` : ""}`).then((res) => ({
    data: res.products,
    ...res.pagination,
  }))
}

export function getProduct(id: number): Promise<Product> {
  return request<{ product: Product }>(`/api/products/${id}`).then((res) => res.product)
}

export function createProduct(data: Omit<Product, "id">): Promise<Product> {
  return request<{ message: string; product: Product }>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res.product)
}

export function updateProduct(id: number, data: Partial<Omit<Product, "id">>): Promise<Product> {
  return request<{ message: string; product: Product }>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then((res) => res.product)
}

export function deleteProduct(id: number): Promise<void> {
  return request<{ message: string }>(`/api/products/${id}`, { method: "DELETE" }).then(
    () => undefined,
  )
}

// ── Dashboard ──

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  totalProfit: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyProfit: number
  yearlyIncome: number
  yearlyExpense: number
  yearlyProfit: number
  recentTransactions: Transaction[]
  topExpenseCategories: Array<{ categoryId: number; categoryName: string; total: number }>
}

export interface MonthlyData {
  month: number
  income: number
  expense: number
}

export interface DashboardStats {
  totalTransactions: number
  totalProducts: number
  totalCategories: number
}

export function getSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/api/dashboard/summary")
}

export function getMonthly(): Promise<MonthlyData[]> {
  return request<{ monthlyData: MonthlyData[] }>("/api/dashboard/monthly").then(
    (res) => res.monthlyData,
  )
}

export function getStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/dashboard/stats")
}

// ── Reports ──

export interface ReportProfitLoss {
  period: { startDate: string; endDate: string }
  totalIncome: number
  totalExpense: number
  netProfit: number
  profitMargin: number
  incomeByCategory: Array<{ categoryId: number; categoryName: string; total: number }>
  expenseByCategory: Array<{ categoryId: number; categoryName: string; total: number }>
  transactions: Transaction[]
}

export interface ReportCashflow {
  cashflow: Array<{ month: string; income: number; expense: number; balance: number }>
}

export function getProfitLoss(startDate?: string, endDate?: string): Promise<ReportProfitLoss> {
  const searchParams = new URLSearchParams()
  if (startDate) searchParams.set("startDate", startDate)
  if (endDate) searchParams.set("endDate", endDate)
  const qs = searchParams.toString()
  return request<ReportProfitLoss>(`/api/reports/profit-loss${qs ? `?${qs}` : ""}`)
}

export function getCashflow(months?: number): Promise<ReportCashflow> {
  const params = months ? `?months=${months}` : ""
  return request<ReportCashflow>(`/api/reports/cashflow${params}`)
}

// ── Product Search ──

export interface ProductSearchItem {
  kode_barang: string
  nama: string
  kategori: string
  sub_kategori: string | null
  supplier: string | null
  hpp: number
  harga_toko_1: number
  trx_total_qty: number
  trx_count: number
  match_score: number
}

export interface ProductSearchResponse {
  query: string
  count: number
  items: ProductSearchItem[]
}

export function searchProducts(q: string, limit?: number): Promise<ProductSearchResponse> {
  const params = new URLSearchParams()
  params.set("q", q)
  if (limit) params.set("limit", String(limit))
  return request(`/api/products/search?${params.toString()}`)
}

export function searchAiProducts(q: string, limit?: number): Promise<ProductSearchResponse> {
  const params = new URLSearchParams()
  params.set("q", q)
  if (limit) params.set("limit", String(limit))
  return request(`/api/ai/products/search?${params.toString()}`)
}

// ── AI ──

export interface AIHealth {
  status: string
  message: string
}

export interface AIMetadata {
  version: string
  lastTraining: string
  accuracy: number
}

export interface FastMovingPrediction {
  class_id: number
  prediction: "Slow Moving" | "Normal" | "Fast Moving"
  confidence: number
  probabilities: {
    "Slow Moving": number
    Normal: number
    "Fast Moving": number
  }
}

export interface LowStockPrediction {
  class_id: number
  prediction: "Stock Safe" | "Restock Priority"
  confidence: number
  restock_priority_score: number
  message: string
}

export interface ProfitPrediction {
  estimated_profit_ratio: number
  estimated_profit_percent: number
  profit_category: "Low Profit" | "Medium Profit" | "High Profit"
}

export interface MatchedProduct {
  match_type: string
  query: string
  matched_score: number
  kode_barang: string
  nama: string
  kategori: string
  sub_kategori?: string
  supplier: string
}

export interface PredictAllResponse {
  matched_product: MatchedProduct
  fast_moving: FastMovingPrediction
  low_stock: LowStockPrediction
  profit: ProfitPrediction
}

export interface PredictFastMovingResponse {
  matched_product: MatchedProduct
  class_id: number
  prediction: "Slow Moving" | "Normal" | "Fast Moving"
  confidence: number
  probabilities: {
    "Slow Moving": number
    Normal: number
    "Fast Moving": number
  }
}

export interface PredictLowStockResponse {
  matched_product: MatchedProduct
  class_id: number
  prediction: "Stock Safe" | "Restock Priority"
  confidence: number
  restock_priority_score: number
  message: string
}

export interface PredictProfitResponse {
  matched_product: MatchedProduct
  estimated_profit_ratio: number
  estimated_profit_percent: number
  profit_category: "Low Profit" | "Medium Profit" | "High Profit"
}

export interface TopProductItem {
  kode_barang: string
  nama: string
  kategori: string
  trx_total_qty: number
  trx_count: number
  reason: string
}

export interface HighProfitItem {
  kode_barang: string
  nama: string
  kategori: string
  estimated_profit_percent: number
  profit_category: string
  reason: string
}

export interface RestockPriorityItem {
  kode_barang: string
  nama: string
  kategori: string
  restock_priority_score: number
  fast_moving_status: string
  reason: string
}

export interface InsightsSummaryResponse {
  summary: {
    total_products: number
    fast_moving_products: number
    restock_priority_products: number
    high_profit_products: number
  }
  insights: string[]
}

export interface KpiHistoryItem {
  date: string
  revenue: number
  expense: number
  profit: number
  transactions: number
}

export interface KpiForecastItem {
  date: string
  predicted_revenue: number
  predicted_expense: number
  predicted_profit: number
  predicted_transactions: number
}

export interface ForecastKpiResponse {
  history: KpiHistoryItem[]
  forecast: KpiForecastItem[]
}

export interface ScanReceiptResponse {
  merchant_name: string
  transaction_date: string
  items: Array<{
    nama_produk: string
    qty: number
    harga: number
    total: number
  }>
  subtotal: number
  tax: number | null
  discount: number | null
  total_transaksi: number
  confidence: number
  raw_text: string
}

export type PredictPayload =
  | { kode_barang: string }
  | { nama_barang: string }
  | {
      nama_barang: string
      kategori?: string
      sub_kategori?: string
      supplier?: string
      hpp?: number
      harga_toko_1?: number
      stok_min?: number
      stok_max?: number
      total_stock?: number
      trx_total_qty?: number
      trx_qty_30d?: number
      trx_qty_60d?: number
      trx_qty_90d?: number
      trx_count?: number
      trx_total_revenue?: number
      trx_total_profit?: number
    }

export function getAIHealth(): Promise<AIHealth> {
  return request("/api/ai/health")
}

export function getAIMetadata(): Promise<AIMetadata> {
  return request("/api/ai/metadata")
}

export function predictAll(payload: PredictPayload): Promise<PredictAllResponse> {
  return request("/api/ai/predict/all", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function predictFastMoving(payload: PredictPayload): Promise<PredictFastMovingResponse> {
  return request("/api/ai/predict/fast-moving", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function predictLowStock(payload: PredictPayload): Promise<PredictLowStockResponse> {
  return request("/api/ai/predict/low-stock", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function predictProfit(payload: PredictPayload): Promise<PredictProfitResponse> {
  return request("/api/ai/predict/profit", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

// ── DS mode (GET) ──
export function getTopProducts(limit?: number): Promise<{ items: TopProductItem[] }> {
  const params = limit ? `?limit=${limit}` : ""
  return request(`/api/ai/recommendations/top-products${params}`)
}

export function getHighProfitProducts(limit?: number): Promise<{ items: HighProfitItem[] }> {
  const params = limit ? `?limit=${limit}` : ""
  return request(`/api/ai/recommendations/high-profit${params}`)
}

export function getRestockPriority(limit?: number): Promise<{ items: RestockPriorityItem[] }> {
  const params = limit ? `?limit=${limit}` : ""
  return request(`/api/ai/recommendations/restock-priority${params}`)
}

export function getInsightsSummary(): Promise<InsightsSummaryResponse> {
  return request("/api/ai/insights/summary")
}

export function getForecastDailyKPI(days?: number): Promise<ForecastKpiResponse> {
  const params = days ? `?days=${days}` : ""
  return request(`/api/ai/forecast/daily-kpi${params}`)
}

// ── FS mode (POST) ──
export function getTopProductsRealtime(): Promise<{ items: TopProductItem[] }> {
  return request("/api/ai/recommendations/top-products", { method: "POST", body: "{}" })
}

export function getHighProfitProductsRealtime(): Promise<{ items: HighProfitItem[] }> {
  return request("/api/ai/recommendations/high-profit", { method: "POST", body: "{}" })
}

export function getRestockPriorityRealtime(): Promise<{ items: RestockPriorityItem[] }> {
  return request("/api/ai/recommendations/restock-priority", { method: "POST", body: "{}" })
}

export function getInsightsSummaryRealtime(): Promise<InsightsSummaryResponse> {
  return request("/api/ai/insights/summary", { method: "POST", body: "{}" })
}

export function getForecastDailyKPIRealtime(days?: number): Promise<ForecastKpiResponse> {
  return request("/api/ai/forecast/daily-kpi", {
    method: "POST",
    body: JSON.stringify({ horizon_days: days ?? 7 }),
  })
}

export function scanReceipt(file: File): Promise<ScanReceiptResponse> {
  const formData = new FormData()
  formData.append("file", file)
  const token = localStorage.getItem("auth_token")
  return fetch("/api/ai/ocr/scan-receipt", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "OCR failed" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json() as Promise<ScanReceiptResponse>
  })
}

// ── Sales ──

export interface SaleItem {
  id: number
  saleId: number
  productId: number
  qty: number
  price: number
  cost: number
  product: { id: number; name: string; kodeBarang: string }
}

export interface Sale {
  id: number
  total: number
  profit: number | null
  createdAt: string
  userId: number
  items: SaleItem[]
}

export function getSales(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Sale>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return request<{ sales: Sale[]; pagination: Pagination }>(`/api/sales${qs ? `?${qs}` : ""}`).then(
    (res) => ({ data: res.sales, ...res.pagination }),
  )
}

export function createSale(data: { items: Array<{ productId: number; qty: number }>; date?: string }): Promise<Sale> {
  return request<{ message: string; sale: Sale }>("/api/sales", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res.sale)
}

export function deleteSale(id: number): Promise<void> {
  return request<{ message: string }>(`/api/sales/${id}`, { method: "DELETE" }).then(() => undefined)
}
