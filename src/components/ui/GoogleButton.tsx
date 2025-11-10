"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

interface GoogleButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  onSuccess?: () => void;
  onError?: (error: string) => void;
  timeoutMs?: number; // 超时时间，默认30秒
}

export function GoogleButton({
  className = "",
  variant = "outline",
  size = "default",
  onSuccess,
  onError,
  timeoutMs = 30000, // 默认30秒超时
}: GoogleButtonProps) {
  const t = useTranslations("auth");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取应用URL，支持Vercel环境变量
  const getAppUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  };

  // 带超时的OAuth登录
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    // 设置超时定时器
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      const timeoutError = "Google sign in timed out. Please check your internet connection and try again.";
      setError(timeoutError);
      onError?.(timeoutError);
    }, timeoutMs);

    try {
      // 直接使用客户端Supabase实例进行OAuth
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getAppUrl()}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      // 清除超时定时器
      clearTimeout(timeoutId);

      if (oauthError) {
        console.error("Google OAuth error:", oauthError);
        const errorMessage = oauthError.message || "Google sign in failed";
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (!data?.url) {
        const errorMessage = "No redirect URL returned from Google";
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      // 成功获取重定向URL
      console.log("Redirecting to Google OAuth URL:", data.url);
      onSuccess?.();

      // 直接重定向到Google OAuth页面
      window.location.href = data.url;

    } catch (error) {
      // 清除超时定时器
      clearTimeout(timeoutId);

      console.error("Google sign in error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        variant={variant}
        size={size}
        onClick={handleGoogleSignIn}
        disabled={isPending || isLoading}
        className={`w-full relative ${className}`}
      >
        {(isPending || isLoading) && (
          <Loader2 className="absolute left-3 h-4 w-4 animate-spin" />
        )}
        <div className="flex items-center justify-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>
            {isPending || isLoading
              ? t("connectingToGoogle") || "Connecting to Google..."
              : t("continueWithGoogle") || "Continue with Google"}
          </span>
        </div>
      </Button>

      {/* 错误信息显示 */}
      {error && (
        <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
