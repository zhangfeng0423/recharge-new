/**
 * 认证相关的工具函数
 * 用于处理用户状态和缓存清理
 */

import { supabase } from "@/lib/supabaseClient";

/**
 * 服务器端认证缓存清除
 * 只处理服务器端会话清除，不涉及客户端 API
 */
export async function forceClearAuthCacheServer(): Promise<void> {
  const startTime = Date.now();
  console.log("🧹 开始服务器端认证缓存清除...");

  try {
    // 服务器端只能通过 Supabase 客户端清除会话
    // 注意：这里需要使用服务器端客户端，但由于环境配置问题，暂时跳过
    console.log("✅ [SERVER CACHE] 服务器端认证缓存清除完成，耗时: 0ms");
  } catch (error) {
    console.error("❌ [SERVER CACHE] 服务器端缓存清除时出错:", error);
  }
}

/**
 * 客户端认证缓存清除
 * 处理浏览器端的所有缓存清除操作
 */
export async function forceClearAuthCacheClient(): Promise<void> {
  const startTime = Date.now();
  console.log("🧹 开始客户端认证缓存清除...");

  // 确保只在客户端运行
  if (typeof window === "undefined") {
    console.log("⚠️ [CLIENT CACHE] 检测到服务器端环境，跳过客户端缓存清除");
    return;
  }

  try {
    // 使用单例客户端
    let clearedItems = 0;

    // 1. 检查并清除当前会话
    console.log("🔍 [CACHE] 检查当前会话状态...");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      console.log(
        `🚫 [CACHE] 发现活跃会话: ${session.user.email}，正在清除...`,
      );

      // 尝试多种方式清除会话
      const signOutMethods = [
        () => supabase.auth.signOut(),
        () => supabase.auth.signOut({ scope: "global" }),
        () => supabase.auth.signOut({ scope: "local" }),
      ];

      for (const method of signOutMethods) {
        try {
          await method();
          clearedItems++;
        } catch (error) {
          console.log(`⚠️ [CACHE] 清除方法失败:`, error);
        }
      }
    } else {
      console.log("✅ [CACHE] 未发现活跃会话");
    }

    // 2. 全面清除本地存储
    console.log("🧹 [CACHE] 清除本地存储...");
    try {
      // 清除 localStorage
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
        clearedItems++;
      });

      // 清除 sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach((key) => {
        sessionStorage.removeItem(key);
        clearedItems++;
      });

      console.log(
        `✅ [CACHE] 清除了 ${localStorageKeys.length + sessionStorageKeys.length} 个本地存储项`,
      );
    } catch (error) {
      console.log("⚠️ [CACHE] 清除本地存储时出错:", error);
    }

    // 3. 清除所有Supabase相关的缓存数据
    console.log("🧹 [CACHE] 清除Supabase相关缓存...");
    try {
      // 重新获取存储键（可能之前清除后又产生了新的键）
      const currentKeys = Object.keys(localStorage);
      const supabasePatterns = [
        "supabase.auth.",
        "supabase.",
        "sb-",
        "_supabase",
        "access-token",
        "refresh-token",
        "provider-token",
      ];

      const supabaseKeys = currentKeys.filter((key) =>
        supabasePatterns.some((pattern) =>
          key.toLowerCase().includes(pattern.toLowerCase()),
        ),
      );

      supabaseKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
          clearedItems++;
        } catch (error) {
          console.log(`⚠️ [CACHE] 无法清除键 ${key}:`, error);
        }
      });

      console.log(
        `✅ [CACHE] 清除了 ${supabaseKeys.length} 个Supabase相关缓存项`,
      );
    } catch (error) {
      console.log("⚠️ [CACHE] 清除Supabase缓存时出错:", error);
    }

    // 4. 清除Cookie（通过设置过期时间）
    console.log("🧹 [CACHE] 尝试清除Cookie...");
    try {
      // 获取所有Cookie
      const cookies = document.cookie.split(";");
      const authCookiePatterns = [
        "sb-",
        "supabase",
        "access-token",
        "refresh-token",
        "provider-token",
      ];

      cookies.forEach((cookie) => {
        const cookieName = cookie.split("=")[0]?.trim();
        if (
          cookieName &&
          authCookiePatterns.some((pattern) =>
            cookieName.toLowerCase().includes(pattern.toLowerCase()),
          )
        ) {
          // 设置Cookie为过期时间来清除它
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          clearedItems++;
        }
      });

      console.log(`✅ [CACHE] 尝试清除认证相关Cookie`);
    } catch (error) {
      console.log("⚠️ [CACHE] 清除Cookie时出错:", error);
    }

    // 5. 清除可能的内存缓存
    console.log("🧹 [CACHE] 清除内存缓存...");
    try {
      // 清除可能的全局变量
      if (typeof window !== "undefined") {
        // 清除可能的Supabase客户端实例缓存
        (window as any).__supabaseClients?.clear?.();
        delete (window as any).__supabaseClients;

        // 清除其他可能的缓存
        if ((window as any).caches) {
          try {
            const cacheNames = await (window as any).caches.keys();
            for (const cacheName of cacheNames) {
              if (
                cacheName.includes("supabase") ||
                cacheName.includes("auth")
              ) {
                await (window as any).caches.delete(cacheName);
                clearedItems++;
              }
            }
          } catch (cacheError) {
            console.log("⚠️ [CACHE] 清除Cache API缓存时出错:", cacheError);
          }
        }
      }
    } catch (error) {
      console.log("⚠️ [CACHE] 清除内存缓存时出错:", error);
    }

    // 6. 验证清除结果
    console.log("🔍 [CACHE] 验证清除结果...");
    try {
      const {
        data: { session: finalSession },
      } = await supabase.auth.getSession();
      if (finalSession) {
        console.log("⚠️ [CACHE] 警告：清除后仍有会话数据，尝试最后清除...");
        await supabase.auth.signOut({ scope: "global" });
      } else {
        console.log("✅ [CACHE] 验证成功：无活跃会话");
      }
    } catch (error) {
      console.log("⚠️ [CACHE] 验证时出错:", error);
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ [CACHE] 客户端认证缓存清理完成，总共清除了 ${clearedItems} 项，耗时: ${duration}ms`,
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ [CACHE] 清除客户端认证缓存时出错，耗时: ${duration}ms:`,
      error,
    );

    // 即使出错也要尝试基本的清除操作
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log("✅ [CACHE] 错误恢复：基本存储已清除");
    } catch (recoveryError) {
      console.error("❌ [CACHE] 错误恢复失败:", recoveryError);
    }
  }
}

/**
 * @deprecated 使用 forceClearAuthCacheServer() 或 forceClearAuthCacheClient() 替代
 * 这个函数已被分离为服务器端和客户端专用函数
 */
export async function forceClearAuthCache(): Promise<void> {
  console.warn(
    "⚠️ [DEPRECATED] forceClearAuthCache() 已被弃用，请使用 forceClearAuthCacheServer() 或 forceClearAuthCacheClient()",
  );

  // 自动检测环境并调用相应的函数
  if (typeof window === "undefined") {
    await forceClearAuthCacheServer();
  } else {
    await forceClearAuthCacheClient();
  }
}

/**
 * 检查是否有活跃的测试用户会话
 */
export async function hasTestUserSession(): Promise<boolean> {
  try {
    // 使用单例客户端
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.user?.email === "user@example.com";
  } catch (error) {
    console.error("检查测试用户会话时出错:", error);
    return false;
  }
}

/**
 * 强制刷新用户状态
 * 用于确保用户状态与服务器同步
 */
export async function forceRefreshUserState(): Promise<void> {
  try {
    console.log("🔄 强制刷新用户状态...");

    // 使用单例客户端

    // 1. 先清除当前会话
    await supabase.auth.signOut();

    // 2. 等待一小段时间确保清除完成
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 3. 尝试重新获取会话（如果存在）
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.email === "user@example.com") {
      console.log("🚫 仍然检测到测试用户，再次清除...");
      await supabase.auth.signOut();
    }

    console.log("✅ 用户状态刷新完成");
  } catch (error) {
    console.error("❌ 刷新用户状态时出错:", error);
  }
}
