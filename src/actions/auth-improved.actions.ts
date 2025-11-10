"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import {
  createSupabaseAdminClient,
  createSupabaseClientWithAuth,
  createSupabaseServerActionClient,
  createSupabaseSessionCheckClient,
  performHealthCheck,
} from "@/lib/supabase-server-simplified";
import type { Database } from "@/lib/supabase-types";
import { supabase } from "@/lib/supabaseClient";

// Create the action client with better error handling
const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error("[Auth Action] Server error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      errorCode: "SERVER_ERROR",
    };
  },
});

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["USER", "MERCHANT"]),
    merchantName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "MERCHANT") {
        return data.merchantName && data.merchantName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Merchant name is required for merchants",
      path: ["merchantName"],
    },
  );

// Action results
export interface AuthResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  redirectUrl?: string;
}

/**
 * 改进的 getCurrentUser 函数
 * 使用简化的客户端和更好的错误处理
 */
export async function getCurrentUserImproved() {
  console.log("[Auth] Getting current user...");

  try {
    // 首先进行健康检查
    if (Math.random() < 0.1) {
      // 10% 的概率进行健康检查，避免过度检查
      const health = await performHealthCheck();
      if (!health.connection.success) {
        console.error("[Auth] Health check failed:", health.connection.message);
      }
    }

    // 使用改进的会话检查
    const { client, session, method } =
      await createSupabaseSessionCheckClient();

    if (!session?.user) {
      console.log(`[Auth] No session found (method: ${method})`);
      return null;
    }

    // 获取用户配置文件
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, merchant_name")
      .eq("id", session.user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("[Auth] Profile fetch error:", profileError);
    }

    // 如果配置文件不存在，创建一个
    if (!profile) {
      console.log("[Auth] Creating new profile for user:", session.user.id);
      const { data: newProfile, error: createError } = await adminClient
        .from("profiles")
        .insert({
          id: session.user.id,
          role: "USER",
        } as any)
        .select("role, merchant_name")
        .single();

      if (createError) {
        console.error("[Auth] Profile creation error:", createError);
      }

      if (newProfile) {
        console.log("[Auth] New profile created successfully");
        const profileData = newProfile as any;
        return {
          id: session.user.id,
          email: session.user.email!,
          role: profileData.role || "USER",
          merchant_name: profileData.merchant_name,
          authMethod: method,
        };
      }
    }

    // 返回用户信息
    console.log(`[Auth] User found via ${method}:`, session.user.email);
    const profileData = profile as any;
    return {
      id: session.user.id,
      email: session.user.email!,
      role: profileData?.role || "USER",
      merchant_name: profileData?.merchant_name,
      authMethod: method,
    };
  } catch (error) {
    console.error("[Auth] getCurrentUser error:", error);
    return null;
  }
}

/**
 * 改进的登录函数
 */
export const loginActionImproved = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    const { email, password } = parsedInput;

    try {
      console.log("[Auth] Attempting login for:", email);

      // 使用浏览器客户端进行登录以设置正确的 cookies

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Auth] Login error:", error.message);

        // 根据错误类型返回更友好的消息
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            message: "Invalid email or password. Please try again.",
          };
        } else if (error.message.includes("Email not confirmed")) {
          return {
            success: false,
            message: "Please confirm your email address before logging in.",
          };
        } else {
          return {
            success: false,
            message: "Login failed. Please try again later.",
          };
        }
      }

      if (!data.user) {
        return {
          success: false,
          message: "Login failed. No user data received.",
        };
      }

      console.log("[Auth] Login successful for:", email);

      // 检查用户配置文件
      const adminClient = createSupabaseAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      let redirectUrl = "/";
      const profileData = profile as any;
      if (profileData?.role === "MERCHANT") {
        redirectUrl = "/dashboard";
      } else if (profileData?.role === "ADMIN") {
        redirectUrl = "/admin";
      }

      // 清除缓存
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Login successful!",
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: profileData?.role || "USER",
        },
        redirectUrl,
      };
    } catch (error) {
      console.error("[Auth] Unexpected login error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during login.",
      };
    }
  });

/**
 * 改进的注册函数
 */
export const registerActionImproved = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    const { email, password, role, merchantName } = parsedInput;

    try {
      console.log("[Auth] Attempting registration for:", email);

      // 使用浏览器客户端进行注册

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            merchant_name: role === "MERCHANT" ? merchantName : null,
          },
        },
      });

      if (error) {
        console.error("[Auth] Registration error:", error.message);

        if (error.message.includes("User already registered")) {
          return {
            success: false,
            message:
              "An account with this email already exists. Please try logging in.",
          };
        } else if (error.message.includes("Password should be")) {
          return {
            success: false,
            message: "Password does not meet the requirements.",
          };
        } else {
          return {
            success: false,
            message: "Registration failed. Please try again later.",
          };
        }
      }

      if (!data.user) {
        return {
          success: false,
          message: "Registration failed. No user data received.",
        };
      }

      console.log("[Auth] Registration successful for:", email);

      // 创建用户配置文件
      const adminClient = createSupabaseAdminClient();
      const { error: profileError } = await adminClient
        .from("profiles")
        .insert({
          id: data.user.id,
          role: role,
          merchant_name: role === "MERCHANT" ? merchantName : null,
        } as any);

      if (profileError) {
        console.error("[Auth] Profile creation error:", profileError);
      } else {
        console.log("[Auth] Profile created successfully");
      }

      return {
        success: true,
        message:
          "Registration successful! Please check your email to verify your account.",
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: role,
        },
      };
    } catch (error) {
      console.error("[Auth] Unexpected registration error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during registration.",
      };
    }
  });

/**
 * 登出函数
 */
export async function logoutActionImproved() {
  try {
    console.log("[Auth] Attempting logout");

    // 使用服务器客户端进行登出
    const serverClient = createSupabaseServerActionClient();
    const { error } = await serverClient.auth.signOut();

    if (error) {
      console.error("[Auth] Logout error:", error);
    } else {
      console.log("[Auth] Logout successful");
    }

    // 清除缓存并重定向
    revalidatePath("/", "layout");
    redirect("/auth");
  } catch (error) {
    console.error("[Auth] Unexpected logout error:", error);
    // 即使出错也重定向
    redirect("/auth");
  }
}

/**
 * 检查认证状态的辅助函数
 */
export async function checkAuthStatus() {
  try {
    const user = await getCurrentUserImproved();
    return {
      authenticated: !!user,
      user,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Auth] Auth status check failed:", error);
    return {
      authenticated: false,
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// 默认导出最常用的函数
export default {
  getCurrentUser: getCurrentUserImproved,
  login: loginActionImproved,
  register: registerActionImproved,
  logout: logoutActionImproved,
  checkAuth: checkAuthStatus,
};
