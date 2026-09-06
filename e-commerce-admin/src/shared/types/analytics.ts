// ===== Dashboard Stats =====
export interface DashboardStat {
  value: number;
  change: number;
  changeType: "positive" | "negative";
}

export interface DashboardStats {
  revenue: DashboardStat;
  orders: DashboardStat;
  products: DashboardStat;
  users: DashboardStat;
}

// ===== Recent Orders =====
export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  statusType: "success" | "warning" | "info" | "danger";
  createdAt: string;
}

// ===== Revenue Trend =====
export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueTrendSummary {
  totalRevenue: number;
  totalOrders: number;
  avgDailyRevenue: number;
  avgDailyOrders: number;
  peakDay: {
    date: string;
    revenue: number;
    orders: number;
  };
}

export interface RevenueTrendResponse {
  trend: RevenueTrendPoint[];
  summary: RevenueTrendSummary;
}

// ===== Order Status =====
export interface OrderStatusItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  type: "success" | "warning" | "info" | "danger";
}

export interface OrderStatusResponse {
  distribution: OrderStatusItem[];
  total: number;
}

// ===== Payment Methods =====
export interface PaymentMethodItem {
  method: string;
  label: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface PaymentMethodsResponse {
  breakdown: PaymentMethodItem[];
  total: number;
  mostUsed: string | null;
}

// ===== Delivery Methods =====
export interface DeliveryMethodItem {
  method: string;
  label: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface DeliveryMethodsResponse {
  breakdown: DeliveryMethodItem[];
  total: number;
}

// ===== Top Products =====
export interface TopProduct {
  rank: number;
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  unitsSold: number;
  revenue: number;
  ordersCount: number;
}

// ===== Top Categories =====
export interface TopCategory {
  rank: number;
  categoryId: string;
  title: string;
  slug: string;
  revenue: number;
  units: number;
  percentage: number;
}

// ===== Order Heatmap =====
export interface HeatmapHour {
  hour: number;
  count: number;
}

export interface HeatmapDay {
  day: string;
  dayIndex: number;
  hours: HeatmapHour[];
}

export interface OrderHeatmapResponse {
  data: HeatmapDay[];
  maxValue: number;
  totalOrders: number;
}

// ===== Period Comparison =====
export interface PeriodMetric {
  current: number;
  previous: number;
  change: number;
}

export interface PeriodAnalytics {
  period: "day" | "week" | "month";
  periodLabel: string;
  revenue: PeriodMetric;
  orders: PeriodMetric;
  newUsers: PeriodMetric;
  avgOrderValue: PeriodMetric;
}

// ===== Analytics Overview =====
export interface AnalyticsOverview {
  comparisons: {
    day: PeriodAnalytics;
    week: PeriodAnalytics;
    month: PeriodAnalytics;
  };
  paymentMethods: PaymentMethodsResponse;
  orderStatus: OrderStatusResponse;
  deliveryMethods: DeliveryMethodsResponse;
}
