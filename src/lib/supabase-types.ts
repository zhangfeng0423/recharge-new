/**
 * Database Types for Game Recharge Platform
 *
 * This file contains TypeScript type definitions for all database tables
 * Generated based on the schema in supabase/migrations/20250109_001_initial_schema.sql
 *
 * These types are used throughout the application for type safety and
 * IntelliSense support when working with Supabase data.
 */

// =============================================================================
// BASE INTERFACES
// =============================================================================

// Common fields that appear in multiple tables
export interface BaseTimestamps {
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// =============================================================================
// TABLE INTERFACES
// =============================================================================

export interface Profile extends BaseTimestamps {
  id: string; // UUID, references auth.users.id
  role: "USER" | "MERCHANT" | "ADMIN";
  merchant_name?: string | null; // Only for MERCHANT role
}

export interface Game extends BaseTimestamps {
  id: string; // UUID
  name: GameName; // JSONB: {"en": "English Name", "zh": "中文名称"}
  description?: GameDescription | null; // JSONB: {"en": "Description", "zh": "描述"}
  banner_url?: string | null;
  merchant_id: string; // UUID, references profiles.id
}

export interface Sku extends BaseTimestamps {
  id: string; // UUID
  name: SkuName; // JSONB: {"en": "SKU Name", "zh": "商品名称"}
  description?: SkuDescription | null; // JSONB: {"en": "Description", "zh": "描述"}
  prices: SkuPrices; // JSONB: {"usd": 1099, "eur": 999}
  image_url?: string | null;
  game_id: string; // UUID, references games.id
}

export interface Order extends BaseTimestamps {
  id: string; // UUID
  user_id: string; // UUID, references profiles.id
  sku_id: string; // UUID, references skus.id
  merchant_id: string; // UUID, references profiles.id
  amount: number; // Integer amount in cents (e.g., 1099 = $10.99)
  currency: string; // V1 always "usd"
  status: "pending" | "completed" | "failed";
  stripe_checkout_session_id?: string | null;
}

// =============================================================================
// JSONB TYPE DEFINITIONS
// =============================================================================

export interface GameName {
  en: string;
  zh: string;
}

export interface GameDescription {
  en: string;
  zh: string;
}

export interface SkuName {
  en: string;
  zh: string;
}

export interface SkuDescription {
  en: string;
  zh: string;
}

export interface SkuPrices {
  usd: number; // Amount in cents
  eur?: number; // Reserved for future use
  jpy?: number; // Reserved for future use
}

// =============================================================================
// RELATIONSHIP TYPES
// =============================================================================

// Game with its related SKUs
export interface GameWithSkus extends Game {
  skus: Sku[];
}

// Order with all related data
export interface OrderWithDetails extends Order {
  user: Profile;
  sku: Sku;
  merchant: Profile;
}

// SKU with game information
export interface SkuWithGame extends Sku {
  game: Game;
}

// Merchant with their games and analytics
export interface MerchantWithAnalytics extends Profile {
  games: Game[];
  total_orders?: number;
  total_revenue?: number;
  completed_orders?: number;
}

// =============================================================================
// API INPUT/OUTPUT TYPES
// =============================================================================

// Input types for server actions and API endpoints
export interface CreateGameInput {
  name: GameName;
  description?: GameDescription;
  banner_url?: string;
}

export interface UpdateGameInput {
  name?: GameName;
  description?: GameDescription;
  banner_url?: string;
}

export interface CreateSkuInput {
  name: SkuName;
  description?: SkuDescription;
  prices: SkuPrices;
  image_url?: string;
  game_id: string;
}

export interface UpdateSkuInput {
  name?: SkuName;
  description?: SkuDescription;
  prices?: SkuPrices;
  image_url?: string;
}

export interface CreateOrderInput {
  sku_id: string;
  user_id?: string; // Will be auto-populated from auth
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface MerchantAnalytics {
  merchant_id: string;
  merchant_name: string | null;
  total_games: number;
  total_skus: number;
  total_orders: number;
  total_revenue: number; // In cents
  completed_orders: number;
  last_order_date: string | null;
}

export interface OrderAnalytics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  orders_by_status: {
    pending: number;
    completed: number;
    failed: number;
  };
}

// =============================================================================
// STRIPE INTEGRATION TYPES
// =============================================================================

export interface StripeCheckoutSessionInput {
  sku_id: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
}

export interface StripeCheckoutSessionOutput {
  session_id: string;
  session_url: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      client_reference_id?: string; // Our order ID
      payment_status?: string;
      amount_total?: number;
      currency?: string;
    };
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Helper type to make optional properties required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Helper type for database rows (which may have additional columns)
export type DatabaseRow<T> = T & Record<string, any>;

// Helper type for API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

// Helper type for paginated responses
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  has_more: boolean;
  page: number;
  page_size: number;
}

// =============================================================================
// DATABASE TYPE EXPORTS FOR SUPABASE CLIENT
// =============================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      games: {
        Row: Game;
        Insert: Omit<Game, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Game>;
      };
      skus: {
        Row: Sku;
        Insert: Omit<Sku, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Sku>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Order>;
      };
    };
    Views: {
      merchant_analytics: {
        Row: MerchantAnalytics;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_merchant_game_ids: {
        Args: {
          p_merchant_id: string;
        };
        Returns: {
          game_id: string;
        }[];
      };
    };
    Enums: {
      profiles_role: "USER" | "MERCHANT" | "ADMIN";
      orders_status: "pending" | "completed" | "failed";
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};
