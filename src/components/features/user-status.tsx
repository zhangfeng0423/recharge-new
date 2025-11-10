"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  forceClearAuthCacheClient,
  hasTestUserSession,
} from "@/lib/auth-utils";
import { supabase } from "@/lib/supabaseClient";

// 统一的用户类型，支持更宽泛的 role 字段
interface User {
  id: string;
  email: string;
  role: "USER" | "MERCHANT" | "ADMIN" | string; // 支持更宽泛的类型
  merchant_name?: string | null;
}

interface UserStatusProps {
  initialUser: User | null;
  locale: string;
}

export function UserStatus({ initialUser, locale }: UserStatusProps) {
  const t = useTranslations("common");
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let authListenerSetup = false;

    // Check for test user session first, then set up auth listener
    const checkAndSetupAuth = async () => {
      if (!mounted) return;

      // 使用单例客户端

      try {
        // Only clear cache if we detect a test user session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user?.email === "user@example.com") {
          await forceClearAuthCacheClient();
          await supabase.auth.signOut();
          if (mounted) setUser(null);
          return;
        }

        // Set up auth state listener only if component is still mounted
        if (!mounted) return;

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          // Ensure component is still mounted before processing auth events
          if (!mounted) return;


          if (event === "SIGNED_IN" && session?.user) {
            // Check if this is the test user that shouldn't be active
            if (session.user.email === "user@example.com") {
              console.log("🚫 Blocking test user session, signing out...");
              await supabase.auth.signOut();
              await forceClearAuthCacheClient();
              if (mounted) setUser(null);
              return;
            }

            // User signed in, fetch profile
            setLoading(true);
            try {
              const response = await fetch("/api/auth/ensure-profile", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: session.user.id,
                  email: session.user.email,
                }),
              });

              if (response.ok) {
                const result = await response.json();
                console.log("Profile API response:", result);
                console.log("User role from API:", result.role);

                const userRole = result.role || "USER";
                console.log("Final user role:", userRole);

                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role: userRole,
                    merchant_name: null,
                  });
                }
              } else {
                console.log("Profile API failed, using default USER role");
                // Still set user even if profile sync fails
                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role: "USER",
                    merchant_name: null,
                  });
                }
              }
            } catch (error) {
              console.error("Error fetching profile:", error);
              console.log("Using default USER role due to error");
              // Still set user
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email!,
                  role: "USER",
                  merchant_name: null,
                });
              }
            } finally {
              if (mounted) setLoading(false);
            }
          } else if (event === "SIGNED_OUT") {
            if (mounted) setUser(null);
          }
        });

        authListenerSetup = true;

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error("Error setting up auth listener:", error);
      }
    };

    checkAndSetupAuth();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("🚪 [FRONTEND] 开始前端登出流程...");

    try {
      // 1. 先清除本地状态
      console.log("🧹 [FRONTEND] 清除本地用户状态...");
      setUser(null);
      setDropdownOpen(false);

      // 2. 清除本地缓存和存储
      console.log("🧹 [FRONTEND] 清除本地缓存...");
      await forceClearAuthCacheClient();

      // 3. 调用登出API
      console.log("📡 [FRONTEND] 调用登出API...");
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("📡 [FRONTEND] 登出API响应:", result);

      if (!response.ok) {
        throw new Error(result.message || t("logoutFailed"));
      }

      // 4. 确保Supabase客户端状态也被清除
      console.log("🧹 [FRONTEND] 清除Supabase客户端状态...");
      // 使用单例客户端
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.log(
          "⚠️ [FRONTEND] Supabase客户端登出警告:",
          signOutError.message,
        );
      } else {
        console.log("✅ [FRONTEND] Supabase客户端状态已清除");
      }

      // 5. 使用Next.js路由进行导航和刷新
      console.log("🔄 [FRONTEND] 执行路由导航和刷新...");

      // 先导航到首页
      await router.push("/");

      // 然后刷新服务器组件状态
      await router.refresh();

      // 等待一小段时间确保状态更新完成
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log("✅ [FRONTEND] 登出流程完成");
    } catch (error) {
      console.error("❌ [FRONTEND] 登出错误:", error);

      // 即使出错也要尽力清除本地状态
      try {
        setUser(null);
        setDropdownOpen(false);
        await forceClearAuthCacheClient();

        // 使用单例客户端
        await supabase.auth.signOut();

        // 仍然尝试导航
        await router.push("/");
        await router.refresh();

        console.log("✅ [FRONTEND] 错误恢复完成");
      } catch (recoveryError) {
        console.error("❌ [FRONTEND] 错误恢复失败:", recoveryError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case "ADMIN":
        return `/${locale}/dashboard/admin`;
      case "MERCHANT":
        return `/${locale}/dashboard/merchant`;
      default:
        return `/${locale}/dashboard`;
    }
  };

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case "ADMIN":
        return t("roles.admin");
      case "MERCHANT":
        return t("roles.merchant");
      default:
        return t("roles.player");
    }
  };

  // 类型守卫函数，检查是否为有效角色
  const isValidRole = (role: string): role is "USER" | "MERCHANT" | "ADMIN" => {
    return role === "USER" || role === "MERCHANT" || role === "ADMIN";
  };

  // 调试函数：记录当前用户角色信息
  const debugUserRole = () => {
    if (user) {
      console.log("=== User Role Debug Info ===");
      console.log("User email:", user.email);
      console.log("User role:", user.role);
      console.log("Is valid role:", isValidRole(user.role));
      console.log(
        "Should show order history:",
        isValidRole(user.role) && user.role === "USER",
      );
      console.log(
        "Should show dashboard:",
        isValidRole(user.role) &&
          (user.role === "ADMIN" || user.role === "MERCHANT"),
      );
      console.log("=============================");
    }
  };

  // 在渲染时调用调试函数
  useEffect(() => {
    debugUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-[#359EFF] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">
          {t("loading")}
        </span>
      </div>
    );
  }

  return user ? (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
      >
        <span>{user.email}</span>
        <svg
          className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">
              {user.email}
            </div>
            <div className="text-xs text-gray-500">{getRoleDisplayName()}</div>
          </div>

          {/* Dashboard Link - Only for ADMIN and MERCHANT */}
          {isValidRole(user.role) &&
            (user.role === "ADMIN" || user.role === "MERCHANT") && (
              <Link
                href={getDashboardLink()}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {t("dashboard")}
              </Link>
            )}

          {/* Games Page - Only for USER */}
          {isValidRole(user.role) && user.role === "USER" && (
            <Link
              href={`/${locale}`}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {t("gameStore")}
            </Link>
          )}

          {/* Orders History - Only for USER */}
          {isValidRole(user.role) && user.role === "USER" && (
            <Link
              href={`/${locale}/orders`}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {t("orderHistory")}
            </Link>
          )}

          {/* Logout */}
          <form onSubmit={handleLogout} className="border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t("logout")}
            </button>
          </form>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  ) : (
    <a
      href={`/${locale}/auth`}
      className="text-sm text-[#359EFF] hover:text-[#359EFF]/80 font-medium"
    >
      {t("login")}
    </a>
  );
}
