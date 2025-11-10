"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import {
  EnhancedError,
  ErrorCategory,
  ErrorFactory,
  ErrorSeverity,
  globalErrorHandler,
  handleError,
  RetryHandler,
} from "@/lib/error-handling";
import type { Database } from "@/lib/supabase-types";
import { supabase } from "@/lib/supabaseClient";
import {
  createSupabaseAdminClient,
  createSupabaseClientForServerActions,
  createSupabaseServerClientWithCookies,
} from "@/lib/supabaseServer";

// Helper function to get localized messages
async function getLocalizedMessages(locale: string = "en") {
  const t = await getTranslations({ locale, namespace: "" });
  return {
    auth: {
      loginSuccess: t("auth.loginSuccess"),
      registerSuccess: t("auth.registerSuccess"),
      loginError: t("auth.loginError"),
      registerError: t("auth.registerError"),
      googleSignInError: t("auth.googleSignInError"),
      logoutSuccess: t("auth.logout"),
    },
    validation: {
      invalidEmail: t("validation.emailInvalid"),
      passwordTooShort: t("validation.passwordTooShort"),
      passwordMismatch: t("validation.passwordMismatch"),
      required: t("validation.required"),
    },
    errors: {
      authentication: {
        invalidCredentials: t("errors.authentication.invalidCredentials"),
        emailNotConfirmed: t("errors.authentication.emailNotConfirmed"),
        sessionExpired: t("errors.authentication.sessionExpired"),
        unknownError: t("errors.authentication.unknownError"),
      },
      network: {
        timeout: t("errors.network.timeout"),
        connectionFailed: t("errors.network.connectionFailed"),
        rateLimit: t("errors.network.rateLimit"),
      },
      database: {
        connectionFailed: t("errors.database.connectionFailed"),
        queryFailed: t("errors.database.queryFailed"),
      },
      generic: {
        unexpectedError: t("errors.generic.unexpectedError"),
        operationFailed: t("errors.generic.operationFailed"),
      },
    },
  };
}

// Create the action client with enhanced error handling
const actionClient = createSafeActionClient({
  // Enhanced server-side logging with our error handling framework
  handleServerError: (error) => {
    const enhancedError = handleError(error, {
      action: "server_action",
      timestamp: new Date().toISOString(),
    });

    return {
      message: enhancedError.getUserMessage("en"),
      errorCode: enhancedError.code,
      retryable: enhancedError.retryable,
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

// Login action with enhanced error handling
export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    const startTime = Date.now();
    const messages = await getLocalizedMessages("en"); // Default to English, can be made dynamic

    try {
      // Use browser client for authentication to set session cookies

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsedInput.email,
        password: parsedInput.password,
      });

      if (error) {
        // Handle specific authentication errors
        let enhancedError: EnhancedError;

        if (error.message.includes("Invalid login credentials")) {
          enhancedError = ErrorFactory.authenticationError(
            messages.errors.authentication.invalidCredentials,
            { email: parsedInput.email, attemptTime: new Date().toISOString() },
          );
        } else if (error.message.includes("Email not confirmed")) {
          enhancedError = ErrorFactory.authenticationError(
            messages.errors.authentication.emailNotConfirmed,
            { email: parsedInput.email },
          );
        } else if (error.message.includes("Too many requests")) {
          enhancedError = ErrorFactory.apiRateLimitError({
            email: parsedInput.email,
          });
        } else {
          enhancedError = ErrorFactory.authenticationError(
            error.message || messages.auth.loginError,
            { email: parsedInput.email, originalError: error.message },
          );
        }

        handleError(enhancedError as any, {
          action: "login",
          email: parsedInput.email,
          duration: Date.now() - startTime,
        });

        return {
          success: false,
          message: enhancedError.getUserMessage("en"),
        };
      }

      if (!data.user) {
        const error = ErrorFactory.authenticationError(
          messages.errors.authentication.unknownError,
          { email: parsedInput.email },
        );

        handleError(error as any, {
          action: "login",
          email: parsedInput.email,
        });

        return {
          success: false,
          message: error.getUserMessage("en"),
        };
      }

      // Use admin client for profile operations with enhanced error handling
      return await RetryHandler.executeWithRetry(
        async () => {
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
              const error = ErrorFactory.databaseQueryError(
                `Failed to create user profile: ${createError.message}`,
                {
                  userId: data.user.id,
                  email: data.user.email,
                  role: userRole,
                },
              );

              handleError(error, {
                action: "create_profile",
                userId: data.user.id,
                email: data.user.email,
              });

              throw error;
            }

            return {
              success: true,
              message: messages.auth.loginSuccess,
              user: {
                id: data.user.id,
                email: data.user.email!,
                role: userRole as "USER" | "MERCHANT" | "ADMIN",
              },
            };
          }

          if (profileError || !profile) {
            const error = ErrorFactory.databaseQueryError(
              `Failed to fetch user profile: ${profileError?.message || "Profile not found"}`,
              { userId: data.user.id, email: data.user.email, profileError },
            );

            handleError(error, {
              action: "fetch_profile",
              userId: data.user.id,
              email: data.user.email,
            });

            throw error;
          }

          return {
            success: true,
            message: messages.auth.loginSuccess,
            user:
              data.user && profile
                ? {
                    id: data.user.id,
                    email: data.user.email!,
                    role: (profile as any).role as
                      | "USER"
                      | "MERCHANT"
                      | "ADMIN",
                  }
                : undefined,
          };
        },
        {
          maxRetries: 2,
          baseDelayMs: 500,
          retryCondition: (error) => {
            const enhancedError =
              error instanceof EnhancedError
                ? error
                : ErrorFactory.fromError(error);
            return (
              enhancedError.category === ErrorCategory.DATABASE_QUERY &&
              enhancedError.retryable
            );
          },
        },
      );

      // Revalidate the current path to update UI
      revalidatePath("/");

      // The retry block should have already returned the result
      // If we reach here, it means there was an issue with the retry logic
      // This should not happen, but we'll handle it gracefully
      const fallbackError = ErrorFactory.authenticationError(
        "Login completed but failed to return user data",
        { email: parsedInput.email },
      );

      handleError(fallbackError as any, {
        action: "login",
        email: parsedInput.email,
      });

      return {
        success: false,
        message: fallbackError.getUserMessage("en"),
      };
    } catch (error) {
      const enhancedError = handleError(error as any, {
        action: "login",
        email: parsedInput.email,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        message: enhancedError.getUserMessage("en"),
      };
    }
  });

// Register action
export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    const messages = await getLocalizedMessages("en"); // Default to English, can be made dynamic

    try {
      // Use server-side client for Server Actions
      const supabase = createSupabaseAdminClient();

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
        return {
          success: false,
          message: error.message || messages.auth.registerError,
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: messages.errors.generic.operationFailed,
        };
      }

      // Create the user profile using server action client (can set cookies if needed)
      const serverClient: SupabaseClient<Database> =
        await createSupabaseClientForServerActions();
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
        // If profile creation fails, we should clean up the auth user
        // Note: This requires admin privileges, so we'll skip cleanup for now
        // await supabase.auth.admin.deleteUser(data.user.id);

        return {
          success: false,
          message: messages.errors.database.queryFailed,
        };
      }

      // Revalidate the current path to update UI
      revalidatePath("/");

      return {
        success: true,
        message: messages.auth.registerSuccess,
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: parsedInput.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: messages.errors.generic.unexpectedError,
      };
    }
  });

// Logout action
export const logoutAction = actionClient.action(
  async (): Promise<AuthResult> => {
    const messages = await getLocalizedMessages("en"); // Default to English, can be made dynamic

    try {
      // Use server-side client for Server Actions
      const supabase = createSupabaseAdminClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          message: error.message || messages.errors.generic.operationFailed,
        };
      }

      // Revalidate all paths and redirect
      revalidatePath("/", "layout");

      return {
        success: true,
        message: messages.auth.logoutSuccess,
      };
    } catch (error) {
      return {
        success: false,
        message: messages.errors.generic.unexpectedError,
      };
    }
  },
);

// Reset password action
export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }): Promise<AuthResult> => {
    try {
      // Use server-side client for Server Actions
      const supabase = createSupabaseAdminClient();

      const { error } = await supabase.auth.resetPasswordForEmail(
        parsedInput.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
        },
      );

      if (error) {
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
      return {
        success: false,
        message:
          "An unexpected error occurred while sending password reset email",
      };
    }
  });

// Enhanced getCurrentUser function with comprehensive error handling and fallback mechanisms
export async function getCurrentUser() {
  const startTime = Date.now();
  const authContext = {
    action: "get_current_user",
    startTime,
    timestamp: new Date().toISOString(),
  };

  try {
    // Primary authentication method: Server-side cookies
    return await RetryHandler.executeWithRetry(
      async () => {
        const supabase = await createSupabaseServerClientWithCookies();

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // 检查是否为"Auth session missing"类型的错误
          // 这种错误表示用户未登录，是正常情况，不应该抛出异常
          if (
            error.message.includes("Auth session missing") ||
            error.message.includes("No session") ||
            error.message === "Auth session missing!"
          ) {
            // 用户未登录是正常情况，直接返回 null
            return null;
          }

          // Handle specific authentication errors (真正的错误)
          let enhancedError: EnhancedError;

          if (error.message.includes("Invalid refresh token")) {
            enhancedError = ErrorFactory.sessionExpiredError({
              method: "server_cookies",
              originalError: error.message,
            });
          } else if (error.message.includes("Database connection")) {
            enhancedError = ErrorFactory.databaseConnectionError(
              `Database connection failed: ${error.message}`,
              error,
            );
          } else {
            enhancedError = ErrorFactory.authenticationError(
              `Server authentication failed: ${error.message}`,
              { method: "server_cookies", originalError: error.message },
            );
          }

          handleError(enhancedError as any, {
            ...authContext,
            method: "server_cookies",
            error: error.message,
          });
          throw enhancedError;
        }

        if (!user) {
          // 用户未登录是正常情况，不应该抛出错误
          // 直接返回 null，让调用方处理未登录状态
          return null;
        }

        // Fetch user profile with error handling
        return await fetchUserProfile(user, "server_cookies", authContext);
      },
      {
        maxRetries: 2,
        baseDelayMs: 300,
        retryCondition: (error) => {
          const enhancedError =
            error instanceof EnhancedError
              ? error
              : ErrorFactory.fromError(error);
          return (
            enhancedError.category === ErrorCategory.DATABASE_CONNECTION &&
            enhancedError.retryable
          );
        },
      },
    );
  } catch (error) {
    handleError(error as any, {
      ...authContext,
      duration: Date.now() - startTime,
      finalError: true,
    });

    return null;
  }
}

// Helper function for browser client fallback
async function attemptBrowserClientFallback(serverUser: any): Promise<any> {
  try {
    // 使用单例客户端
    const browserClient = supabase;

    // First try to get session, then user
    const { data: sessionData } = await browserClient.auth.getSession();

    if (sessionData.session?.user) {
      return await fetchUserProfile(
        sessionData.session.user,
        "browser_client_session",
        { action: "get_current_user", method: "browser_client_session" },
      );
    }

    // If no session, try direct user lookup
    const {
      data: { user: browserUser },
      error: browserError,
    } = await browserClient.auth.getUser();

    if (browserError) {
      let enhancedError: EnhancedError;

      if (browserError.message.includes("Invalid refresh token")) {
        enhancedError = ErrorFactory.sessionExpiredError({
          method: "browser_client",
          originalError: browserError.message,
        });
      } else {
        enhancedError = ErrorFactory.authenticationError(
          `Browser authentication failed: ${browserError.message}`,
          { method: "browser_client", originalError: browserError.message },
        );
      }

      handleError(enhancedError, {
        action: "get_current_user",
        method: "browser_client_fallback",
        error: browserError.message,
      });

      throw enhancedError;
    }

    if (!browserUser) {
      const error = ErrorFactory.authenticationError(
        "No user found in browser client",
        { method: "browser_client_fallback" },
      );

      handleError(error, {
        action: "get_current_user",
        method: "browser_client_fallback",
        reason: "no_user_found",
      });

      throw error;
    }

    // Try to get the user profile to determine correct role
    return await fetchUserProfile(browserUser, "browser_client_fallback", {
      action: "get_current_user",
      method: "browser_client_fallback",
    });
  } catch (fallbackError) {
    const error = handleError(fallbackError as any, {
      action: "get_current_user",
      method: "browser_client_fallback_failed",
    });

    throw error;
  }
}

// Helper function to fetch user profile with comprehensive error handling
async function fetchUserProfile(
  user: any,
  authMethod: string,
  context: any,
): Promise<any> {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, merchant_name")
      .eq("id", user.id)
      .single();

    if (!profileError && profile) {
      return {
        id: user.id,
        email: user.email!,
        role: (profile as any).role,
        merchant_name: (profile as any).merchant_name,
        authMethod,
      };
    }

    // Profile doesn't exist, create one with appropriate role
    if (profileError && profileError.code === "PGRST116") {
      return await createProfileForUser(user, authMethod, context);
    }

    // Other profile errors
    const error = ErrorFactory.databaseQueryError(
      `Failed to fetch user profile: ${profileError?.message || "Unknown error"}`,
      { userId: user.id, email: user.email, profileError, authMethod },
    );

    handleError(error, {
      ...context,
      action: "fetch_profile",
      userId: user.id,
      authMethod,
    });

    throw error;
  } catch (profileError) {
    const error = handleError(profileError as any, {
      ...context,
      action: "fetch_profile_error",
      userId: user.id,
      authMethod,
    });

    throw error;
  }
}

// Helper function to create profile for user
async function createProfileForUser(
  user: any,
  authMethod: string,
  context: any,
): Promise<any> {
  try {
    // Determine role based on email pattern
    let userRole = "USER";
    if (user.email && user.email.includes("merchant")) {
      userRole = "MERCHANT";
    } else if (user.email && user.email.includes("admin")) {
      userRole = "ADMIN";
    }

    const adminClient = createSupabaseAdminClient();
    const { error: createError } = await (adminClient as any)
      .from("profiles")
      .insert({
        id: user.id,
        role: userRole,
        merchant_name:
          userRole === "MERCHANT" ? user.email!.split("@")[0] : null,
      });

    if (createError) {
      const error = ErrorFactory.databaseQueryError(
        `Failed to create user profile: ${createError.message}`,
        {
          userId: user.id,
          email: user.email,
          role: userRole,
          createError,
          authMethod,
        },
      );

      handleError(error, {
        ...context,
        action: "create_profile",
        userId: user.id,
        email: user.email,
        intendedRole: userRole,
        authMethod,
      });

      throw error;
    }

    return {
      id: user.id,
      email: user.email!,
      role: userRole as "USER" | "MERCHANT" | "ADMIN",
      merchant_name: userRole === "MERCHANT" ? user.email!.split("@")[0] : null,
      authMethod,
      profileCreated: true,
    };
  } catch (createError) {
    const error = handleError(createError as any, {
      ...context,
      action: "create_profile_error",
      userId: user.id,
      authMethod,
    });

    throw error;
  }
}

// Enhanced authentication check specifically for payment flows
export async function getCurrentUserForPayment() {
  try {
    // Method 1: Try server-side cookies first (most secure)
    const serverClient = await createSupabaseServerClientWithCookies();
    const {
      data: { user: serverUser },
      error: serverError,
    } = await serverClient.auth.getUser();

    if (serverUser && !serverError) {
      return {
        id: serverUser.id,
        email: serverUser.email!,
        role: "USER", // Default role
        merchant_name: null,
      };
    }

    // Method 2: Try browser client as fallback
    // 使用单例客户端
    const browserClient = supabase;
    const {
      data: { user: browserUser },
      error: browserError,
    } = await browserClient.auth.getUser();

    if (browserUser && !browserError) {
      return {
        id: browserUser.id,
        email: browserUser.email!,
        role: "USER", // Default role
        merchant_name: null,
      };
    }

    // Method 3: Try session-based check
    const { data: sessionData, error: sessionError } =
      await browserClient.auth.getSession();

    if (sessionData.session?.user && !sessionError) {
      return {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email!,
        role: "USER", // Default role
        merchant_name: null,
      };
    }

    return null;
  } catch (error) {
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
      // Use server-side client for Server Actions
      const supabase = createSupabaseAdminClient();

      const { error } = await supabase.auth.updateUser({
        password: parsedInput.password,
      });

      if (error) {
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
      return {
        success: false,
        message: "An unexpected error occurred while updating password",
      };
    }
  });

// Google OAuth login action
export const signInWithGoogle = actionClient.action(
  async (): Promise<AuthResult> => {
    const startTime = Date.now();
    const messages = await getLocalizedMessages("en");

    try {
      // OAuth需要在客户端进行，不能在Server Action中使用admin client
      // 返回错误信息，指导用户使用客户端组件
      const error = ErrorFactory.authenticationError(
        "Google OAuth must be initiated from client side. Please use the GoogleButton component directly.",
        {
          method: "server_action_oauth",
          suggestion: "Use client-side GoogleButton component instead"
        }
      );

      handleError(error as any, {
        action: "signInWithGoogle",
        duration: Date.now() - startTime,
        error: "OAuth initiated from server action",
      });

      return {
        success: false,
        message: "Please use the Google Sign-In button on the page instead.",
      };
    } catch (error) {
      const enhancedError = handleError(error as any, {
        action: "signInWithGoogle",
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        message: enhancedError.getUserMessage("en"),
      };
    }
  },
);

// Handle OAuth callback
export async function handleAuthCallback() {
  try {
    // Use server-side client for Server Actions
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      redirect("/auth?error=Authentication failed");
      return;
    }

    if (!data.session?.user) {
      redirect("/auth?error=No session found");
      return;
    }

    // Check if user profile exists, create if not
    const serverClient: SupabaseClient<Database> =
      await createSupabaseClientForServerActions();
    const { data: profile, error: profileError } = await serverClient
      .from("profiles")
      .select("*")
      .eq("id", data.session.user.id as string)
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
        redirect("/auth?error=Failed to create user profile");
        return;
      }
    }

    // Revalidate and redirect to dashboard
    revalidatePath("/");
    redirect("/dashboard?welcome=true");
  } catch (error) {
    redirect("/auth?error=Authentication callback failed");
  }
}
