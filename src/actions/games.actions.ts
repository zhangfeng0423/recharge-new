"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import type { Database, Game, GameWithSkus } from "@/lib/supabase-types";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Create the action client
const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Games action error:", error);
    return {
      message: "An unexpected error occurred",
    };
  },
});

// Validation schemas
const getGameByIdSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
});

const searchGamesSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

// Action results
export interface GamesResult {
  success: boolean;
  message: string;
  data?: any;
}

// Get all games (for homepage)
export async function getGames(
  limit: number = 20,
  offset: number = 0,
): Promise<GamesResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error, count } = await supabase
      .from("games")
      .select(
        `
        *,
        profiles!games_merchant_id_fkey (
          merchant_name
        ),
        skus (
          id,
          name,
          prices,
          image_url
        )
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get games error:", error);
      console.error("Supabase error details:", error); // Added for debugging
      // Return mock data if database fails
      return getMockGamesResult(limit, offset);
    }

    return {
      success: true,
      message: "Games fetched successfully",
      data: {
        games: data as GameWithSkus[],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    };
  } catch (error) {
    console.error("Unexpected get games error:", error);
    // Return mock data if database fails
    return getMockGamesResult(limit, offset);
  }
}

// Get game by ID (for game detail page) - Server Action version
export const getGameById = actionClient
  .schema(getGameByIdSchema)
  .action(async ({ parsedInput }): Promise<GamesResult> => {
    try {
      const supabase = createSupabaseServerClient();

      const { data, error } = await supabase
        .from("games")
        .select(`
          *,
          profiles!games_merchant_id_fkey (
            merchant_name
          ),
          skus (
            id,
            name,
            description,
            prices,
            image_url
          )
        `)
        .eq("id", parsedInput.gameId)
        .single();

      if (error) {
        console.error("Get game by ID error:", error);
        // Return mock data if database fails
        const mockGame = getMockGames().find((game) => game.id === parsedInput.gameId);
        if (!mockGame) {
          return {
            success: false,
            message: "Game not found",
          };
        }
        return {
          success: true,
          message: "Mock game fetched successfully",
          data: mockGame,
        };
      }

      return {
        success: true,
        message: "Game fetched successfully",
        data: data as GameWithSkus,
      };
    } catch (error) {
      console.error("Unexpected get game by ID error:", error);
      // Return mock data if database fails
      const mockGame = getMockGames().find((game) => game.id === parsedInput.gameId);
      if (!mockGame) {
        return {
          success: false,
          message: "Game not found",
        };
      }
      return {
        success: true,
        message: "Mock game fetched successfully",
        data: mockGame,
      };
    }
  });

// Search games
export const searchGames = actionClient
  .schema(searchGamesSchema)
  .action(async ({ parsedInput }): Promise<GamesResult> => {
    try {
      const supabase = createSupabaseServerClient();
      const { query, limit, offset } = parsedInput;

      let queryBuilder = supabase
        .from("games")
        .select(`
          *,
          profiles!games_merchant_id_fkey (
            merchant_name
          ),
          skus (
            id,
            name,
            prices,
            image_url
          )
        `)
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      // Add search filter if query is provided
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(`
          name->>en.ilike.%${query}%,
          name->>zh.ilike.%${query}%,
          description->>en.ilike.%${query}%,
          description->>zh.ilike.%${query}%
        `);
      }

      const { data, error, count } = await queryBuilder;

      if (error) {
        console.error("Search games error:", error);
        return {
          success: false,
          message: "Failed to search games",
        };
      }

      return {
        success: true,
        message: "Games searched successfully",
        data: {
          games: data as GameWithSkus[],
          total: count || 0,
          hasMore: (count || 0) > offset + limit,
          query,
        },
      };
    } catch (error) {
      console.error("Unexpected search games error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  });

// Get featured games (most popular or highlighted)
export async function getFeaturedGames(
  limit: number = 6,
): Promise<GamesResult> {
  try {
    const supabase = createSupabaseServerClient();

    // For now, we'll get the most recent games with SKUs
    // In a real app, you might have a "featured" flag or ordering by popularity
    const { data, error } = await supabase
      .from("games")
      .select(`
        *,
        profiles!games_merchant_id_fkey (
          merchant_name
        ),
        skus (
          id,
          name,
          prices,
          image_url
        )
      `)
      .not("skus", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get featured games error:", error);
      return {
        success: false,
        message: "Failed to fetch featured games",
      };
    }

    return {
      success: true,
      message: "Featured games fetched successfully",
      data: data as GameWithSkus[],
    };
  } catch (error) {
    console.error("Unexpected get featured games error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// Get game SKUs (for the game detail page)
export async function getGameSkus(gameId: string): Promise<GamesResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("skus")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get game SKUs error:", error);
      return getMockGameSkusResult(gameId);
    }

    return {
      success: true,
      message: "Game SKUs fetched successfully",
      data: data,
    };
  } catch (error) {
    console.error("Unexpected get game SKUs error:", error);
    return getMockGameSkusResult(gameId);
  }
}

// Mock data functions for fallback
function getMockGamesResult(
  limit: number = 20,
  offset: number = 0,
): GamesResult {
  const mockGames = getMockGames();
  const paginatedGames = mockGames.slice(offset, offset + limit);

  return {
    success: true,
    message: "Mock games fetched successfully",
    data: {
      games: paginatedGames,
      total: mockGames.length,
      hasMore: mockGames.length > offset + limit,
    },
  };
}

function getMockGameSkusResult(gameId: string): GamesResult {
  const mockSkus = getMockSkusByGameId(gameId);

  return {
    success: true,
    message: "Mock SKUs fetched successfully",
    data: mockSkus,
  };
}

function getMockGames(): GameWithSkus[] {
  return [
    {
      id: "game-1",
      name: { en: "Dragon Quest Online", zh: "龙之传说在线" },
      description: {
        en: "Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.",
        zh: "在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。",
      },
      banner_url:
        "https://placehold.co/1200x680?text=Dragon+Quest+Online&font=playfair-display",
      merchant_id: "profile-merchant-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: { merchant_name: "Fantasy Games Studio" },
      skus: [
        {
          id: "sku-1-1",
          name: { en: "Dragon Crystal Pack x100", zh: "龙水晶包 x100" },
          prices: { usd: 999, eur: 899, gbp: 799 },
          image_url:
            "https://placehold.co/400x400?text=Crystals+x100&font=fantasy",
          game_id: "game-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "sku-1-2",
          name: { en: "Dragon Crystal Pack x500", zh: "龙水晶包 x500" },
          prices: { usd: 4999, eur: 4499, gbp: 3999 },
          image_url:
            "https://placehold.co/400x400?text=Crystals+x500&font=fantasy",
          game_id: "game-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: "game-2",
      name: { en: "Cyber Strike 2077", zh: "赛博突击2077" },
      description: {
        en: "Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics and engage in tactical battles across neon-lit cityscapes.",
        zh: "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格定制你的角色，在霓虹灯闪耀的城市景观中进行战术战斗。",
      },
      banner_url:
        "https://placehold.co/1200x680?text=Cyber+Strike+2077&font=orbitron",
      merchant_id: "profile-merchant-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: { merchant_name: "Fantasy Games Studio" },
      skus: [
        {
          id: "sku-2-1",
          name: { en: "Weapon Pack x5", zh: "武器包 x5" },
          prices: { usd: 1499, eur: 1349, gbp: 1199 },
          image_url: "https://placehold.co/400x400?text=Weapons+x5&font=cyber",
          game_id: "game-2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: "game-3",
      name: { en: "Empire Builder Pro", zh: "帝国建造者专业版" },
      description: {
        en: "Build your empire from the ground up. Manage resources, conduct diplomacy, research technologies, and lead your civilization to glory in this deep strategy game.",
        zh: "从零开始建立你的帝国。管理资源、进行外交、研究技术，并在这款深度策略游戏中领导你的文明走向辉煌。",
      },
      banner_url:
        "https://placehold.co/1200x680?text=Empire+Builder+Pro&font=merriweather",
      merchant_id: "profile-merchant-2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: { merchant_name: "Action Games Inc" },
      skus: [
        {
          id: "sku-3-1",
          name: { en: "Resource Pack", zh: "资源包" },
          prices: { usd: 999, eur: 899, gbp: 799 },
          image_url:
            "https://placehold.co/400x400?text=Resource+Pack&font=serif",
          game_id: "game-3",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: "game-4",
      name: { en: "Speed Rivals", zh: "极速对手" },
      description: {
        en: "High-octane racing action with stunning graphics. Race against players worldwide, customize your vehicles, and dominate the leaderboards in this adrenaline-pumping game.",
        zh: "拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，定制你的车辆，在这款令人心跳加速的游戏中主导排行榜。",
      },
      banner_url: "https://placehold.co/1200x680?text=Speed+Rivals&font=roboto",
      merchant_id: "profile-merchant-2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: { merchant_name: "Action Games Inc" },
      skus: [
        {
          id: "sku-4-1",
          name: { en: "Nitro Boost x50", zh: "氮气加速 x50" },
          prices: { usd: 499, eur: 449, gbp: 399 },
          image_url: "https://placehold.co/400x400?text=Nitro+x50&font=racing",
          game_id: "game-4",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  ];
}

function getMockSkusByGameId(gameId: string): any[] {
  const mockGame = getMockGames().find((game) => game.id === gameId);
  return mockGame?.skus || [];
}

// Regular async function version for server components
export async function getGameByIdServer(gameId: string): Promise<GamesResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("games")
      .select(`
        *,
        profiles!games_merchant_id_fkey (
          merchant_name
        ),
        skus (
          id,
          name,
          description,
          prices,
          image_url
        )
      `)
      .eq("id", gameId)
      .single();

    if (error) {
      console.error("Get game by ID error:", error);
      // Return mock data if database fails
      const mockGame = getMockGames().find((game) => game.id === gameId);
      if (!mockGame) {
        return {
          success: false,
          message: "Game not found",
        };
      }
      return {
        success: true,
        message: "Mock game fetched successfully",
        data: mockGame,
      };
    }

    return {
      success: true,
      message: "Game fetched successfully",
      data: data as GameWithSkus,
    };
  } catch (error) {
    console.error("Unexpected get game by ID error:", error);
    // Return mock data if database fails
    const mockGame = getMockGames().find((game) => game.id === gameId);
    if (!mockGame) {
      return {
        success: false,
        message: "Game not found",
      };
    }
    return {
      success: true,
      message: "Mock game fetched successfully",
      data: mockGame,
    };
  }
}
