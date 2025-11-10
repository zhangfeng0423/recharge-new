/**
 * Supabase 客户端调试工具
 * 用于检测多实例问题和验证单例模式
 */

import { supabase } from "./supabaseClient";

let clientCount = 0;

/**
 * 获取 Supabase 客户端实例计数
 */
export function getSupabaseClientCount(): number {
  return clientCount;
}

/**
 * 检查是否为单例模式
 */
export function checkSingletonMode(): boolean {
  // 在浏览器环境中检查 window 对象上的标记
  if (typeof window !== "undefined") {
    const marker = (window as any).__supabaseClientSingleton__;

    if (!marker) {
      // 第一次检查，设置标记
      (window as any).__supabaseClientSingleton__ = supabase;
      clientCount++;
      console.log("🔗 [Supabase Debug] 首次检测到客户端实例");
      return true;
    } else if (marker === supabase) {
      // 相同实例，单例模式正确
      console.log("✅ [Supabase Debug] 检测到单例客户端实例");
      return true;
    } else {
      // 不同实例，多实例问题
      console.error("❌ [Supabase Debug] 检测到多个 Supabase 客户端实例!");
      console.error("   实例1:", marker);
      console.error("   实例2:", supabase);
      return false;
    }
  }

  return true; // 非浏览器环境，假设正常
}

/**
 * 获取调试信息
 */
export function getSupabaseDebugInfo() {
  const info = {
    singleton: checkSingletonMode(),
    clientCount,
    currentClient: supabase ? "exists" : "missing",
    environment: typeof window !== "undefined" ? "browser" : "server",
    timestamp: new Date().toISOString(),
  };

  console.log("📊 [Supabase Debug] 调试信息:", info);
  return info;
}

/**
 * 重置调试状态
 */
export function resetDebugState() {
  clientCount = 0;
  if (typeof window !== "undefined") {
    delete (window as any).__supabaseClientSingleton__;
  }
  console.log("🔄 [Supabase Debug] 调试状态已重置");
}

// 自动检查
if (typeof window !== "undefined") {
  // 延迟检查以确保模块加载完成
  setTimeout(() => {
    checkSingletonMode();
  }, 100);
}
