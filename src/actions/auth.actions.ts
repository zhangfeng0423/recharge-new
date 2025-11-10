"use server";

import { revalidatePath } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import type { Database } from "@/lib/supabase-types";
import { supabase } from "@/lib/supabaseClient";
import {
  createSupabaseAdminClient,
  createSupabaseClientForServerActions,
  createSupabaseServerClientWithCookies,
} from "@/lib/supabaseServer";

// Create the action client with default error handling
const actionClient = createSafeActionClient();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
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

// Get current user function for server-side usage (Server Components and Server Actions)
export async function getCurrentUser() {
  try {
    // Use the cookie-based client for both Server Components and Server Actions
    // This client can read cookies but won't attempt to modify them
    const supabase = await createSupabaseServerClientWithCookies();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      // 对于认证会话缺失的错误，静默处理（这是正常的未登录状态）
      if (error.message?.includes('Auth session missing') || error.message?.includes('Invalid Refresh Token')) {
        return null;
      }
      // 其他认证错误才记录到控制台
      console.error("Error getting current user:", error);
      return null;
    }

    if (!user) {
      return null;
    }

    // Get user profile with role information
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error getting user profile:", profileError);
      return {
        id: user.id,
        email: user.email!,
        role: "USER" as const
      };
    }

    return {
      id: user.id,
      email: user.email!,
      role: (profile as any).role as "USER" | "MERCHANT" | "ADMIN"
    };

  } catch (error) {
    console.error("Unexpected error getting current user:", error);
    return null;
  }
}

// Login action
export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      // Use server-side client for authentication
      const supabase = await createSupabaseClientForServerActions();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsedInput.email,
        password: parsedInput.password,
      });

      if (error) {
        return {
          success: false,
          message: error.message || "Login failed",
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: "No user data returned",
        };
      }

      // Use admin client for profile operations
      const adminClient = createSupabaseAdminClient();
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id as string)
        .single();

      // If profile doesn't exist, create one with appropriate role based on email
      if (profileError && profileError.code === "PGRST116") {
        // Determine role based on email pattern
        let userRole = "USER";
        if (data.user.email && data.user.email.includes("merchant")) {
          userRole = "MERCHANT";
        } else if (data.user.email && data.user.email.includes("admin")) {
          userRole = "ADMIN";
        }

        const { error: createError } = await (adminClient as any)
          .from("profiles")
          .insert({
            id: data.user.id,
            role: userRole,
            merchant_name:
              userRole === "MERCHANT"
                ? data.user.email!.split("@")[0]
                : null,
          });

        if (createError) {
          return {
            success: false,
            message: "Failed to create user profile",
          };
        }

        return {
          success: true,
          message: "Login successful",
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: userRole as "USER" | "MERCHANT" | "ADMIN",
          },
        };
      }

      if (profileError || !profile) {
        return {
          success: false,
          message: "Failed to fetch user profile",
        };
      }

      // Revalidate the current path to update UI
      revalidatePath("/");

      return {
        success: true,
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: (profile as any).role as "USER" | "MERCHANT" | "ADMIN",
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  });

// Register action
export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      // Use admin client for user creation
      const adminClient = createSupabaseAdminClient();

      // First, create the user account
      const { data, error } = await adminClient.auth.signUp({
        email: parsedInput.email,
        password: parsedInput.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth`,
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message || "Registration failed",
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: "Failed to create user account",
        };
      }

      // Create the user profile
      const profileData = {
        id: data.user.id,
        role: parsedInput.role as Database["public"]["Enums"]["profiles_role"],
        merchant_name:
          parsedInput.role === "MERCHANT" ? parsedInput.merchantName : null,
      };

      const { error: profileError } = await (adminClient as any)
        .from("profiles")
        .insert(profileData);

      if (profileError) {
        return {
          success: false,
          message: "Failed to create user profile",
        };
      }

      // Revalidate the current path to update UI
      revalidatePath("/");

      return {
        success: true,
        message: "Registration successful",
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: parsedInput.role,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  });

// Logout action
export const logoutAction = actionClient.action(
  async (): Promise<AuthResult> => {
    try {
      // Use server-side client for logout
      const supabase = await createSupabaseClientForServerActions();

      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          message: error.message || "Logout failed",
        };
      }

      // Revalidate all paths
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  },
);