"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import type { Database } from "@/lib/supabase-types";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Create the action client
const actionClient = createSafeActionClient({
  // You can provide server-side logging here
  handleServerError: (error) => {
    console.error("Action error:", error);
    return {
      message: "An unexpected error occurred",
    };
  },
});

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

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

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

// Login action
export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsedInput.email,
        password: parsedInput.password,
      });

      if (error) {
        console.error("Login error:", error);
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

      // Fetch user profile to get role
      const serverClient = createSupabaseServerClient();
      const { data: profile, error: profileError } = await serverClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile fetch error:", profileError);
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
      console.error("Unexpected login error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during login",
      };
    }
  });

// Register action
export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      const supabase = createSupabaseClient();

      // First, create the user account
      const { data, error } = await supabase.auth.signUp({
        email: parsedInput.email,
        password: parsedInput.password,
        options: {
          // Skip email confirmation for development
          // In production, you might want to require email confirmation
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth`,
        },
      });

      if (error) {
        console.error("Registration error:", error);
        return {
          success: false,
          message: error.message || "Registration failed",
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: "No user data returned",
        };
      }

      // Create the user profile
      const serverClient = createSupabaseServerClient();
      const profileData = {
        id: data.user.id,
        role: parsedInput.role as Database["public"]["Enums"]["profiles_role"],
        merchant_name:
          parsedInput.role === "MERCHANT" ? parsedInput.merchantName : null,
      };

      const { error: profileError } = await (serverClient as any)
        .from("profiles")
        .insert(profileData);

      if (profileError) {
        console.error("Profile creation error:", profileError);

        // If profile creation fails, we should clean up the auth user
        // Note: This requires admin privileges, so we'll skip cleanup for now
        // await supabase.auth.admin.deleteUser(data.user.id);

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
      console.error("Unexpected registration error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during registration",
      };
    }
  });

// Logout action
export const logoutAction = actionClient.action(
  async (): Promise<AuthResult> => {
    try {
      const supabase = createSupabaseClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return {
          success: false,
          message: error.message || "Logout failed",
        };
      }

      // Revalidate all paths and redirect
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      console.error("Unexpected logout error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during logout",
      };
    }
  },
);

// Reset password action
export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      const supabase = createSupabaseClient();

      const { error } = await supabase.auth.resetPasswordForEmail(
        parsedInput.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
        },
      );

      if (error) {
        console.error("Password reset error:", error);
        return {
          success: false,
          message: error.message || "Failed to send password reset email",
        };
      }

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      console.error("Unexpected password reset error:", error);
      return {
        success: false,
        message:
          "An unexpected error occurred while sending password reset email",
      };
    }
  });

// Get current user action (for server components)
export async function getCurrentUser() {
  try {
    const supabase = createSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch user profile
    const serverClient = createSupabaseServerClient();
    const { data: profile, error: profileError } = await serverClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return null;
    }

    const typedProfile =
      profile as Database["public"]["Tables"]["profiles"]["Row"];

    return {
      id: user.id,
      email: user.email!,
      role: typedProfile.role,
      merchant_name: typedProfile.merchant_name,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Update password action (for password reset flow)
const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordAction = actionClient
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      const supabase = createSupabaseClient();

      const { error } = await supabase.auth.updateUser({
        password: parsedInput.password,
      });

      if (error) {
        console.error("Password update error:", error);
        return {
          success: false,
          message: error.message || "Failed to update password",
        };
      }

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      console.error("Unexpected password update error:", error);
      return {
        success: false,
        message: "An unexpected error occurred while updating password",
      };
    }
  });

// Google OAuth login action
export const signInWithGoogle = actionClient.action(
  async (): Promise<AuthResult> => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google sign in error:", error);
        return {
          success: false,
          message: error.message || "Failed to sign in with Google",
        };
      }

      if (!data.url) {
        return {
          success: false,
          message: "No redirect URL returned from Google sign in",
        };
      }

      // For OAuth, the redirect happens automatically
      // This action is mainly for initiating the flow
      return {
        success: true,
        message: "Redirecting to Google for authentication...",
        redirectUrl: data.url,
      };
    } catch (error) {
      console.error("Unexpected Google sign in error:", error);
      return {
        success: false,
        message: "An unexpected error occurred during Google sign in",
      };
    }
  },
);

// Handle OAuth callback
export async function handleAuthCallback() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth callback error:", error);
      redirect("/auth?error=Authentication failed");
      return;
    }

    if (!data.session?.user) {
      console.error("No session found in callback");
      redirect("/auth?error=No session found");
      return;
    }

    // Check if user profile exists, create if not
    const serverClient = createSupabaseServerClient();
    const { data: profile, error: profileError } = await serverClient
      .from("profiles")
      .select("*")
      .eq("id", data.session.user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create one
      const profileData = {
        id: data.session.user.id,
        role: "USER" as const, // Default role for OAuth users
        merchant_name: null,
      };

      const { error: createError } = await (serverClient as any)
        .from("profiles")
        .insert(profileData);

      if (createError) {
        console.error("Profile creation error:", createError);
        redirect("/auth?error=Failed to create user profile");
        return;
      }
    }

    // Revalidate and redirect to dashboard
    revalidatePath("/");
    redirect("/dashboard?welcome=true");
  } catch (error) {
    console.error("Unexpected auth callback error:", error);
    redirect("/auth?error=Authentication callback failed");
  }
}
