"use server";

import { revalidatePath } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { checkAdminPermission } from "@/lib/permissions";
import type { Database } from "@/lib/supabase-types";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Create the action client with enhanced error handling
const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Admin action error:", error);

    // Determine error type based on error characteristics
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("permission") ||
        message.includes("unauthorized") ||
        message.includes("forbidden")
      ) {
        errorMessage =
          "Permission denied. You need administrator privileges to perform this action.";
      } else if (message.includes("timeout") || message.includes("timed out")) {
        errorMessage =
          "Request timeout. The operation took too long to complete.";
      } else if (
        message.includes("network") ||
        message.includes("connection")
      ) {
        errorMessage =
          "Network connection error. Please check your internet connection.";
      } else if (
        message.includes("validation") ||
        message.includes("invalid")
      ) {
        errorMessage =
          "Data validation error. Please check your input and try again.";
      } else if (message.includes("database") || message.includes("query")) {
        errorMessage =
          "Database error. Unable to complete the requested operation.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }
    }

    return {
      message: errorMessage,
    };
  },
});

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const updateMerchantRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["USER", "MERCHANT", "ADMIN"]),
  merchantName: z.string().optional(),
});

const updateGameStatusSchema = z.object({
  gameId: z.string().uuid("Invalid game ID"),
  status: z.enum(["active", "inactive", "suspended"]),
});

const createMerchantSchema = z.object({
  email: z.string().email("Invalid email address"),
  merchantName: z.string().min(1, "Merchant name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  refundAmount: z.number().int().min(0).optional(),
});

// =============================================================================
// PERMISSION CHECKS
// =============================================================================

// 使用统一的权限验证服务，已移除本地实现

// =============================================================================
// ACTION RESULTS
// =============================================================================

export interface AdminActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// =============================================================================
// MERCHANT MANAGEMENT ACTIONS
// =============================================================================

// Get all merchants (admin only)
export async function getAllMerchants(): Promise<AdminActionResult> {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return {
        success: false,
        message: permissionCheck.error || "Permission denied",
      };
    }

    const supabase = createSupabaseServerClient();

    const { data: merchants, error } = await supabase
      .from("profiles")
      .select(`
        *,
        games:games(id),
        orders:orders(id, amount, status, created_at)
      `)
      .in("role", ["MERCHANT", "ADMIN"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching merchants:", error);
      return {
        success: false,
        message: "Failed to fetch merchants",
      };
    }

    // Add analytics to each merchant
    const merchantsWithAnalytics =
      (merchants as any[])?.map((merchant) => {
        const orders = merchant.orders || [];
        const totalOrders = orders.length;
        const completedOrders = orders.filter(
          (order: any) => order.status === "completed",
        ).length;
        const totalRevenue = orders
          .filter((order: any) => order.status === "completed")
          .reduce((sum: number, order: any) => sum + order.amount, 0);

        return {
          ...merchant,
          analytics: {
            totalOrders,
            completedOrders,
            totalRevenue,
            conversionRate:
              totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          },
        };
      }) || [];

    return {
      success: true,
      message: "Merchants fetched successfully",
      data: merchantsWithAnalytics,
    };
  } catch (error) {
    console.error("Get all merchants error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Update merchant role and name
export const updateMerchantRoleAction = actionClient
  .schema(updateMerchantRoleSchema)
  .action(async ({ parsedInput }): Promise<AdminActionResult> => {
    try {
      const permissionCheck = await checkAdminPermission();
      if (!permissionCheck.success) {
        return {
          success: false,
          message: permissionCheck.error || "Permission denied",
        };
      }

      const supabase = createSupabaseServerClient();

      const updateData: any = {
        role: parsedInput.role as Database["public"]["Enums"]["profiles_role"],
      };

      if (parsedInput.role === "MERCHANT" && parsedInput.merchantName) {
        updateData.merchant_name = parsedInput.merchantName;
      } else if (parsedInput.role !== "MERCHANT") {
        updateData.merchant_name = null;
      }

      const { data, error } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", parsedInput.userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating merchant role:", error);
        return {
          success: false,
          message: "Failed to update merchant role",
        };
      }

      revalidatePath("/dashboard/admin/merchants");

      return {
        success: true,
        message: "Merchant role updated successfully",
        data,
      };
    } catch (error) {
      console.error("Update merchant role error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// Create new merchant account
export const createMerchantAction = actionClient
  .schema(createMerchantSchema)
  .action(async ({ parsedInput }): Promise<AdminActionResult> => {
    try {
      const permissionCheck = await checkAdminPermission();
      if (!permissionCheck.success) {
        return {
          success: false,
          message: permissionCheck.error || "Permission denied",
        };
      }

      const supabase = createSupabaseServerClient();

      // Create user account (requires admin client)
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: parsedInput.email,
          password: parsedInput.password,
          email_confirm: true,
        });

      if (authError || !authData.user) {
        console.error("Error creating merchant auth:", authError);
        return {
          success: false,
          message: "Failed to create merchant account",
        };
      }

      // Create profile
      const profileData = {
        id: authData.user.id,
        role: "MERCHANT",
        merchant_name: parsedInput.merchantName,
      };

      const { data: profileDataResult, error: profileError } = await (
        supabase as any
      )
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          message: "Failed to create merchant profile",
        };
      }

      revalidatePath("/dashboard/admin/merchants");

      return {
        success: true,
        message: "Merchant created successfully",
        data: profileDataResult,
      };
    } catch (error) {
      console.error("Create merchant error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// =============================================================================
// GAME MODERATION ACTIONS
// =============================================================================

// Get all games for admin moderation
export async function getAllGamesForModeration(): Promise<AdminActionResult> {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return {
        success: false,
        message: permissionCheck.error || "Permission denied",
      };
    }

    const supabase = createSupabaseServerClient();

    const { data: games, error } = await supabase
      .from("games")
      .select(`
        *,
        profiles:profiles(id, merchant_name),
        skus:skus(id, name, prices, created_at),
        orders:orders(id, amount, status, created_at)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching games for moderation:", error);
      return {
        success: false,
        message: "Failed to fetch games",
      };
    }

    // Add analytics to each game
    const gamesWithAnalytics =
      (games as any[])?.map((game) => {
        const orders = game.orders || [];
        const totalOrders = orders.length;
        const completedOrders = orders.filter(
          (order: any) => order.status === "completed",
        ).length;
        const totalRevenue = orders
          .filter((order: any) => order.status === "completed")
          .reduce((sum: number, order: any) => sum + order.amount, 0);

        return {
          ...game,
          analytics: {
            totalOrders,
            completedOrders,
            totalRevenue,
            totalSkus: (game.skus || []).length,
          },
        };
      }) || [];

    return {
      success: true,
      message: "Games fetched successfully",
      data: gamesWithAnalytics,
    };
  } catch (error) {
    console.error("Get all games for moderation error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Update game status (moderation)
export const updateGameStatusAction = actionClient
  .schema(updateGameStatusSchema)
  .action(async ({ parsedInput }): Promise<AdminActionResult> => {
    try {
      const permissionCheck = await checkAdminPermission();
      if (!permissionCheck.success) {
        return {
          success: false,
          message: permissionCheck.error || "Permission denied",
        };
      }

      const supabase = createSupabaseServerClient();

      const { data, error } = await (supabase as any)
        .from("games")
        .update({
          status: parsedInput.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsedInput.gameId)
        .select()
        .single();

      if (error) {
        console.error("Error updating game status:", error);
        return {
          success: false,
          message: "Failed to update game status",
        };
      }

      revalidatePath("/dashboard/admin/games");

      return {
        success: true,
        message: "Game status updated successfully",
        data,
      };
    } catch (error) {
      console.error("Update game status error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// =============================================================================
// ORDER MANAGEMENT ACTIONS
// =============================================================================

// Get all platform orders
export async function getAllPlatformOrders(
  page: number = 1,
  pageSize: number = 50,
  status?: string,
): Promise<AdminActionResult> {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return {
        success: false,
        message: permissionCheck.error || "Permission denied",
      };
    }

    const supabase = createSupabaseServerClient();
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        profiles:profiles(id, merchant_name, role),
        skus:skus(id, name, game_id),
        games:games(id, name)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Error fetching platform orders:", error);
      return {
        success: false,
        message: "Failed to fetch orders",
      };
    }

    return {
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders: orders || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
    };
  } catch (error) {
    console.error("Get all platform orders error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Update order status (admin override)
export const updateOrderStatusAction = actionClient
  .schema(updateOrderStatusSchema)
  .action(async ({ parsedInput }): Promise<AdminActionResult> => {
    try {
      const permissionCheck = await checkAdminPermission();
      if (!permissionCheck.success) {
        return {
          success: false,
          message: permissionCheck.error || "Permission denied",
        };
      }

      const supabase = createSupabaseServerClient();

      const updateData: any = {
        status:
          parsedInput.status as Database["public"]["Enums"]["orders_status"],
        updated_at: new Date().toISOString(),
      };

      // Add refund amount if provided
      if (parsedInput.refundAmount !== undefined) {
        updateData.refund_amount = parsedInput.refundAmount;
      }

      const { data, error } = await (supabase as any)
        .from("orders")
        .update(updateData)
        .eq("id", parsedInput.orderId)
        .select()
        .single();

      if (error) {
        console.error("Error updating order status:", error);
        return {
          success: false,
          message: "Failed to update order status",
        };
      }

      revalidatePath("/dashboard/admin/orders");

      return {
        success: true,
        message: "Order status updated successfully",
        data,
      };
    } catch (error) {
      console.error("Update order status error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// =============================================================================
// PLATFORM ANALYTICS
// =============================================================================

// Helper function to validate numeric data
const validateNumericData = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : Math.max(0, num);
};

// Get platform-wide analytics with enhanced error handling and performance optimization
export async function getPlatformAnalytics(): Promise<AdminActionResult> {
  const startTime = Date.now();

  try {
    // Check permissions first
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return {
        success: false,
        message:
          permissionCheck.error ||
          "Permission denied. Administrator privileges required.",
      };
    }

    const supabase = createSupabaseServerClient();

    // Optimized parallel queries with better error handling
    // Using more efficient queries that only select what we need
    const [
      usersResult,
      merchantsResult,
      gamesResult,
      skusResult,
      ordersResult,
      revenueResult,
      orderStatusResult,
    ] = await Promise.all([
      // Basic counts with optimized queries - only select id for counting
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "MERCHANT"),

      supabase.from("games").select("id", { count: "exact", head: true }),

      supabase.from("skus").select("id", { count: "exact", head: true }),

      supabase.from("orders").select("id", { count: "exact", head: true }),

      // Revenue calculation - only select amount for completed orders
      supabase
        .from("orders")
        .select("amount")
        .eq("status", "completed"),

      // Order status breakdown - only select status field
      supabase
        .from("orders")
        .select("status"),
    ]);

    // Check for any critical errors in the queries
    const criticalErrors = [
      usersResult.error,
      merchantsResult.error,
      gamesResult.error,
      skusResult.error,
      ordersResult.error,
    ].filter((error) => error);

    if (criticalErrors.length > 0) {
      console.error(
        "Critical database errors in analytics queries:",
        criticalErrors,
      );
      return {
        success: false,
        message:
          "Database error occurred while fetching analytics data. Please try again later.",
      };
    }

    // Extract and validate data with proper error handling
    const totalUsers = validateNumericData(usersResult.count);
    const totalMerchants = validateNumericData(merchantsResult.count);
    const totalGames = validateNumericData(gamesResult.count);
    const totalSkus = validateNumericData(skusResult.count);
    const totalOrders = validateNumericData(ordersResult.count);

    // Calculate total revenue with validation
    const totalRevenue = validateNumericData(
      (revenueResult.data as any[])?.reduce((sum: number, order: any) => {
        const amount = validateNumericData(order?.amount);
        return sum + amount;
      }, 0),
      0,
    );

    // Process order status breakdown with validation
    const orderStatusBreakdown: Record<string, number> = {
      pending: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
    };

    if (orderStatusResult.data && Array.isArray(orderStatusResult.data)) {
      (orderStatusResult.data as any[]).forEach((order: any) => {
        const status = order?.status;
        if (status && typeof status === "string") {
          orderStatusBreakdown[status] =
            (orderStatusBreakdown[status] || 0) + 1;
        }
      });
    }

    // Calculate average order value safely
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const duration = Date.now() - startTime;
    console.log(`Platform analytics fetched successfully in ${duration}ms`);

    return {
      success: true,
      message: "Platform analytics fetched successfully",
      data: {
        totalUsers,
        totalMerchants,
        totalGames,
        totalSkus,
        totalOrders,
        totalRevenue,
        orderStatusBreakdown,
        averageOrderValue: validateNumericData(averageOrderValue),
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Get platform analytics error after ${duration}ms:`, error);

    // Enhanced error handling with specific error types
    let errorMessage =
      "An unexpected error occurred while fetching platform analytics";

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("permission") || message.includes("unauthorized")) {
        errorMessage =
          "Permission denied. You need administrator privileges to access platform analytics.";
      } else if (
        message.includes("network") ||
        message.includes("connection")
      ) {
        errorMessage =
          "Network connection error. Unable to connect to the database. Please check your connection and try again.";
      } else if (message.includes("database") || message.includes("query")) {
        errorMessage =
          "Database query error. Unable to retrieve analytics data. Please try again later.";
      } else {
        errorMessage = error.message || errorMessage;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
