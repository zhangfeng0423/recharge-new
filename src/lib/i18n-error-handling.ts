/**
 * 国际化错误处理框架
 * 提供基于 next-intl 的错误消息国际化支持
 */

import { getTranslations } from "next-intl/server";

// 错误严重程度枚举
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// 错误类别枚举
export enum ErrorCategory {
  // 认证和授权错误
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  SESSION_EXPIRED = "session_expired",

  // 数据库错误
  DATABASE_CONNECTION = "database_connection",
  DATABASE_QUERY = "database_query",
  DATABASE_CONSTRAINT = "database_constraint",
  DATABASE_TIMEOUT = "database_timeout",

  // 网络错误
  NETWORK_TIMEOUT = "network_timeout",
  NETWORK_CONNECTION = "network_connection",
  API_RATE_LIMIT = "api_rate_limit",

  // 支付错误
  PAYMENT_DECLINED = "payment_declined",
  PAYMENT_PROCESSING = "payment_processing",
  PAYMENT_TIMEOUT = "payment_timeout",

  // 业务逻辑错误
  VALIDATION = "validation",
  BUSINESS_LOGIC = "business_logic",
  RESOURCE_NOT_FOUND = "resource_not_found",

  // 系统错误
  SYSTEM_ERROR = "system_error",
  CONFIGURATION_ERROR = "configuration_error",
  EXTERNAL_SERVICE = "external_service",

  // 通用错误
  UNKNOWN = "unknown",
}

// 基础错误接口
export interface BaseError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, any>;
  cause?: Error;
  retryable: boolean;
  userMessageKey?: string; // 添加用户消息键，用于国际化
}

// 增强的错误类
export class I18nEnhancedError extends Error implements BaseError {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;
  public readonly cause?: Error;
  public readonly retryable: boolean;
  public readonly userMessageKey?: string;

  constructor(config: {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    context?: Record<string, any>;
    cause?: Error;
    retryable?: boolean;
    userMessageKey?: string;
  }) {
    super(config.message);
    this.name = "I18nEnhancedError";
    this.code = config.code;
    this.category = config.category;
    this.severity = config.severity;
    this.timestamp = new Date();
    this.context = config.context;
    this.cause = config.cause;
    this.retryable = config.retryable ?? false;
    this.userMessageKey = config.userMessageKey;

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, I18nEnhancedError);
    }
  }

  // 转换为JSON格式
  toJSON(): Omit<BaseError, "cause"> & { cause?: string } {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      context: this.context,
      cause: this.cause?.message,
      retryable: this.retryable,
      userMessageKey: this.userMessageKey,
    };
  }

  // 获取用户友好的错误消息（支持国际化）
  async getUserMessage(locale: string = "en"): Promise<string> {
    if (this.userMessageKey) {
      try {
        const t = await getTranslations({ locale, namespace: "errors" });
        const categoryMessages = t(this.category);

        // 尝试获取特定的错误消息
        if (
          typeof categoryMessages === "object" &&
          categoryMessages[this.code]
        ) {
          return categoryMessages[this.code];
        }

        // 回退到类别级别的默认消息
        if (typeof categoryMessages === "string") {
          return categoryMessages;
        }

        // 如果有嵌套结构，尝试获取默认消息
        if (
          categoryMessages &&
          typeof categoryMessages === "object" &&
          "default" in categoryMessages
        ) {
          return (categoryMessages as any).default;
        }
      } catch (error) {
        console.warn(
          `Failed to get localized message for key: ${this.userMessageKey}`,
          error,
        );
      }
    }

    // 回退到默认消息
    return this.getDefaultUserMessage(locale);
  }

  private async getDefaultUserMessage(locale: string): Promise<string> {
    try {
      const t = await getTranslations({ locale, namespace: "errors" });

      // 根据错误类别获取默认消息
      const errorTypeMap = {
        [ErrorCategory.AUTHENTICATION]: "authentication.invalidCredentials",
        [ErrorCategory.AUTHORIZATION]: "authorization.accessDenied",
        [ErrorCategory.SESSION_EXPIRED]: "authentication.sessionExpired",
        [ErrorCategory.DATABASE_CONNECTION]: "database.connectionFailed",
        [ErrorCategory.DATABASE_QUERY]: "database.queryFailed",
        [ErrorCategory.DATABASE_CONSTRAINT]: "database.constraintViolation",
        [ErrorCategory.DATABASE_TIMEOUT]: "database.timeout",
        [ErrorCategory.NETWORK_TIMEOUT]: "network.timeout",
        [ErrorCategory.NETWORK_CONNECTION]: "network.connectionFailed",
        [ErrorCategory.API_RATE_LIMIT]: "network.rateLimit",
        [ErrorCategory.PAYMENT_DECLINED]: "payment.declined",
        [ErrorCategory.PAYMENT_PROCESSING]: "payment.processingError",
        [ErrorCategory.PAYMENT_TIMEOUT]: "payment.timeout",
        [ErrorCategory.VALIDATION]: "validation.invalidInput",
        [ErrorCategory.BUSINESS_LOGIC]: "business.operationNotAllowed",
        [ErrorCategory.RESOURCE_NOT_FOUND]: "business.resourceNotFound",
        [ErrorCategory.SYSTEM_ERROR]: "system.internalError",
        [ErrorCategory.CONFIGURATION_ERROR]: "system.configurationError",
        [ErrorCategory.EXTERNAL_SERVICE]: "system.externalServiceUnavailable",
        [ErrorCategory.UNKNOWN]: "generic.unexpectedError",
      };

      const messageKey =
        errorTypeMap[this.category] || "generic.unexpectedError";
      return t(messageKey);
    } catch (error) {
      // 如果国际化失败，返回硬编码的英文消息
      const fallbackMessages = {
        [ErrorCategory.AUTHENTICATION]:
          "Authentication failed. Please try again.",
        [ErrorCategory.AUTHORIZATION]:
          "You do not have permission to perform this action.",
        [ErrorCategory.SESSION_EXPIRED]:
          "Your session has expired. Please log in again.",
        [ErrorCategory.DATABASE_CONNECTION]:
          "Service temporarily unavailable. Please try again.",
        [ErrorCategory.DATABASE_QUERY]:
          "Data processing error. Please try again.",
        [ErrorCategory.DATABASE_CONSTRAINT]:
          "Data constraint violation. Please check your input.",
        [ErrorCategory.DATABASE_TIMEOUT]:
          "Database operation timed out. Please try again.",
        [ErrorCategory.NETWORK_TIMEOUT]:
          "Request timed out. Please check your connection and try again.",
        [ErrorCategory.NETWORK_CONNECTION]:
          "Network connection error. Please check your internet connection.",
        [ErrorCategory.API_RATE_LIMIT]:
          "Too many requests. Please wait and try again.",
        [ErrorCategory.PAYMENT_DECLINED]:
          "Payment was declined. Please try a different payment method.",
        [ErrorCategory.PAYMENT_PROCESSING]:
          "Payment processing error. Please try again.",
        [ErrorCategory.PAYMENT_TIMEOUT]: "Payment timed out. Please try again.",
        [ErrorCategory.VALIDATION]:
          "Invalid input. Please check your data and try again.",
        [ErrorCategory.BUSINESS_LOGIC]:
          "Operation not allowed. Please contact support.",
        [ErrorCategory.RESOURCE_NOT_FOUND]: "Requested resource not found.",
        [ErrorCategory.SYSTEM_ERROR]:
          "System error occurred. Please try again later.",
        [ErrorCategory.CONFIGURATION_ERROR]:
          "Service configuration error. Please contact support.",
        [ErrorCategory.EXTERNAL_SERVICE]:
          "External service unavailable. Please try again later.",
        [ErrorCategory.UNKNOWN]:
          "An unexpected error occurred. Please try again.",
      };

      return (
        fallbackMessages[this.category] ||
        fallbackMessages[ErrorCategory.UNKNOWN]
      );
    }
  }
}

// 国际化错误工厂函数
export class I18nErrorFactory {
  // 认证错误
  static authenticationError(
    message: string,
    context?: Record<string, any>,
    userMessageKey?: string,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "AUTH_001",
      message,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context,
      retryable: false,
      userMessageKey: userMessageKey || "authentication.invalidCredentials",
    });
  }

  static authorizationError(
    message: string,
    context?: Record<string, any>,
    userMessageKey?: string,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "AUTH_002",
      message,
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.HIGH,
      context,
      retryable: false,
      userMessageKey: userMessageKey || "authorization.accessDenied",
    });
  }

  static sessionExpiredError(context?: Record<string, any>): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "AUTH_003",
      message: "Session has expired",
      category: ErrorCategory.SESSION_EXPIRED,
      severity: ErrorSeverity.MEDIUM,
      context,
      retryable: false,
      userMessageKey: "authentication.sessionExpired",
    });
  }

  // 数据库错误
  static databaseConnectionError(
    message: string,
    cause?: Error,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "DB_001",
      message: `Database connection failed: ${message}`,
      category: ErrorCategory.DATABASE_CONNECTION,
      severity: ErrorSeverity.HIGH,
      cause,
      retryable: true,
      userMessageKey: "database.connectionFailed",
    });
  }

  static databaseQueryError(
    message: string,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "DB_002",
      message: `Database query error: ${message}`,
      category: ErrorCategory.DATABASE_QUERY,
      severity: ErrorSeverity.MEDIUM,
      context,
      retryable: true,
      userMessageKey: "database.queryFailed",
    });
  }

  static databaseTimeoutError(
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "DB_003",
      message: "Database operation timed out",
      category: ErrorCategory.DATABASE_TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      context,
      retryable: true,
      userMessageKey: "database.timeout",
    });
  }

  // 网络错误
  static networkTimeoutError(context?: Record<string, any>): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "NET_001",
      message: "Network request timed out",
      category: ErrorCategory.NETWORK_TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      context,
      retryable: true,
      userMessageKey: "network.timeout",
    });
  }

  static networkConnectionError(
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "NET_002",
      message: "Network connection failed",
      category: ErrorCategory.NETWORK_CONNECTION,
      severity: ErrorSeverity.MEDIUM,
      context,
      retryable: true,
      userMessageKey: "network.connectionFailed",
    });
  }

  static apiRateLimitError(context?: Record<string, any>): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "NET_003",
      message: "API rate limit exceeded",
      category: ErrorCategory.API_RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      context,
      retryable: true,
      userMessageKey: "network.rateLimit",
    });
  }

  // 支付错误
  static paymentDeclinedError(
    message: string,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "PAY_001",
      message: `Payment declined: ${message}`,
      category: ErrorCategory.PAYMENT_DECLINED,
      severity: ErrorSeverity.HIGH,
      context,
      retryable: false,
      userMessageKey: "payment.declined",
    });
  }

  static paymentProcessingError(
    message: string,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "PAY_002",
      message: `Payment processing error: ${message}`,
      category: ErrorCategory.PAYMENT_PROCESSING,
      severity: ErrorSeverity.HIGH,
      context,
      retryable: true,
      userMessageKey: "payment.processingError",
    });
  }

  // 业务逻辑错误
  static validationError(
    message: string,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "BIZ_001",
      message: `Validation error: ${message}`,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      context,
      retryable: false,
      userMessageKey: "validation.invalidInput",
    });
  }

  static resourceNotFoundError(
    resource: string,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "BIZ_002",
      message: `Resource not found: ${resource}`,
      category: ErrorCategory.RESOURCE_NOT_FOUND,
      severity: ErrorSeverity.LOW,
      context,
      retryable: false,
      userMessageKey: "business.resourceNotFound",
    });
  }

  // 系统错误
  static systemError(message: string, cause?: Error): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "SYS_001",
      message: `System error: ${message}`,
      category: ErrorCategory.SYSTEM_ERROR,
      severity: ErrorSeverity.CRITICAL,
      cause,
      retryable: true,
      userMessageKey: "system.internalError",
    });
  }

  static configurationError(
    message: string,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "SYS_002",
      message: `Configuration error: ${message}`,
      category: ErrorCategory.CONFIGURATION_ERROR,
      severity: ErrorSeverity.CRITICAL,
      context,
      retryable: false,
      userMessageKey: "system.configurationError",
    });
  }

  // 通用错误
  static unknownError(message: string, cause?: Error): I18nEnhancedError {
    return new I18nEnhancedError({
      code: "UNK_001",
      message: `Unknown error: ${message}`,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      cause,
      retryable: true,
      userMessageKey: "generic.unexpectedError",
    });
  }

  // 从现有错误创建增强错误
  static fromError(
    error: Error,
    category?: ErrorCategory,
    context?: Record<string, any>,
  ): I18nEnhancedError {
    if (error instanceof I18nEnhancedError) {
      return error;
    }

    // 根据错误消息推断错误类别
    const inferredCategory =
      category || I18nErrorFactory.inferErrorCategory(error.message);

    return new I18nEnhancedError({
      code: "WRAPPED_001",
      message: error.message,
      category: inferredCategory,
      severity: ErrorSeverity.MEDIUM,
      context,
      cause: error,
      retryable: I18nErrorFactory.isRetryableError(inferredCategory),
    });
  }

  private static inferErrorCategory(message: string): ErrorCategory {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("database") ||
      lowerMessage.includes("connection")
    ) {
      return ErrorCategory.DATABASE_CONNECTION;
    }
    if (lowerMessage.includes("timeout")) {
      return ErrorCategory.NETWORK_TIMEOUT;
    }
    if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
      return ErrorCategory.NETWORK_CONNECTION;
    }
    if (
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("forbidden")
    ) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (lowerMessage.includes("payment") || lowerMessage.includes("stripe")) {
      return ErrorCategory.PAYMENT_PROCESSING;
    }
    if (
      lowerMessage.includes("validation") ||
      lowerMessage.includes("invalid")
    ) {
      return ErrorCategory.VALIDATION;
    }

    return ErrorCategory.UNKNOWN;
  }

  private static isRetryableError(category: ErrorCategory): boolean {
    const retryableCategories = [
      ErrorCategory.DATABASE_CONNECTION,
      ErrorCategory.DATABASE_QUERY,
      ErrorCategory.DATABASE_TIMEOUT,
      ErrorCategory.NETWORK_TIMEOUT,
      ErrorCategory.NETWORK_CONNECTION,
      ErrorCategory.API_RATE_LIMIT,
      ErrorCategory.PAYMENT_PROCESSING,
      ErrorCategory.SYSTEM_ERROR,
      ErrorCategory.EXTERNAL_SERVICE,
    ];

    return retryableCategories.includes(category);
  }
}

// 国际化错误处理器类
export class I18nErrorHandler {
  private static instance: I18nErrorHandler;
  private errorCallbacks: Map<
    ErrorCategory,
    Array<(error: I18nEnhancedError) => void>
  > = new Map();

  private constructor() {}

  static getInstance(): I18nErrorHandler {
    if (!I18nErrorHandler.instance) {
      I18nErrorHandler.instance = new I18nErrorHandler();
    }
    return I18nErrorHandler.instance;
  }

  // 注册错误回调
  onError(
    category: ErrorCategory,
    callback: (error: I18nEnhancedError) => void,
  ): void {
    if (!this.errorCallbacks.has(category)) {
      this.errorCallbacks.set(category, []);
    }
    this.errorCallbacks.get(category)!.push(callback);
  }

  // 处理错误
  async handle(
    error: Error | I18nEnhancedError,
    context?: Record<string, any>,
  ): Promise<I18nEnhancedError> {
    const enhancedError =
      error instanceof I18nEnhancedError
        ? error
        : I18nErrorFactory.fromError(error, undefined, context);

    // 记录错误
    this.logError(enhancedError);

    // 触发回调
    const callbacks = this.errorCallbacks.get(enhancedError.category) || [];
    callbacks.forEach((callback) => {
      try {
        callback(enhancedError);
      } catch (callbackError) {
        console.error("Error in error callback:", callbackError);
      }
    });

    return enhancedError;
  }

  // 记录错误
  private logError(error: I18nEnhancedError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.code}] ${error.message}`;

    const logData = {
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack,
    };

    switch (logLevel) {
      case "error":
        console.error(logMessage, logData);
        break;
      case "warn":
        console.warn(logMessage, logData);
        break;
      case "info":
        console.info(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
  }

  private getLogLevel(
    severity: ErrorSeverity,
  ): "error" | "warn" | "info" | "log" {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return "error";
      case ErrorSeverity.MEDIUM:
        return "warn";
      case ErrorSeverity.LOW:
        return "info";
      default:
        return "log";
    }
  }
}

// 重试机制
export class I18nRetryHandler {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelayMs?: number;
      maxDelayMs?: number;
      backoffMultiplier?: number;
      retryCondition?: (error: Error) => boolean;
    } = {},
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelayMs = 1000,
      maxDelayMs = 10000,
      backoffMultiplier = 2,
      retryCondition = (error) => {
        const enhancedError =
          error instanceof I18nEnhancedError
            ? error
            : I18nErrorFactory.fromError(error);
        return enhancedError.retryable;
      },
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // 如果是最后一次尝试，或者错误不可重试，直接抛出
        if (attempt === maxRetries || !retryCondition(lastError)) {
          throw await I18nErrorHandler.getInstance().handle(lastError);
        }

        // 计算延迟时间
        const delayMs = Math.min(
          baseDelayMs * backoffMultiplier ** attempt,
          maxDelayMs,
        );

        console.warn(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms`,
          {
            error: lastError.message,
            attempt: attempt + 1,
          },
        );

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw await I18nErrorHandler.getInstance().handle(lastError!);
  }
}

// 全局错误处理器实例
export const i18nGlobalErrorHandler = I18nErrorHandler.getInstance();

// 便捷的错误处理函数
export const handleI18nError = async (
  error: Error | I18nEnhancedError,
  context?: Record<string, any>,
): Promise<I18nEnhancedError> => {
  return await i18nGlobalErrorHandler.handle(error, context);
};

export const createI18nError = (config: {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  cause?: Error;
  retryable?: boolean;
  userMessageKey?: string;
}): I18nEnhancedError => {
  return new I18nEnhancedError(config);
};
