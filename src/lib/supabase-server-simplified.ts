/**
 * 简化的 Supabase 服务端客户端
 *
 * 这个文件提供了更简单、更可靠的 Supabase 客户端创建方法
 * 专门用于解决 AUTH_001 认证问题
 */

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./supabase-types";

// 环境变量验证
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

/**
 * 1. 带认证的 Cookie 客户端（用于 Server Components）
 * 从 Cookie 中读取用户会话
 */
export async function createSupabaseClientWithAuth() {
  try {
    const cookieStore = await cookies();

    const client = createServerClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // 在 Server Components 中不设置 Cookie
            // Cookie 设置应该在 Server Actions 或 API Routes 中进行
            console.debug(
              `[Supabase] Cookie set ignored in Server Component: ${name}`,
            );
          },
          remove(name: string, options: any) {
            // 在 Server Components 中不删除 Cookie
            console.debug(
              `[Supabase] Cookie remove ignored in Server Component: ${name}`,
            );
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );

    return client;
  } catch (error) {
    console.error("[Supabase] Failed to create auth client:", error);
    throw new Error("Failed to create Supabase auth client");
  }
}

/**
 * 2. 服务端客户端（用于 Server Actions）
 * 使用 Service Role Key，可以绕过 RLS
 */
export function createSupabaseServerActionClient() {
  try {
    const client = createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "X-Client-Type": "server-action",
          "X-Custom-Header": "game-recharge-platform",
        },
      },
    });

    return client;
  } catch (error) {
    console.error("[Supabase] Failed to create server action client:", error);
    throw new Error("Failed to create Supabase server action client");
  }
}

/**
 * 3. 管理员客户端（用于系统管理）
 * 拥有完全权限，绕过所有 RLS 策略
 */
export function createSupabaseAdminClient() {
  try {
    const client = createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "X-Client-Type": "admin",
          "X-Admin-Access": "true",
          "X-Custom-Header": "game-recharge-platform",
        },
      },
    });

    return client;
  } catch (error) {
    console.error("[Supabase] Failed to create admin client:", error);
    throw new Error("Failed to create Supabase admin client");
  }
}

/**
 * 4. 会话检查客户端（专门用于验证会话）
 * 优化的客户端，专门用于 getCurrentUser 函数
 */
export async function createSupabaseSessionCheckClient() {
  try {
    // 首先尝试从 Cookie 读取
    const cookieClient = await createSupabaseClientWithAuth();

    // 测试会话是否有效
    const {
      data: { session },
      error,
    } = await cookieClient.auth.getSession();

    if (session && !error) {
      console.log("[Supabase] Valid session found in cookies");
      return { client: cookieClient, session, method: "cookie" };
    }

    // 如果 Cookie 无效，回退到服务端客户端
    console.log("[Supabase] No valid session in cookies, trying server client");
    const serverClient = createSupabaseServerActionClient();

    const {
      data: { session: serverSession },
      error: serverError,
    } = await serverClient.auth.getSession();

    if (serverSession && !serverError) {
      console.log("[Supabase] Valid session found via server client");
      return { client: serverClient, session: serverSession, method: "server" };
    }

    // 如果都没有，返回 null session
    console.log("[Supabase] No valid session found");
    return { client: cookieClient, session: null, method: "none" };
  } catch (error) {
    console.error("[Supabase] Session check failed:", error);
    // 即使检查失败，也返回一个可用的客户端
    return {
      client: createSupabaseServerActionClient(),
      session: null,
      method: "fallback",
    };
  }
}

/**
 * 5. 快速连接测试
 * 用于验证 Supabase 连接是否正常工作
 */
export async function testSupabaseConnection() {
  try {
    const client = createSupabaseAdminClient();

    // 简单的连接测试
    const { data, error } = await client
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Supabase connection successful",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Supabase connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      error,
    };
  }
}

/**
 * 6. 健康检查函数
 * 全面检查 Supabase 配置和连接状态
 */
export async function performHealthCheck() {
  const health = {
    environment: {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
    },
    connection: null as any,
    session: null as any,
    timestamp: new Date().toISOString(),
  };

  try {
    // 测试连接
    health.connection = await testSupabaseConnection();

    // 测试会话
    const sessionCheck = await createSupabaseSessionCheckClient();
    health.session = {
      hasSession: !!sessionCheck.session,
      method: sessionCheck.method,
      userId: sessionCheck.session?.user?.id || null,
    };
  } catch (error) {
    health.connection = {
      success: false,
      message: `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      error,
    };
  }

  return health;
}

// 默认导出最常用的客户端
export default {
  withAuth: createSupabaseClientWithAuth,
  serverAction: createSupabaseServerActionClient,
  admin: createSupabaseAdminClient,
  sessionCheck: createSupabaseSessionCheckClient,
  testConnection: testSupabaseConnection,
  healthCheck: performHealthCheck,
};
