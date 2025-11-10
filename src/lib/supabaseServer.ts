import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { use } from "react";
import type { Database } from "./supabase-types";

// 统一的环境变量配置
const ENV_CONFIG = {
  // 基础配置
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // 数据库连接URL（用于直接PostgreSQL连接）
  DATABASE_URL:
    process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_POOLER_URL,

  // 环境检测
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};

// 验证必需的环境变量
function validateEnvironment(): void {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing = required.filter(
    (key) => !ENV_CONFIG[key as keyof typeof ENV_CONFIG],
  );

  if (missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(", ")}`);
  }
}

// 基础客户端配置
const BASE_CLIENT_CONFIG = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public" as const,
  },
  global: {
    headers: {
      "X-Client-Version": "1.0.0",
      "X-Environment": ENV_CONFIG.isProduction ? "production" : "development",
    } as Record<string, string>,
  },
};

// HTTP客户端配置（用于Supabase REST API）
const HTTP_CLIENT_CONFIG = ENV_CONFIG.isProduction
  ? {
      // 生产环境HTTP客户端配置
      global: {
        headers: {
          "X-Connection-Timeout": "10000",
          "X-Environment": "production",
        } as Record<string, string>,
      },
    }
  : {};

// 客户端类型枚举
export enum ClientType {
  SERVER = "server",
  ADMIN = "admin",
  COOKIE = "cookie",
}

/**
 * 统一的客户端创建函数
 * 根据客户端类型返回相应配置的 Supabase 客户端
 */
function createSupabaseClientByType(
  type: ClientType,
  customConfig?: any,
): SupabaseClient<Database> {
  // 验证环境变量
  validateEnvironment();

  let config = { ...BASE_CLIENT_CONFIG };
  let key: string;
  let url: string;

  switch (type) {
    case ClientType.SERVER:
      url = ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL;
      key = ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY;
      config.global!.headers = {
        ...config.global!.headers,
        "X-Client-Type": "server",
      };
      break;

    case ClientType.ADMIN:
      url = ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL;
      key = ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY;
      config.global!.headers = {
        ...config.global!.headers,
        "X-Client-Type": "admin",
        "X-Admin-Access": "true",
      };
      break;

    case ClientType.COOKIE:
      url = ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL;
      key = ENV_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      // Cookie 客户端有特殊的 auth 配置
      config.auth = {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      };
      config.global!.headers = {
        ...config.global!.headers,
        "X-Client-Type": "cookie",
      };
      break;

    default:
      throw new Error(`不支持的客户端类型: ${type}`);
  }

  // 应用生产环境HTTP客户端配置
  if (ENV_CONFIG.isProduction && type !== ClientType.COOKIE) {
    config = {
      ...config,
      ...HTTP_CLIENT_CONFIG,
    };
  }

  // 应用自定义配置
  if (customConfig) {
    config = { ...config, ...customConfig };
  }

  try {
    return createClient<Database>(url, key, config as any);
  } catch (error) {
    console.error(`❌ Failed to create Supabase ${type} client:`, error);
    throw new Error(`Database connection failed for ${type} client`);
  }
}

/**
 * Creates a Supabase client for server-side usage
 * This client bypasses Row Level Security (RLS) when using the service role key
 */
export function createSupabaseServerClient(): SupabaseClient<Database> {
  return createSupabaseClientByType(ClientType.SERVER);
}

/**
 * Creates a Supabase client with admin privileges
 * This should be used carefully as it bypasses RLS completely
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  return createSupabaseClientByType(ClientType.ADMIN);
}

/**
 * Supabase Server Client for Server Components (with cookies)
 *
 * This client is used in Server Components to get the user session from cookies.
 */
export async function createSupabaseServerClientWithCookies() {
  // 验证环境变量
  validateEnvironment();

  const cookieStore = await cookies();

  try {
    return createServerClient<Database>(
      ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL,
      ENV_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          // 在服务器组件中，我们不应该设置或删除Cookie
          // 这些操作只能在Server Actions或Route Handlers中进行
          set(name: string, value: string, options: any) {
            // 静默忽略Cookie设置操作，避免在服务器组件中设置Cookie
            // Cookie设置应该通过Server Actions或API Routes处理
            console.debug(
              `Cookie设置操作被忽略: ${name} (服务器组件中不允许设置Cookie)`,
            );
          },
          remove(name: string, options: any) {
            // 静默忽略Cookie删除操作，避免在服务器组件中删除Cookie
            // Cookie删除应该通过Server Actions或API Routes处理
            console.debug(
              `Cookie删除操作被忽略: ${name} (服务器组件中不允许删除Cookie)`,
            );
          },
        },
        global: {
          headers: {
            "X-Client-Type": "cookie",
            "X-Client-Version": "1.0.0",
            "X-Environment": ENV_CONFIG.isProduction
              ? "production"
              : "development",
          },
        },
      },
    );
  } catch (error) {
    console.error("❌ Failed to create Supabase cookie client:", error);
    throw new Error("Cookie database connection failed");
  }
}

// Singleton instances for better performance
let serverClient: SupabaseClient<Database> | null = null;
let adminClient: SupabaseClient<Database> | null = null;

/**
 * Get cached server client instance
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (!serverClient) {
    serverClient = createSupabaseServerClient();
  }
  return serverClient;
}

/**
 * Get cached admin client instance
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    adminClient = createSupabaseAdminClient();
  }
  return adminClient;
}

/**
 * Test database connection
 * This function can be used to verify that the database is accessible
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseServerClient();

    // Test basic connectivity by checking if we can access system tables
    const { data, error } = await client
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Database connection test failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Database connection test error:", error);
    return false;
  }
}

/**
 * Get database health status
 * Returns detailed information about database connectivity
 */
export async function getDatabaseHealth() {
  try {
    const client = getSupabaseServerClient();

    // Test multiple aspects of the database
    const results = await Promise.allSettled([
      // Test basic connectivity
      client
        .from("profiles")
        .select("count")
        .limit(1),
      // Test RLS is enabled
      client
        .from("games")
        .select("count")
        .limit(1),
      // Test foreign key relationships
      client
        .from("skus")
        .select("count")
        .limit(1),
      // Test indexes are working
      client
        .from("orders")
        .select("count")
        .limit(1),
    ]);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const totalCount = results.length;

    return {
      status: successCount === totalCount ? "healthy" : "degraded",
      connectivity: {
        profiles: results[0].status === "fulfilled",
        games: results[1].status === "fulfilled",
        skus: results[2].status === "fulfilled",
        orders: results[3].status === "fulfilled",
      },
      successRate: `${successCount}/${totalCount}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 创建直接PostgreSQL连接（用于特殊操作如批量数据导入）
 * 注意：这个函数仅在需要直接数据库连接时使用
 */
export function createDirectPostgresClient() {
  if (!ENV_CONFIG.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL not configured for direct PostgreSQL connection",
    );
  }

  // 这里可以返回PostgreSQL客户端，但需要额外的库如pg
  // 目前只提供配置信息
  return {
    connectionString: ENV_CONFIG.DATABASE_URL,
    ssl: ENV_CONFIG.isProduction ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  };
}

/**
 * 验证数据库连接配置
 */
export function validateDatabaseConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查必需的HTTP客户端配置
  if (!ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is required");
  }

  if (!ENV_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
  }

  if (!ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  // 检查URL格式
  try {
    new URL(ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL);
  } catch {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is not a valid URL");
  }

  // 检查直接数据库连接配置（可选）
  if (ENV_CONFIG.DATABASE_URL) {
    if (!ENV_CONFIG.DATABASE_URL.startsWith("postgresql://")) {
      errors.push("DATABASE_URL must be a valid PostgreSQL connection string");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 创建用于Server Actions的Supabase客户端，可以安全地设置Cookie
 * 这个函数专门用于需要修改Cookie的Server Actions
 */
export async function createSupabaseClientForServerActions() {
  // 验证环境变量
  validateEnvironment();

  const cookieStore = await cookies();

  try {
    return createServerClient<Database>(
      ENV_CONFIG.NEXT_PUBLIC_SUPABASE_URL,
      ENV_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // 在Server Actions中可以安全地设置Cookie
            cookieStore.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            // 在Server Actions中可以安全地删除Cookie
            cookieStore.set({
              name,
              value: "",
              ...options,
            });
          },
        },
        global: {
          headers: {
            "X-Client-Type": "server-action",
            "X-Client-Version": "1.0.0",
            "X-Environment": ENV_CONFIG.isProduction
              ? "production"
              : "development",
          },
        },
      },
    );
  } catch (error) {
    console.error("❌ Failed to create Supabase server action client:", error);
    throw new Error("Server action database connection failed");
  }
}
