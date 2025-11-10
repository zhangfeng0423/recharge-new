"use client";

import { useEffect } from "react";
import { checkSingletonMode, getSupabaseDebugInfo } from "@/lib/supabase-debug";

/**
 * Supabase 客户端调试组件
 * 在开发环境中监控客户端实例状态
 */
export function SupabaseDebugger() {
  useEffect(() => {
    // 只在开发环境中运行
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    console.log("🔍 [Supabase Debugger] 开始监控客户端实例...");

    // 立即检查一次
    checkSingletonMode();

    // 定期检查（每5秒）
    const interval = setInterval(() => {
      const isSingleton = checkSingletonMode();

      if (!isSingleton) {
        console.warn("⚠️ [Supabase Debugger] 检测到多实例问题！");
      }
    }, 5000);

    // 页面卸载时清理
    return () => {
      clearInterval(interval);
      console.log("🛑 [Supabase Debugger] 停止监控");
    };
  }, []);

  useEffect(() => {
    // 在组件挂载时显示调试信息
    const debugInfo = getSupabaseDebugInfo();

    if (debugInfo.singleton) {
      console.log("✅ [Supabase Debugger] 单例模式正常工作");
    } else {
      console.error("❌ [Supabase Debugger] 存在多实例问题");
    }
  }, []);

  return null; // 这个组件不渲染任何内容，只用于调试
}
