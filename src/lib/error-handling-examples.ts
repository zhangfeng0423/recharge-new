/**
 * 错误处理框架使用示例
 * 展示如何在应用中集成和使用错误处理框架
 */

import {
  createError,
  EnhancedError,
  ErrorCategory,
  ErrorFactory,
  ErrorSeverity,
  handleError,
  RetryHandler,
} from "./error-handling";
import { fallbackDataManager } from "./fallback-data";

// ============================================================================
// 1. 基本错误处理示例
// ============================================================================

/**
 * 示例：处理API调用错误
 */
export async function fetchUserData(userId: string) {
  try {
    // 模拟API调用
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw ErrorFactory.resourceNotFoundError(`User ${userId}`);
      } else if (response.status === 401) {
        throw ErrorFactory.authenticationError("Unauthorized access");
      } else if (response.status === 429) {
        throw ErrorFactory.apiRateLimitError();
      } else {
        throw ErrorFactory.systemError(`API error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    // 使用全局错误处理器处理错误
    const enhancedError = handleError(error as Error | EnhancedError, {
      operation: "fetchUserData",
      userId,
      timestamp: new Date().toISOString(),
    });

    // 可以选择重新抛出错误或返回默认值
    throw enhancedError;
  }
}

// ============================================================================
// 2. 重试机制示例
// ============================================================================

/**
 * 示例：使用重试机制处理不稳定的操作
 */
export async function processPayment(paymentData: any) {
  return await RetryHandler.executeWithRetry(
    async () => {
      // 模拟支付处理
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 503 || response.status === 502) {
          // 服务器错误，可以重试
          throw ErrorFactory.paymentProcessingError(
            `Payment service temporarily unavailable: ${errorData.message || "Unknown error"}`,
            { paymentId: paymentData.id, status: response.status },
          );
        } else if (response.status === 400) {
          // 客户端错误，不应该重试
          throw ErrorFactory.validationError(
            `Invalid payment data: ${errorData.message || "Validation failed"}`,
            { paymentData },
          );
        } else {
          throw ErrorFactory.paymentProcessingError(
            `Payment processing failed: ${errorData.message || "Unknown error"}`,
            { paymentId: paymentData.id, status: response.status },
          );
        }
      }

      return await response.json();
    },
    {
      maxRetries: 3,
      baseDelayMs: 1000,
      retryCondition: (error) => {
        const enhancedError =
          error instanceof EnhancedError
            ? error
            : ErrorFactory.fromError(error);
        // 只重试网络错误和服务器错误
        return (
          enhancedError.category === ErrorCategory.PAYMENT_PROCESSING &&
          enhancedError.retryable
        );
      },
    },
  );
}

// ============================================================================
// 3. 数据获取与降级机制示例
// ============================================================================

/**
 * 示例：获取游戏数据，使用降级机制
 */
export async function getGamesWithFallback(userId?: string) {
  try {
    // 首先尝试从主数据源获取
    const primaryData = await fetchGamesFromPrimarySource(userId);
    return primaryData;
  } catch (error) {
    console.warn("Primary data source failed, using fallback:", error);

    // 使用降级数据管理器
    try {
      const fallbackData = await fallbackDataManager.getGames(userId);
      return fallbackData;
    } catch (fallbackError) {
      // 如果降级数据也失败，创建一个最终的错误
      const finalError = createError({
        code: "GAMES_FETCH_FAILED",
        message: "Failed to fetch games from all sources",
        category: ErrorCategory.SYSTEM_ERROR,
        severity: ErrorSeverity.HIGH,
        context: {
          primaryError:
            error instanceof Error ? error.message : "Unknown primary error",
          fallbackError:
            fallbackError instanceof Error
              ? fallbackError.message
              : "Unknown fallback error",
          userId,
        },
      });

      throw finalError;
    }
  }
}

/**
 * 模拟从主数据源获取游戏数据
 */
async function fetchGamesFromPrimarySource(userId?: string) {
  // 这里应该是实际的数据库查询或API调用
  // 为了演示，我们模拟一个可能失败的操作
  const shouldFail = Math.random() > 0.7; // 30% 失败率

  if (shouldFail) {
    throw ErrorFactory.databaseConnectionError("Primary database unavailable");
  }

  // 模拟成功返回数据
  return [
    {
      id: "game1",
      name: { en: "Sample Game 1", zh: "示例游戏1" },
      description: { en: "A sample game", zh: "一个示例游戏" },
      status: "active",
    },
  ];
}

// ============================================================================
// 4. 用户操作错误处理示例
// ============================================================================

/**
 * 示例：处理用户登录
 */
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 根据错误类型创建相应的错误
      if (response.status === 401) {
        throw ErrorFactory.authenticationError("Invalid email or password", {
          email,
          timestamp: new Date().toISOString(),
        });
      } else if (response.status === 423) {
        throw ErrorFactory.authenticationError(
          "Account temporarily locked due to too many failed attempts",
          { email, lockedUntil: data.lockedUntil },
        );
      } else if (response.status === 403) {
        throw ErrorFactory.authorizationError("Account not approved", {
          email,
          reason: data.reason,
        });
      } else {
        throw ErrorFactory.systemError(
          `Login failed: ${data.message || "Unknown error"}`,
          new Error(`Login failed for ${email}: ${response.status}`),
        );
      }
    }

    return data;
  } catch (error) {
    // 处理网络错误等
    if (error instanceof Error && error.message.includes("fetch")) {
      throw ErrorFactory.networkConnectionError({
        message: "Unable to connect to authentication service",
        email,
        originalError: error.message,
      });
    }

    // 重新抛出其他错误
    throw error;
  }
}

// ============================================================================
// 5. 批量操作错误处理示例
// ============================================================================

/**
 * 示例：批量处理订单，部分失败不影响整体操作
 */
export async function processBatchOrders(orderIds: string[]) {
  const results = {
    successful: [],
    failed: [],
    total: orderIds.length,
  };

  // 并行处理所有订单
  const promises = orderIds.map(async (orderId) => {
    try {
      const result = await RetryHandler.executeWithRetry(
        () => processSingleOrder(orderId),
        {
          maxRetries: 2,
          baseDelayMs: 500,
        },
      );

      (results.successful as any[]).push({ orderId, result });
      return { orderId, success: true, result };
    } catch (error) {
      const enhancedError = handleError(error as Error, {
        operation: "processBatchOrders",
        orderId,
        batchId: "batch_" + Date.now(),
      });

      (results.failed as any[]).push({
        orderId,
        error:
          enhancedError.message ||
          enhancedError.getUserMessage?.("en") ||
          "Unknown error",
        errorCode: enhancedError.code,
      });

      return { orderId, success: false, error: enhancedError };
    }
  });

  await Promise.allSettled(promises);

  return results;
}

/**
 * 处理单个订单
 */
async function processSingleOrder(orderId: string) {
  // 模拟订单处理逻辑
  const response = await fetch(`/api/orders/${orderId}/process`, {
    method: "POST",
  });

  if (!response.ok) {
    throw ErrorFactory.systemError(
      `Order processing failed: ${response.statusText}`,
      new Error(`HTTP ${response.status}: ${response.statusText}`),
    );
  }

  return await response.json();
}

// ============================================================================
// 6. 错误监控和报告示例
// ============================================================================

/**
 * 示例：错误监控服务
 */
export class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private errorQueue: EnhancedError[] = [];

  static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  // 添加错误到监控队列
  addError(error: EnhancedError, context?: any) {
    const monitoredError = handleError(error, {
      ...context,
      monitored: true,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      url: typeof window !== "undefined" ? window.location.href : "Server-side",
    });

    this.errorQueue.push(monitoredError);

    // 在生产环境中，可以发送到监控服务
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(monitoredError);
    }
  }

  // 获取错误统计
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: this.errorQueue.slice(-10),
    };

    this.errorQueue.forEach((error) => {
      stats.byCategory[error.category] =
        (stats.byCategory[error.category] || 0) + 1;
      stats.bySeverity[error.severity] =
        (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  // 发送到监控服务（模拟）
  private async sendToMonitoringService(error: EnhancedError) {
    try {
      // 这里可以集成 Sentry, LogRocket 等监控服务
      console.log("Sending error to monitoring service:", error.toJSON());

      // 模拟API调用
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(error.toJSON()),
      });
    } catch (sendError) {
      console.error("Failed to send error to monitoring service:", sendError);
    }
  }

  // 清理错误队列
  clearErrors() {
    this.errorQueue = [];
  }
}

// ============================================================================
// 7. 使用示例和最佳实践
// ============================================================================

/**
 * 示例：展示如何在React组件中使用错误处理
 */
export const useErrorHandlingExample = () => {
  const monitoringService = ErrorMonitoringService.getInstance();

  const handleUserAction = async (action: string, data: any) => {
    try {
      switch (action) {
        case "login":
          return await loginUser(data.email, data.password);
        case "fetchGames":
          return await getGamesWithFallback(data.userId);
        case "processPayment":
          return await processPayment(data.paymentData);
        default:
          throw createError({
            code: "UNKNOWN_ACTION",
            message: `Unknown action: ${action}`,
            category: ErrorCategory.BUSINESS_LOGIC,
            severity: ErrorSeverity.LOW,
          });
      }
    } catch (error) {
      // 监控错误
      if (error instanceof EnhancedError) {
        monitoringService.addError(error, { action, data });
      }

      // 重新抛出错误让组件处理
      throw error;
    }
  };

  return {
    handleUserAction,
    getErrorStats: () => monitoringService.getErrorStats(),
  };
};

// 导出监控服务实例
export const errorMonitoring = ErrorMonitoringService.getInstance();
