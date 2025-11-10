/**
 * 降级数据管理模块
 * 提供数据完整性检查、缓存机制和默认数据模板
 */

import { EnhancedError, ErrorCategory, ErrorFactory } from "./error-handling";
import type { Database } from "./supabase-types";

// 数据类型定义
export interface FallbackGameData {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  banner_url: string;
  merchant_id: string;
  merchant_name: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  sku_count: number;
  total_orders: number;
  total_revenue: number;
}

export interface FallbackSkuData {
  id: string;
  name: { en: string; zh: string };
  description?: { en: string; zh: string };
  game_id: string;
  game_name: { en: string; zh: string };
  prices: { usd: number };
  image_url?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  order_count: number;
  revenue: number;
}

export interface FallbackOrderData {
  id: string;
  user_id: string;
  user_email: string;
  sku_id: string;
  sku_name: { en: string; zh: string };
  game_id: string;
  game_name: { en: string; zh: string };
  merchant_id: string;
  merchant_name: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface FallbackUserData {
  id: string;
  email: string;
  role: "USER" | "MERCHANT" | "ADMIN";
  merchant_name?: string;
  created_at: string;
  last_login?: string;
}

export interface FallbackAnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  recentOrders: FallbackOrderData[];
  revenueByGame: Array<{
    gameId: string;
    gameName: { en: string; zh: string };
    revenue: number;
    orderCount: number;
  }>;
  topProducts: FallbackSkuData[];
}

// 数据完整性检查接口
export interface DataIntegrityResult {
  isValid: boolean;
  missingFields: string[];
  invalidTypes: string[];
  warnings: string[];
  score: number; // 0-100 数据完整性评分
}

// 数据提供者接口
export interface DataProvider<T> {
  getData(): Promise<T>;
  isDataFresh(data: T, maxAgeMs?: number): boolean;
  validateData(data: T): DataIntegrityResult;
  getFallbackData(): Promise<T>;
}

// 缓存配置
export interface CacheConfig {
  ttlMs: number; // 生存时间（毫秒）
  maxSize: number; // 最大缓存条目数
  enableCompression: boolean; // 是否启用压缩
}

// 缓存条目
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  integrityResult: DataIntegrityResult;
  accessCount: number;
  lastAccessed: number;
}

// 通用缓存管理器
export class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  // 获取缓存数据
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.config.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // 设置缓存数据
  set(key: string, data: T, integrityResult: DataIntegrityResult): void {
    // 如果缓存已满，删除最少使用的条目
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      integrityResult,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  // 删除缓存条目
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const now = Date.now();
    let totalAccess = 0;
    let oldest = now;
    let newest = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      oldest = Math.min(oldest, entry.timestamp);
      newest = Math.max(newest, entry.timestamp);
    }

    return {
      size: this.cache.size,
      hitRate:
        totalAccess > 0 ? (totalAccess - this.cache.size) / totalAccess : 0,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  // 清理过期条目
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttlMs) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // 删除最少使用的条目
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastAccess = Infinity;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (
        entry.accessCount < leastAccess ||
        (entry.accessCount === leastAccess && entry.lastAccessed < oldestAccess)
      ) {
        leastUsedKey = key;
        leastAccess = entry.accessCount;
        oldestAccess = entry.lastAccessed;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
}

// 数据完整性检查器
export class DataIntegrityChecker {
  // 检查游戏数据完整性
  static checkGameData(data: any): DataIntegrityResult {
    const requiredFields = [
      "id",
      "name",
      "description",
      "status",
      "created_at",
    ];
    const missingFields: string[] = [];
    const invalidTypes: string[] = [];
    const warnings: string[] = [];

    // 检查必需字段
    for (const field of requiredFields) {
      if (
        !(field in data) ||
        data[field] === null ||
        data[field] === undefined
      ) {
        missingFields.push(field);
      }
    }

    // 检查字段类型
    if (data.id && typeof data.id !== "string") {
      invalidTypes.push("id should be string");
    }

    if (data.name && typeof data.name !== "object") {
      invalidTypes.push("name should be object with en/zh properties");
    } else if (data.name) {
      if (!data.name.en || typeof data.name.en !== "string") {
        warnings.push("name.en is missing or invalid");
      }
      if (!data.name.zh || typeof data.name.zh !== "string") {
        warnings.push("name.zh is missing or invalid");
      }
    }

    if (
      data.status &&
      !["active", "inactive", "suspended"].includes(data.status)
    ) {
      invalidTypes.push("status should be one of: active, inactive, suspended");
    }

    // 计算完整性评分
    const totalChecks = requiredFields.length + 3; // 基本字段 + 类型检查
    const passedChecks =
      totalChecks -
      missingFields.length -
      invalidTypes.length -
      Math.ceil(warnings.length / 2);
    const score = Math.max(
      0,
      Math.min(100, (passedChecks / totalChecks) * 100),
    );

    return {
      isValid: missingFields.length === 0 && invalidTypes.length === 0,
      missingFields,
      invalidTypes,
      warnings,
      score,
    };
  }

  // 检查SKU数据完整性
  static checkSkuData(data: any): DataIntegrityResult {
    const requiredFields = [
      "id",
      "name",
      "game_id",
      "prices",
      "status",
      "created_at",
    ];
    const missingFields: string[] = [];
    const invalidTypes: string[] = [];
    const warnings: string[] = [];

    // 检查必需字段
    for (const field of requiredFields) {
      if (
        !(field in data) ||
        data[field] === null ||
        data[field] === undefined
      ) {
        missingFields.push(field);
      }
    }

    // 检查价格
    if (data.prices && typeof data.prices !== "object") {
      invalidTypes.push("prices should be object");
    } else if (data.prices && !data.prices.usd) {
      warnings.push("prices.usd is missing");
    } else if (
      data.prices?.usd &&
      (typeof data.prices.usd !== "number" || data.prices.usd <= 0)
    ) {
      invalidTypes.push("prices.usd should be positive number");
    }

    // 检查名称
    if (data.name && typeof data.name !== "object") {
      invalidTypes.push("name should be object with en/zh properties");
    } else if (data.name) {
      if (!data.name.en || typeof data.name.en !== "string") {
        warnings.push("name.en is missing or invalid");
      }
      if (!data.name.zh || typeof data.name.zh !== "string") {
        warnings.push("name.zh is missing or invalid");
      }
    }

    // 计算完整性评分
    const totalChecks = requiredFields.length + 4;
    const passedChecks =
      totalChecks -
      missingFields.length -
      invalidTypes.length -
      Math.ceil(warnings.length / 2);
    const score = Math.max(
      0,
      Math.min(100, (passedChecks / totalChecks) * 100),
    );

    return {
      isValid: missingFields.length === 0 && invalidTypes.length === 0,
      missingFields,
      invalidTypes,
      warnings,
      score,
    };
  }

  // 检查订单数据完整性
  static checkOrderData(data: any): DataIntegrityResult {
    const requiredFields = [
      "id",
      "user_id",
      "sku_id",
      "amount",
      "currency",
      "status",
      "created_at",
    ];
    const missingFields: string[] = [];
    const invalidTypes: string[] = [];
    const warnings: string[] = [];

    // 检查必需字段
    for (const field of requiredFields) {
      if (
        !(field in data) ||
        data[field] === null ||
        data[field] === undefined
      ) {
        missingFields.push(field);
      }
    }

    // 检查金额
    if (data.amount && (typeof data.amount !== "number" || data.amount <= 0)) {
      invalidTypes.push("amount should be positive number");
    }

    // 检查状态
    if (
      data.status &&
      !["pending", "completed", "failed", "refunded"].includes(data.status)
    ) {
      invalidTypes.push(
        "status should be one of: pending, completed, failed, refunded",
      );
    }

    // 计算完整性评分
    const totalChecks = requiredFields.length + 2;
    const passedChecks =
      totalChecks - missingFields.length - invalidTypes.length;
    const score = Math.max(
      0,
      Math.min(100, (passedChecks / totalChecks) * 100),
    );

    return {
      isValid: missingFields.length === 0 && invalidTypes.length === 0,
      missingFields,
      invalidTypes,
      warnings,
      score,
    };
  }

  // 检查用户数据完整性
  static checkUserData(data: any): DataIntegrityResult {
    const requiredFields = ["id", "email", "role", "created_at"];
    const missingFields: string[] = [];
    const invalidTypes: string[] = [];
    const warnings: string[] = [];

    // 检查必需字段
    for (const field of requiredFields) {
      if (
        !(field in data) ||
        data[field] === null ||
        data[field] === undefined
      ) {
        missingFields.push(field);
      }
    }

    // 检查邮箱格式
    if (data.email && typeof data.email !== "string") {
      invalidTypes.push("email should be string");
    } else if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      invalidTypes.push("email should be valid email address");
    }

    // 检查角色
    if (data.role && !["USER", "MERCHANT", "ADMIN"].includes(data.role)) {
      invalidTypes.push("role should be one of: USER, MERCHANT, ADMIN");
    }

    // 计算完整性评分
    const totalChecks = requiredFields.length + 2;
    const passedChecks =
      totalChecks - missingFields.length - invalidTypes.length;
    const score = Math.max(
      0,
      Math.min(100, (passedChecks / totalChecks) * 100),
    );

    return {
      isValid: missingFields.length === 0 && invalidTypes.length === 0,
      missingFields,
      invalidTypes,
      warnings,
      score,
    };
  }
}

// 默认数据模板
export class DefaultDataTemplates {
  // 默认游戏数据
  static getDefaultGame(): FallbackGameData {
    return {
      id: "fallback-game-001",
      name: {
        en: "Sample Game",
        zh: "示例游戏",
      },
      description: {
        en: "A sample game for demonstration purposes",
        zh: "用于演示的示例游戏",
      },
      banner_url: "/images/default-game-banner.jpg",
      merchant_id: "fallback-merchant-001",
      merchant_name: "Demo Merchant",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sku_count: 3,
      total_orders: 0,
      total_revenue: 0,
    };
  }

  // 默认SKU数据
  static getDefaultSku(gameId: string = "fallback-game-001"): FallbackSkuData {
    return {
      id: `fallback-sku-${Date.now()}`,
      name: {
        en: "Sample Item",
        zh: "示例物品",
      },
      description: {
        en: "A sample item for demonstration purposes",
        zh: "用于演示的示例物品",
      },
      game_id: gameId,
      game_name: {
        en: "Sample Game",
        zh: "示例游戏",
      },
      prices: {
        usd: 999, // $9.99
      },
      image_url: "/images/default-item.jpg",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_count: 0,
      revenue: 0,
    };
  }

  // 默认订单数据
  static getDefaultOrder(): FallbackOrderData {
    return {
      id: `fallback-order-${Date.now()}`,
      user_id: "fallback-user-001",
      user_email: "user@example.com",
      sku_id: "fallback-sku-001",
      sku_name: {
        en: "Sample Item",
        zh: "示例物品",
      },
      game_id: "fallback-game-001",
      game_name: {
        en: "Sample Game",
        zh: "示例游戏",
      },
      merchant_id: "fallback-merchant-001",
      merchant_name: "Demo Merchant",
      amount: 999,
      currency: "usd",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 默认用户数据
  static getDefaultUser(): FallbackUserData {
    return {
      id: "fallback-user-001",
      email: "user@example.com",
      role: "USER",
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };
  }

  // 默认分析数据
  static getDefaultAnalytics(): FallbackAnalyticsData {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      recentOrders: [],
      revenueByGame: [],
      topProducts: [],
    };
  }

  // 获取多个默认SKU
  static getDefaultSkus(
    gameId: string = "fallback-game-001",
    count: number = 3,
  ): FallbackSkuData[] {
    const skus: FallbackSkuData[] = [];
    const baseNames = [
      { en: "Basic Pack", zh: "基础包" },
      { en: "Premium Pack", zh: "高级包" },
      { en: "Deluxe Pack", zh: "豪华包" },
    ];

    for (let i = 0; i < Math.min(count, baseNames.length); i++) {
      skus.push({
        ...DefaultDataTemplates.getDefaultSku(gameId),
        id: `fallback-sku-${gameId}-${i + 1}`,
        name: baseNames[i],
        prices: {
          usd: (i + 1) * 999, // $9.99, $19.99, $29.99
        },
      });
    }

    return skus;
  }

  // 获取多个默认游戏
  static getDefaultGames(count: number = 2): FallbackGameData[] {
    const games: FallbackGameData[] = [];
    const baseGames = [
      {
        name: { en: "Adventure Game", zh: "冒险游戏" },
        description: {
          en: "An exciting adventure game",
          zh: "激动人心的冒险游戏",
        },
      },
      {
        name: { en: "Strategy Game", zh: "策略游戏" },
        description: {
          en: "A strategic thinking game",
          zh: "需要策略思考的游戏",
        },
      },
    ];

    for (let i = 0; i < Math.min(count, baseGames.length); i++) {
      games.push({
        ...DefaultDataTemplates.getDefaultGame(),
        id: `fallback-game-${i + 1}`,
        ...baseGames[i],
        merchant_name: `Merchant ${i + 1}`,
      });
    }

    return games;
  }
}

// 降级数据管理器
export class FallbackDataManager {
  private static instance: FallbackDataManager;
  private gameCache: CacheManager<FallbackGameData[]>;
  private skuCache: CacheManager<FallbackSkuData[]>;
  private orderCache: CacheManager<FallbackOrderData[]>;
  private analyticsCache: CacheManager<FallbackAnalyticsData>;

  private constructor() {
    const cacheConfig: CacheConfig = {
      ttlMs: 5 * 60 * 1000, // 5分钟
      maxSize: 100,
      enableCompression: false,
    };

    this.gameCache = new CacheManager(cacheConfig);
    this.skuCache = new CacheManager(cacheConfig);
    this.orderCache = new CacheManager(cacheConfig);
    this.analyticsCache = new CacheManager(cacheConfig);
  }

  static getInstance(): FallbackDataManager {
    if (!FallbackDataManager.instance) {
      FallbackDataManager.instance = new FallbackDataManager();
    }
    return FallbackDataManager.instance;
  }

  // 获取游戏数据（带降级机制）
  async getGames(userId?: string): Promise<FallbackGameData[]> {
    const cacheKey = `games-${userId || "anonymous"}`;

    // 尝试从缓存获取
    let games = this.gameCache.get(cacheKey);
    if (games) {
      return games;
    }

    try {
      // 尝试从数据库获取
      games = await this.fetchGamesFromDatabase(userId);

      if (games && games.length > 0) {
        const integrityResult = DataIntegrityChecker.checkGameData(games[0]);
        this.gameCache.set(cacheKey, games, integrityResult);
        return games;
      }
    } catch (error) {
      console.warn(
        "Failed to fetch games from database, using fallback:",
        error,
      );
    }

    // 使用默认数据
    const fallbackGames = DefaultDataTemplates.getDefaultGames();
    const integrityResult = DataIntegrityChecker.checkGameData(
      fallbackGames[0],
    );
    this.gameCache.set(cacheKey, fallbackGames, integrityResult);

    return fallbackGames;
  }

  // 获取SKU数据（带降级机制）
  async getSkus(gameId: string): Promise<FallbackSkuData[]> {
    const cacheKey = `skus-${gameId}`;

    // 尝试从缓存获取
    let skus = this.skuCache.get(cacheKey);
    if (skus) {
      return skus;
    }

    try {
      // 尝试从数据库获取
      skus = await this.fetchSkusFromDatabase(gameId);

      if (skus && skus.length > 0) {
        const integrityResult = DataIntegrityChecker.checkSkuData(skus[0]);
        this.skuCache.set(cacheKey, skus, integrityResult);
        return skus;
      }
    } catch (error) {
      console.warn(
        "Failed to fetch SKUs from database, using fallback:",
        error,
      );
    }

    // 使用默认数据
    const fallbackSkus = DefaultDataTemplates.getDefaultSkus(gameId);
    const integrityResult = DataIntegrityChecker.checkSkuData(fallbackSkus[0]);
    this.skuCache.set(cacheKey, fallbackSkus, integrityResult);

    return fallbackSkus;
  }

  // 获取分析数据（带降级机制）
  async getAnalytics(
    userId: string,
    merchantId?: string,
  ): Promise<FallbackAnalyticsData> {
    const cacheKey = `analytics-${userId}-${merchantId || "general"}`;

    // 尝试从缓存获取
    let analytics = this.analyticsCache.get(cacheKey);
    if (analytics) {
      return analytics;
    }

    try {
      // 尝试从数据库获取
      analytics = await this.fetchAnalyticsFromDatabase(userId, merchantId);

      if (analytics) {
        const integrityResult = {
          isValid: true,
          missingFields: [],
          invalidTypes: [],
          warnings: [],
          score: 100,
        };
        this.analyticsCache.set(cacheKey, analytics, integrityResult);
        return analytics;
      }
    } catch (error) {
      console.warn(
        "Failed to fetch analytics from database, using fallback:",
        error,
      );
    }

    // 使用默认数据
    const fallbackAnalytics = DefaultDataTemplates.getDefaultAnalytics();
    const integrityResult = {
      isValid: true,
      missingFields: [],
      invalidTypes: [],
      warnings: [],
      score: 100,
    };
    this.analyticsCache.set(cacheKey, fallbackAnalytics, integrityResult);

    return fallbackAnalytics;
  }

  // 清理所有缓存
  cleanupCaches(): void {
    this.gameCache.cleanup();
    this.skuCache.cleanup();
    this.orderCache.cleanup();
    this.analyticsCache.cleanup();
  }

  // 获取缓存统计信息
  getCacheStats(): Record<string, any> {
    return {
      games: this.gameCache.getStats(),
      skus: this.skuCache.getStats(),
      orders: this.orderCache.getStats(),
      analytics: this.analyticsCache.getStats(),
    };
  }

  // 数据库获取方法（这些方法应该在实际情况中实现）
  private async fetchGamesFromDatabase(
    userId?: string,
  ): Promise<FallbackGameData[]> {
    // 这里应该调用实际的数据库逻辑
    // 目前抛出错误以触发降级机制
    throw ErrorFactory.databaseConnectionError("Database connection failed");
  }

  private async fetchSkusFromDatabase(
    gameId: string,
  ): Promise<FallbackSkuData[]> {
    // 这里应该调用实际的数据库逻辑
    throw ErrorFactory.databaseConnectionError("Database connection failed");
  }

  private async fetchAnalyticsFromDatabase(
    userId: string,
    merchantId?: string,
  ): Promise<FallbackAnalyticsData> {
    // 这里应该调用实际的数据库逻辑
    throw ErrorFactory.databaseConnectionError("Database connection failed");
  }
}

// 导出单例实例
export const fallbackDataManager = FallbackDataManager.getInstance();

// 便捷函数
export const getGamesWithFallback = (userId?: string) =>
  fallbackDataManager.getGames(userId);
export const getSkusWithFallback = (gameId: string) =>
  fallbackDataManager.getSkus(gameId);
export const getAnalyticsWithFallback = (userId: string, merchantId?: string) =>
  fallbackDataManager.getAnalytics(userId, merchantId);
export const cleanupFallbackCaches = () => fallbackDataManager.cleanupCaches();
export const getFallbackCacheStats = () => fallbackDataManager.getCacheStats();
