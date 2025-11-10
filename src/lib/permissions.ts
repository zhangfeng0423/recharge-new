import type { Database } from "@/lib/supabase-types";
import {
  createSupabaseServerClient,
  createSupabaseServerClientWithCookies,
} from "@/lib/supabaseServer";

// 权限类型枚举
export enum Permission {
  ADMIN = "ADMIN",
  MERCHANT = "MERCHANT",
  USER = "USER",
}

// 权限检查结果接口
export interface PermissionResult {
  success: boolean;
  userId?: string;
  userRole?: Permission;
  error?: string;
}

// 用户信息接口
export interface UserInfo {
  id: string;
  email: string;
  role: Permission;
  merchantName?: string;
}

/**
 * 统一的权限验证服务
 */
export class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * 获取当前用户信息
   */
  public async getCurrentUser(): Promise<{ user: any; error?: string }> {
    try {
      const supabase = await createSupabaseServerClientWithCookies();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  /**
   * 获取用户详细信息（包括角色）
   */
  public async getUserProfile(
    userId: string,
  ): Promise<{ profile: any; error?: string }> {
    try {
      // 使用服务器客户端而不是cookie客户端来查询profile
      // 因为cookie客户端可能受到RLS限制
      const supabase = createSupabaseServerClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, id, merchant_name")
        .eq("id", userId)
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      return { profile };
    } catch (error) {
      return {
        profile: null,
        error: error instanceof Error ? error.message : "Profile fetch failed",
      };
    }
  }

  /**
   * 检查用户是否具有管理员权限
   * 使用数据库查询而不是RPC函数，确保兼容性
   */
  public async checkAdminPermission(
    userId?: string,
  ): Promise<PermissionResult> {
    try {
      // 获取当前用户
      const { user, error: userError } = await this.getCurrentUser();

      if (userError || !user) {
        return { success: false, error: "Not authenticated" };
      }

      const targetUserId = userId || user.id;

      // 直接查询用户角色，避免依赖RPC函数
      const { profile, error: profileError } =
        await this.getUserProfile(targetUserId);

      if (profileError || !profile) {
        return { success: false, error: "Profile not found" };
      }

      const userRole = profile.role as Permission;

      if (userRole !== Permission.ADMIN) {
        return {
          success: false,
          userId: targetUserId,
          userRole,
          error: "Admin permission required",
        };
      }

      return {
        success: true,
        userId: targetUserId,
        userRole,
      };
    } catch (error) {
      console.error("Admin permission check error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Permission check failed",
      };
    }
  }

  /**
   * 检查用户是否具有商户权限
   * 支持管理员访问和商户自己访问
   */
  public async checkMerchantPermission(
    merchantId?: string,
  ): Promise<PermissionResult> {
    try {
      // 获取当前用户
      const { user, error: userError } = await this.getCurrentUser();

      if (userError || !user) {
        return { success: false, error: "Not authenticated" };
      }

      // 获取用户详细信息
      const { profile, error: profileError } = await this.getUserProfile(
        user.id,
      );

      if (profileError || !profile) {
        return { success: false, error: "Profile not found" };
      }

      const userRole = profile.role as Permission;

      // 检查是否是管理员或商户
      if (userRole !== Permission.MERCHANT && userRole !== Permission.ADMIN) {
        return {
          success: false,
          userId: user.id,
          userRole,
          error: "Merchant permission required",
        };
      }

      // 如果检查特定商户访问权限
      if (
        merchantId &&
        userRole === Permission.MERCHANT &&
        user.id !== merchantId
      ) {
        return {
          success: false,
          userId: user.id,
          userRole,
          error: "Access denied to this merchant's data",
        };
      }

      return {
        success: true,
        userId: user.id,
        userRole,
      };
    } catch (error) {
      console.error("Merchant permission check error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Permission check failed",
      };
    }
  }

  /**
   * 验证游戏所有权
   */
  public async verifyGameOwnership(
    gameId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: game, error } = await supabase
        .from("games")
        .select("merchant_id")
        .eq("id", gameId)
        .single();

      if (error || !game) {
        return false;
      }

      return (game as any).merchant_id === userId;
    } catch (error) {
      console.error("Game ownership verification error:", error);
      return false;
    }
  }

  /**
   * 验证SKU所有权（通过游戏）
   */
  public async verifySkuOwnership(
    skuId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const supabase = createSupabaseServerClient();
      const { data: sku, error } = await supabase
        .from("skus")
        .select(`
          game_id,
          games:games(merchant_id)
        `)
        .eq("id", skuId)
        .single();

      if (error || !sku) {
        return false;
      }

      return (sku as any).games?.merchant_id === userId;
    } catch (error) {
      console.error("SKU ownership verification error:", error);
      return false;
    }
  }

  /**
   * 检查用户是否有权限访问特定资源
   */
  public async checkResourceAccess(
    resourceType: "game" | "sku",
    resourceId: string,
    userId: string,
  ): Promise<boolean> {
    switch (resourceType) {
      case "game":
        return await this.verifyGameOwnership(resourceId, userId);
      case "sku":
        return await this.verifySkuOwnership(resourceId, userId);
      default:
        return false;
    }
  }
}

// 导出单例实例
export const permissionService = PermissionService.getInstance();

// 便捷函数导出
export const checkAdminPermission = (userId?: string) =>
  permissionService.checkAdminPermission(userId);

export const checkMerchantPermission = (merchantId?: string) =>
  permissionService.checkMerchantPermission(merchantId);

export const verifyGameOwnership = (gameId: string, userId: string) =>
  permissionService.verifyGameOwnership(gameId, userId);

export const verifySkuOwnership = (skuId: string, userId: string) =>
  permissionService.verifySkuOwnership(skuId, userId);

export const checkResourceAccess = (
  resourceType: "game" | "sku",
  resourceId: string,
  userId: string,
) => permissionService.checkResourceAccess(resourceType, resourceId, userId);
