// =============================================================================
// MERCHANT ANALYTICS TYPES
// =============================================================================
// TypeScript type definitions for merchant analytics RPC functions
// These types should match the JSON structure returned by the SQL functions

export interface MerchantAnalytics {
  // Summary metrics
  total_revenue: number; // in cents
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  failed_orders: number;
  unique_customers: number;
  average_order_value: number; // in dollars
  conversion_rate: number; // percentage

  // Time-based metrics
  today_revenue: number; // in cents
  today_orders: number;
  yesterday_revenue: number; // in cents
  yesterday_orders: number;
  this_month_revenue: number; // in cents
  this_month_orders: number;
  last_month_revenue: number; // in cents
  last_month_orders: number;

  // Aggregated data
  top_skus: TopSku[];
  daily_sales: DailySale[];
  revenue_by_game: GameRevenue[];
  order_status_breakdown: OrderStatus[];
  hourly_sales: HourlySale[];
  recent_orders: RecentOrder[];
}

export interface TopSku {
  sku_id: string;
  sku_name: string;
  game_name: string;
  total_revenue: number; // in cents
  order_count: number;
  price: string; // price in cents as string
}

export interface DailySale {
  date: string; // YYYY-MM-DD
  revenue: number; // in cents
  orders: number;
  completed_orders: number;
}

export interface GameRevenue {
  game_id: string;
  game_name: string;
  total_revenue: number; // in cents
  order_count: number;
  sku_count: number;
}

export interface OrderStatus {
  status: "pending" | "completed" | "failed";
  count: number;
  percentage: number;
}

export interface HourlySale {
  hour: number; // 0-23
  revenue: number; // in cents
  orders: number;
}

export interface RecentOrder {
  order_id: string;
  customer_email: string; // Generated from user_id since email is not stored in orders table
  sku_name: string;
  game_name: string;
  amount: number; // in cents
  currency: string;
  status: "pending" | "completed" | "failed";
  created_at: string; // ISO timestamp
}

export interface MerchantOrdersOverview {
  orders: Order[];
  total_count: number;
  summary: OrdersSummary;
}

export interface Order {
  order_id: string;
  customer_email: string; // Generated from user_id since email is not stored in orders table
  sku_id: string;
  sku_name: string;
  game_id: string;
  game_name: string;
  amount: number; // in cents
  currency: string;
  status: "pending" | "completed" | "failed";
  price: string; // price in cents as string
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  // customer_registered_at field removed - doesn't exist in database schema
}

export interface OrdersSummary {
  total_orders: number;
  total_revenue: number; // in cents
  completed_orders: number;
  pending_orders: number;
  failed_orders: number;
  unique_customers: number;
  average_order_value: number; // in cents
  date_range: {
    start_date: string; // ISO timestamp
    end_date: string; // ISO timestamp
  };
  status_filter: string;
}

export interface MerchantProductsPerformance {
  skus: ProductPerformance[];
  summary: ProductsSummary;
}

export interface ProductPerformance {
  sku_id: string;
  sku_name: string;
  sku_description: string | null;
  price: string; // price in cents as string
  image_url: string | null;
  game_id: string;
  game_name: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number; // in cents
  average_order_value: number; // in dollars
  completion_rate: number; // percentage
  daily_average_orders: number;
  first_order_date: string; // ISO timestamp
  last_order_date: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

export interface ProductsSummary {
  total_skus: number;
  active_skus: number;
  total_revenue: number; // in cents
  total_orders: number;
  completed_orders: number;
  average_completion_rate: number;
  top_performing_sku: {
    sku_id: string;
    sku_name: string;
    revenue: number; // in cents
  } | null;
  date_range: {
    start_date: string; // ISO timestamp
    end_date: string; // ISO timestamp
  };
  game_filter: string;
}

export interface MerchantRevenueByGame {
  revenue_data: GameRevenueData[];
  summary: RevenueSummary;
}

export interface GameRevenueData {
  game_id: string;
  game_name: string;
  period: string; // ISO timestamp
  order_count: number;
  completed_orders: number;
  revenue: number; // in cents
  unique_customers: number;
  average_order_value: number; // in dollars
}

export interface RevenueSummary {
  total_games: number;
  active_games: number;
  total_revenue: number; // in cents
  total_orders: number;
  completed_orders: number;
  unique_customers: number;
  top_game: {
    game_id: string;
    game_name: string;
    revenue: number; // in cents
  } | null;
  period_breakdown: {
    period: string; // ISO timestamp
    revenue: number; // in cents
    orders: number;
  }[];
  date_range: {
    start_date: string; // ISO timestamp
    end_date: string; // ISO timestamp
  };
  group_by: "day" | "week" | "month";
}

// =============================================================================
// API PARAMETER TYPES
// =============================================================================

export interface MerchantAnalyticsParams {
  merchant_id: string;
  start_date?: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  timezone?: string; // e.g., 'America/New_York'
}

export interface MerchantOrdersOverviewParams {
  merchant_id: string;
  start_date?: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  status?: "pending" | "completed" | "failed";
  limit?: number;
  offset?: number;
}

export interface MerchantProductsPerformanceParams {
  merchant_id: string;
  start_date?: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  game_id?: string;
}

export interface MerchantRevenueByGameParams {
  merchant_id: string;
  start_date?: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  group_by?: "day" | "week" | "month";
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type OrderStatusType = "pending" | "completed" | "failed";
export type TimeGrouping = "day" | "week" | "month";

export interface DateRange {
  start_date: Date;
  end_date: Date;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

// =============================================================================
// RESPONSE WRAPPER TYPES (for consistent API responses)
// =============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

export class CurrencyFormatter {
  static centsToDollars(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  static formatCurrency(cents: number, currency: string = "USD"): string {
    const dollars = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(dollars);
  }
}

export class DateFormatter {
  static formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

  static formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString();
  }

  static formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}

// =============================================================================
// CHART DATA TRANSFORMERS
// =============================================================================

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export class ChartDataTransformer {
  static transformDailySales(dailySales: DailySale[]): ChartDataPoint[] {
    return dailySales.map((item) => ({
      x: item.date,
      y: parseFloat(CurrencyFormatter.centsToDollars(item.revenue)),
      label: `Orders: ${item.orders}`,
    }));
  }

  static transformHourlySales(hourlySales: HourlySale[]): ChartDataPoint[] {
    return hourlySales.map((item) => ({
      x: item.hour,
      y: parseFloat(CurrencyFormatter.centsToDollars(item.revenue)),
      label: `Orders: ${item.orders}`,
    }));
  }

  static transformRevenueByGame(
    revenueByGame: GameRevenue[],
  ): ChartDataPoint[] {
    return revenueByGame.map((item) => ({
      x: item.game_name,
      y: parseFloat(CurrencyFormatter.centsToDollars(item.total_revenue)),
      label: `Orders: ${item.order_count}`,
    }));
  }

  static transformOrderStatusBreakdown(
    breakdown: OrderStatus[],
  ): ChartDataPoint[] {
    return breakdown.map((item) => ({
      x: item.status,
      y: item.count,
      label: `${item.percentage}%`,
    }));
  }
}
