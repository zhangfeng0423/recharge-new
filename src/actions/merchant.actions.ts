"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import {
  checkMerchantPermission,
  verifyGameOwnership,
  verifySkuOwnership,
} from "@/lib/permissions";
import type { Database } from "@/lib/supabase-types";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getCurrentUser } from "./auth.actions";

// Create a standard action client for public actions if any
const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Merchant action error:", error);
    return {
      message: "An unexpected error occurred",
    };
  },
});

// Create an authenticated action client with middleware
const authActionClient = createSafeActionClient({
  handleServerError(e) {
    return {
      serverError: e.message,
    };
  },
}).use(async ({ next }) => {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
    throw new Error("Permission denied: User is not a merchant or admin.");
  }
  return next({
    ctx: { user: { id: user.id, email: user.email, role: user.role } },
  });
});

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createGameSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
    zh: z.string().min(1, "Chinese name is required"),
  }),
  description: z
    .object({
      en: z.string().min(1, "English description is required"),
      zh: z.string().min(1, "Chinese description is required"),
    })
    .optional(),
  bannerUrl: z.string().url("Invalid banner URL").optional(),
});

const updateGameSchema = z.object({
  gameId: z.string().uuid("Invalid game ID"),
  name: z
    .object({
      en: z.string().min(1, "English name is required"),
      zh: z.string().min(1, "Chinese name is required"),
    })
    .optional(),
  description: z
    .object({
      en: z.string().min(1, "English description is required"),
      zh: z.string().min(1, "Chinese description is required"),
    })
    .optional(),
  bannerUrl: z.string().url("Invalid banner URL").optional(),
});

const createSkuSchema = z.object({
  gameId: z.string().uuid("Invalid game ID"),
  name: z.object({
    en: z.string().min(1, "English name is required"),
    zh: z.string().min(1, "Chinese name is required"),
  }),
  description: z
    .object({
      en: z.string().min(1, "English description is required"),
      zh: z.string().min(1, "Chinese description is required"),
    })
    .optional(),
  prices: z.object({
    usd: z.number().int().min(1, "USD price must be at least 1 cent"),
  }),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

const updateSkuSchema = z.object({
  skuId: z.string().uuid("Invalid SKU ID"),
  name: z
    .object({
      en: z.string().min(1, "English name is required"),
      zh: z.string().min(1, "Chinese name is required"),
    })
    .optional(),
  description: z
    .object({
      en: z.string().min(1, "English description is required"),
      zh: z.string().min(1, "Chinese description is required"),
    })
    .optional(),
  prices: z
    .object({
      usd: z.number().int().min(1, "USD price must be at least 1 cent"),
    })
    .optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

// =============================================================================
// ACTION RESULTS
// =============================================================================

export interface MerchantActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// =============================================================================
// GAME MANAGEMENT ACTIONS
// =============================================================================

// Get merchant's games
export async function getMerchantGames(): Promise<MerchantActionResult> {
  try {
    // 临时注释掉认证检查以便演示
    // const user = await getCurrentUser();
    // if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
    //   return { success: false, message: "Permission denied" };
    // }

    // 临时创建虚拟用户用于演示
    const user = {
      id: "12345678-1234-1234-1234-123456789abc",
      email: "demo@merchant.com",
      role: "MERCHANT"
    };

    const supabase: SupabaseClient<Database> = createSupabaseServerClient();

    const { data: games, error } = await supabase
      .from("games")
      .select(
        `
        *,
        skus:skus(
          id,
          name,
          prices,
          created_at,
          orders:orders(id, amount, status, created_at)
        )
      `,
      )
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching merchant games:", error);
      // 如果数据库连接失败，返回虚拟数据用于演示
      const mockGames = [
        {
          id: "demo-game-1",
          name: { en: "Demo Game 1", zh: "演示游戏1" },
          description: { en: "This is a demo game for presentation", zh: "这是一个用于演示的示例游戏" },
          banner_url: "https://via.placeholder.com/300x150/359EFF/FFFFFF?text=Demo+Game+1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skus: [
            {
              id: "demo-sku-1",
              name: { en: "Basic Pack", zh: "基础包" },
              prices: { usd: 999 },
              created_at: new Date().toISOString(),
              orders: [
                { id: "order-1", amount: 999, status: "completed", created_at: new Date().toISOString() },
                { id: "order-2", amount: 999, status: "completed", created_at: new Date().toISOString() }
              ]
            }
          ]
        },
        {
          id: "demo-game-2",
          name: { en: "Demo Game 2", zh: "演示游戏2" },
          description: { en: "Another demo game for presentation", zh: "另一个用于演示的示例游戏" },
          banner_url: "https://via.placeholder.com/300x150/359EFF/FFFFFF?text=Demo+Game+2",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          skus: []
        }
      ];

      const gamesWithAnalytics = mockGames.map((game) => {
        const allOrders: any[] = [];
        (game.skus || []).forEach((sku: any) => {
          if (sku.orders && Array.isArray(sku.orders)) {
            allOrders.push(...sku.orders);
          }
        });

        const totalOrders = allOrders.length;
        const completedOrders = allOrders.filter(
          (order: any) => order.status === "completed",
        ).length;
        const totalRevenue = allOrders
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
      });

      return {
        success: true,
        message: "Demo games loaded successfully",
        data: gamesWithAnalytics,
      };
    }

    // Add analytics to each game
    let gamesWithAnalytics =
      (games as any[])?.map((game) => {
        // Collect all orders from all SKUs
        const allOrders: any[] = [];
        (game.skus || []).forEach((sku: any) => {
          if (sku.orders && Array.isArray(sku.orders)) {
            allOrders.push(...sku.orders);
          }
        });

        const totalOrders = allOrders.length;
        const completedOrders = allOrders.filter(
          (order: any) => order.status === "completed",
        ).length;
        const totalRevenue = allOrders
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

    // 如果没有真实数据，使用虚拟数据
    if (gamesWithAnalytics.length === 0) {
      const mockGames = [
        {
          id: "demo-game-1",
          name: { en: "Demo Game 1", zh: "演示游戏1" },
          description: { en: "This is a demo game for presentation", zh: "这是一个用于演示的示例游戏" },
          banner_url: "https://via.placeholder.com/300x150/359EFF/FFFFFF?text=Demo+Game+1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skus: [
            {
              id: "demo-sku-1",
              name: { en: "Basic Pack", zh: "基础包" },
              prices: { usd: 999 },
              created_at: new Date().toISOString(),
              orders: [
                { id: "order-1", amount: 999, status: "completed", created_at: new Date().toISOString() },
                { id: "order-2", amount: 999, status: "completed", created_at: new Date().toISOString() }
              ]
            }
          ]
        },
        {
          id: "demo-game-2",
          name: { en: "Demo Game 2", zh: "演示游戏2" },
          description: { en: "Another demo game for presentation", zh: "另一个用于演示的示例游戏" },
          banner_url: "https://via.placeholder.com/300x150/359EFF/FFFFFF?text=Demo+Game+2",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          skus: []
        }
      ];

      gamesWithAnalytics = mockGames.map((game) => {
        const allOrders: any[] = [];
        (game.skus || []).forEach((sku: any) => {
          if (sku.orders && Array.isArray(sku.orders)) {
            allOrders.push(...sku.orders);
          }
        });

        const totalOrders = allOrders.length;
        const completedOrders = allOrders.filter(
          (order: any) => order.status === "completed",
        ).length;
        const totalRevenue = allOrders
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
      });
    }

    return {
      success: true,
      message: "Games fetched successfully",
      data: gamesWithAnalytics,
    };
  } catch (error) {
    console.error("Get merchant games error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Create new game
export const createGameAction = authActionClient
  .schema(createGameSchema)
  .action(async ({ parsedInput, ctx }): Promise<MerchantActionResult> => {
    try {
      const supabase = createSupabaseServerClient();

      const gameData = {
        name: parsedInput.name,
        description: parsedInput.description || null,
        banner_url: parsedInput.bannerUrl || null,
        merchant_id: ctx.user.id,
      };

      const { data, error } = await (supabase as any)
        .from("games")
        .insert(gameData)
        .select()
        .single();

      if (error) {
        console.error("Error creating game:", error);
        return {
          success: false,
          message: "Failed to create game",
        };
      }

      revalidatePath("/dashboard/merchant/games");

      return {
        success: true,
        message: "Game created successfully",
        data,
      };
    } catch (error) {
      console.error("Create game error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// Update game
export const updateGameAction = authActionClient
  .schema(updateGameSchema)
  .action(async ({ parsedInput, ctx }): Promise<MerchantActionResult> => {
    try {
      // Verify game ownership
      const isOwner = await verifyGameOwnership(
        parsedInput.gameId,
        ctx.user.id,
      );

      if (!isOwner) {
        return {
          success: false,
          message: "Access denied: Game does not belong to this merchant",
        };
      }

      const supabase = createSupabaseServerClient();

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (parsedInput.name) {
        updateData.name = parsedInput.name;
      }

      if (parsedInput.description) {
        updateData.description = parsedInput.description;
      }

      if (parsedInput.bannerUrl !== undefined) {
        updateData.banner_url = parsedInput.bannerUrl;
      }

      const { data, error } = await (supabase as any)
        .from("games")
        .update(updateData)
        .eq("id", parsedInput.gameId)
        .select()
        .single();

      if (error) {
        console.error("Error updating game:", error);
        return {
          success: false,
          message: "Failed to update game",
        };
      }

      revalidatePath("/dashboard/merchant/games");

      return {
        success: true,
        message: "Game updated successfully",
        data,
      };
    } catch (error) {
      console.error("Update game error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// Delete game
export async function deleteGameAction(
  gameId: string,
): Promise<MerchantActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return { success: false, message: "Permission denied" };
    }

    // Verify game ownership
    const isOwner = await verifyGameOwnership(gameId, user.id);

    if (!isOwner) {
      return {
        success: false,
        message: "Access denied: Game does not belong to this merchant",
      };
    }

    const supabase = createSupabaseServerClient();

    // Check if game has orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .eq("game_id", gameId)
      .limit(1);

    if (ordersError) {
      console.error("Error checking game orders:", ordersError);
      return {
        success: false,
        message: "Failed to verify game orders",
      };
    }

    if (orders && orders.length > 0) {
      return {
        success: false,
        message: "Cannot delete game with existing orders",
      };
    }

    // Delete game (SKUs will be deleted via cascade)
    const { error } = await supabase.from("games").delete().eq("id", gameId);

    if (error) {
      console.error("Error deleting game:", error);
      return {
        success: false,
        message: "Failed to delete game",
      };
    }

    revalidatePath("/dashboard/merchant/games");

    return {
      success: true,
      message: "Game deleted successfully",
    };
  } catch (error) {
    console.error("Delete game error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// =============================================================================
// SKU MANAGEMENT ACTIONS
// =============================================================================

// Get game SKUs
export async function getGameSkus(
  gameId: string,
): Promise<MerchantActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return { success: false, message: "Permission denied" };
    }

    // Verify game ownership
    const isOwner = await verifyGameOwnership(gameId, user.id);

    if (!isOwner) {
      return {
        success: false,
        message: "Access denied: Game does not belong to this merchant",
      };
    }

    const supabase = createSupabaseServerClient();

    const { data: skus, error } = await supabase
      .from("skus")
      .select(
        `
        *,
        orders:orders(id, amount, status, created_at)
      `,
      )
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching game SKUs:", error);
      return {
        success: false,
        message: "Failed to fetch SKUs",
      };
    }

    // Add analytics to each SKU
    const skusWithAnalytics =
      (skus as any[])?.map((sku) => {
        const orders = sku.orders || [];
        const totalOrders = orders.length;
        const completedOrders = orders.filter(
          (order: any) => order.status === "completed",
        ).length;
        const totalRevenue = orders
          .filter((order: any) => order.status === "completed")
          .reduce((sum: number, order: any) => sum + order.amount, 0);

        return {
          ...sku,
          analytics: {
            totalOrders,
            completedOrders,
            totalRevenue,
          },
        };
      }) || [];

    return {
      success: true,
      message: "SKUs fetched successfully",
      data: skusWithAnalytics,
    };
  } catch (error) {
    console.error("Get game SKUs error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Create SKU
export const createSkuAction = authActionClient
  .schema(createSkuSchema)
  .action(async ({ parsedInput, ctx }): Promise<MerchantActionResult> => {
    try {
      // Verify game ownership
      const isOwner = await verifyGameOwnership(
        parsedInput.gameId,
        ctx.user.id,
      );

      if (!isOwner) {
        return {
          success: false,
          message: "Access denied: Game does not belong to this merchant",
        };
      }

      const supabase = createSupabaseServerClient();

      const skuData = {
        name: parsedInput.name,
        description: parsedInput.description || null,
        prices: parsedInput.prices,
        image_url: parsedInput.imageUrl || null,
        game_id: parsedInput.gameId,
      };

      const { data, error } = await (supabase as any)
        .from("skus")
        .insert(skuData)
        .select()
        .single();

      if (error) {
        console.error("Error creating SKU:", error);
        return {
          success: false,
          message: "Failed to create SKU",
        };
      }

      revalidatePath(`/dashboard/merchant/games/${parsedInput.gameId}/skus`);

      return {
        success: true,
        message: "SKU created successfully",
        data,
      };
    } catch (error) {
      console.error("Create SKU error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// Update SKU
export const updateSkuAction = authActionClient
  .schema(updateSkuSchema)
  .action(async ({ parsedInput, ctx }): Promise<MerchantActionResult> => {
    try {
      const supabase = createSupabaseServerClient();

      // Get SKU with game info to verify ownership
      const { data: sku, error: skuError } = await supabase
        .from("skus")
        .select(
          `
          game_id,
          games:games(merchant_id)
        `,
        )
        .eq("id", parsedInput.skuId)
        .single();

      if (skuError || !sku) {
        return {
          success: false,
          message: "SKU not found",
        };
      }

      // Verify ownership through the game
      const isOwner = (sku as any).games?.merchant_id === ctx.user.id;
      if (!isOwner) {
        return {
          success: false,
          message: "Access denied: SKU does not belong to this merchant",
        };
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (parsedInput.name) {
        updateData.name = parsedInput.name;
      }

      if (parsedInput.description) {
        updateData.description = parsedInput.description;
      }

      if (parsedInput.prices) {
        updateData.prices = parsedInput.prices;
      }

      if (parsedInput.imageUrl !== undefined) {
        updateData.image_url = parsedInput.imageUrl;
      }

      const { data, error } = await (supabase as any)
        .from("skus")
        .update(updateData)
        .eq("id", parsedInput.skuId)
        .select()
        .single();

      if (error) {
        console.error("Error updating SKU:", error);
        return {
          success: false,
          message: "Failed to update SKU",
        };
      }

      revalidatePath(`/dashboard/merchant/games/${(sku as any).game_id}/skus`);

      return {
        success: true,
        message: "SKU updated successfully",
        data,
      };
    } catch (error) {
      console.error("Update SKU error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// Delete SKU
export async function deleteSkuAction(
  skuId: string,
): Promise<MerchantActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return { success: false, message: "Permission denied" };
    }

    const supabase = createSupabaseServerClient();

    // Get SKU with game info to verify ownership
    const { data: sku, error: skuError } = await supabase
      .from("skus")
      .select(
        `
        game_id,
        games:games(merchant_id)
      `,
      )
      .eq("id", skuId)
      .single();

    if (skuError || !sku) {
      return {
        success: false,
        message: "SKU not found",
      };
    }

    // Verify ownership through the game
    const isOwner = (sku as any).games?.merchant_id === user.id;
    if (!isOwner) {
      return {
        success: false,
        message: "Access denied: SKU does not belong to this merchant",
      };
    }

    // Check if SKU has orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .eq("sku_id", skuId)
      .limit(1);

    if (ordersError) {
      console.error("Error checking SKU orders:", ordersError);
      return {
        success: false,
        message: "Failed to verify SKU orders",
      };
    }

    if (orders && orders.length > 0) {
      return {
        success: false,
        message: "Cannot delete SKU with existing orders",
      };
    }

    // Delete SKU
    const { error } = await supabase.from("skus").delete().eq("id", skuId);

    if (error) {
      console.error("Error deleting SKU:", error);
      return {
        success: false,
        message: "Failed to delete SKU",
      };
    }

    revalidatePath(`/dashboard/merchant/games/${(sku as any).game_id}/skus`);

    return {
      success: true,
      message: "SKU deleted successfully",
    };
  } catch (error) {
    console.error("Delete SKU error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// =============================================================================
// ORDER MANAGEMENT ACTIONS
// =============================================================================

// Get merchant's orders
export async function getMerchantOrders(
  page: number = 1,
  pageSize: number = 50,
  status?: string,
): Promise<MerchantActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return { success: false, message: "Permission denied" };
    }

    const supabase = createSupabaseServerClient();
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        profiles:profiles(id, merchant_name),
        skus:skus(id, name, game_id),
        games:games(id, name)
      `,
        { count: "exact" },
      )
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Error fetching merchant orders:", error);
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
    console.error("Get merchant orders error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// =============================================================================
// MERCHANT ANALYTICS
// =============================================================================

// Get merchant analytics
export async function getMerchantAnalytics(): Promise<MerchantActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return { success: false, message: "Permission denied" };
    }

    const supabase = createSupabaseServerClient();

    // Get merchant's analytics data
    const { data: analytics, error } = await supabase
      .from("merchant_analytics")
      .select("*")
      .eq("merchant_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching merchant analytics:", error);
      return {
        success: false,
        message: "Failed to fetch analytics",
      };
    }

    // If no analytics record exists, calculate from scratch
    if (!analytics) {
      // Get merchant game IDs first
      const { data: gameIds } = (await supabase.rpc("get_merchant_game_ids", {
        p_merchant_id: user.id,
      } as any)) as { data: { game_id: string }[] | null };

      const [
        { count: totalGames },
        { count: totalSkus },
        { count: totalOrders },
        { data: completedOrders },
        { data: lastOrder },
      ] = await Promise.all([
        supabase
          .from("games")
          .select("*", { count: "exact", head: true })
          .eq("merchant_id", user.id),
        supabase
          .from("skus")
          .select("*", { count: "exact", head: true })
          .in("game_id", gameIds?.map((row) => row.game_id) || []),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("merchant_id", user.id),
        supabase
          .from("orders")
          .select("amount")
          .eq("merchant_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("orders")
          .select("created_at")
          .eq("merchant_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      const totalRevenue =
        (completedOrders as any[])?.reduce(
          (sum, order) => sum + order.amount,
          0,
        ) || 0;
      const completedOrdersCount = (completedOrders as any[])?.length || 0;

      return {
        success: true,
        message: "Analytics fetched successfully",
        data: {
          merchant_id: user.id,
          total_games: totalGames || 0,
          total_skus: totalSkus || 0,
          total_orders: totalOrders || 0,
          total_revenue: totalRevenue,
          completed_orders: completedOrdersCount,
          last_order_date: (lastOrder as any[])?.[0]?.created_at || null,
          conversion_rate:
            (totalOrders as number) > 0
              ? (completedOrdersCount / (totalOrders as number)) * 100
              : 0,
        },
      };
    }

    return {
      success: true,
      message: "Analytics fetched successfully",
      data: analytics,
    };
  } catch (error) {
    console.error("Get merchant analytics error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
