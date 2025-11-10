/**
 * 错误处理框架测试文件
 * 验证错误处理框架的各个组件和功能
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createError,
  EnhancedError,
  ErrorBoundaryUtils,
  ErrorCategory,
  ErrorFactory,
  ErrorHandler,
  ErrorSeverity,
  globalErrorHandler,
  handleError,
  RetryHandler,
} from "./error-handling";

// Mock console methods to avoid noise in tests
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

describe("EnhancedError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an enhanced error with all properties", () => {
    const error = new EnhancedError({
      code: "TEST_001",
      message: "Test error message",
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      context: { userId: "123" },
      retryable: true,
      userMessage: "User-friendly message",
    });

    expect(error.code).toBe("TEST_001");
    expect(error.message).toBe("Test error message");
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.context).toEqual({ userId: "123" });
    expect(error.retryable).toBe(true);
    expect(error.userMessage).toBe("User-friendly message");
    expect(error.name).toBe("EnhancedError");
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it("should return user-friendly messages in different locales", () => {
    const error = new EnhancedError({
      code: "TEST_001",
      message: "Authentication failed",
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
    });

    expect(error.getUserMessage("en")).toBe(
      "Authentication failed. Please log in again.",
    );
    expect(error.getUserMessage("zh")).toBe("身份验证失败。请重新登录。");
  });

  it("should serialize to JSON correctly", () => {
    const originalError = new Error("Original error");
    const error = new EnhancedError({
      code: "TEST_001",
      message: "Test error",
      category: ErrorCategory.SYSTEM_ERROR,
      severity: ErrorSeverity.CRITICAL,
      cause: originalError,
    });

    const json = error.toJSON();
    expect(json.code).toBe("TEST_001");
    expect(json.message).toBe("Test error");
    expect(json.category).toBe(ErrorCategory.SYSTEM_ERROR);
    expect(json.severity).toBe(ErrorSeverity.CRITICAL);
    expect(json.cause).toBe("Original error");
  });
});

describe("ErrorFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create authentication errors", () => {
    const error = ErrorFactory.authenticationError("Invalid credentials", {
      email: "test@example.com",
    });

    expect(error).toBeInstanceOf(EnhancedError);
    expect(error.code).toBe("AUTH_001");
    expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ email: "test@example.com" });
  });

  it("should create database connection errors", () => {
    const originalError = new Error("Connection failed");
    const error = ErrorFactory.databaseConnectionError(
      "DB down",
      originalError,
    );

    expect(error.code).toBe("DB_001");
    expect(error.category).toBe(ErrorCategory.DATABASE_CONNECTION);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.retryable).toBe(true);
    expect(error.cause).toBe(originalError);
  });

  it("should create network timeout errors", () => {
    const error = ErrorFactory.networkTimeoutError({
      url: "https://api.example.com",
    });

    expect(error.code).toBe("NET_001");
    expect(error.category).toBe(ErrorCategory.NETWORK_TIMEOUT);
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.retryable).toBe(true);
  });

  it("should create payment declined errors", () => {
    const error = ErrorFactory.paymentDeclinedError("Insufficient funds", {
      amount: 100,
    });

    expect(error.code).toBe("PAY_001");
    expect(error.category).toBe(ErrorCategory.PAYMENT_DECLINED);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.retryable).toBe(false);
  });

  it("should wrap existing errors into enhanced errors", () => {
    const originalError = new Error("Something went wrong");
    const enhancedError = ErrorFactory.fromError(
      originalError,
      ErrorCategory.UNKNOWN,
    );

    expect(enhancedError).toBeInstanceOf(EnhancedError);
    expect(enhancedError.message).toBe("Something went wrong");
    expect(enhancedError.category).toBe(ErrorCategory.UNKNOWN);
    expect(enhancedError.cause).toBe(originalError);
  });

  it("should infer error category from message", () => {
    const dbError = ErrorFactory.fromError(
      new Error("Database connection failed"),
    );
    expect(dbError.category).toBe(ErrorCategory.DATABASE_CONNECTION);

    const networkError = ErrorFactory.fromError(
      new Error("Network timeout occurred"),
    );
    expect(networkError.category).toBe(ErrorCategory.NETWORK_TIMEOUT);

    const authError = ErrorFactory.fromError(new Error("Unauthorized access"));
    expect(authError.category).toBe(ErrorCategory.AUTHORIZATION);
  });
});

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    errorHandler = ErrorHandler.getInstance();
  });

  it("should handle errors and log them appropriately", () => {
    const error = new Error("Test error");
    const context = { action: "test", userId: "123" };

    const result = errorHandler.handle(error, context);

    expect(result).toBeInstanceOf(EnhancedError);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("[WRAPPED_001] Test error"),
      expect.objectContaining({
        category: expect.any(String),
        severity: expect.any(String),
        timestamp: expect.any(Date),
        context: context,
      }),
    );
  });

  it("should register and trigger error callbacks", () => {
    const callback = vi.fn();
    errorHandler.onError(ErrorCategory.AUTHENTICATION, callback);

    const error = ErrorFactory.authenticationError("Test auth error");
    errorHandler.handle(error);

    expect(callback).toHaveBeenCalledWith(error);
  });

  it("should handle callback errors gracefully", () => {
    const faultyCallback = vi.fn(() => {
      throw new Error("Callback failed");
    });

    errorHandler.onError(ErrorCategory.AUTHENTICATION, faultyCallback);

    const error = ErrorFactory.authenticationError("Test auth error");

    expect(() => errorHandler.handle(error)).not.toThrow();
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error in error callback:",
      expect.any(Error),
    );
  });
});

describe("RetryHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute operation successfully on first try", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await RetryHandler.executeWithRetry(operation);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should retry retryable errors", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Temporary failure"))
      .mockResolvedValue("success");

    const result = await RetryHandler.executeWithRetry(operation, {
      maxRetries: 2,
      baseDelayMs: 10,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(2);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Retry attempt 1/2"),
      expect.any(Object),
    );
  });

  it("should not retry non-retryable errors", async () => {
    const nonRetryableError = ErrorFactory.validationError("Invalid input");
    const operation = vi.fn().mockRejectedValue(nonRetryableError);

    await expect(RetryHandler.executeWithRetry(operation)).rejects.toThrow(
      "Invalid input",
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should respect maximum retry limit", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue(new Error("Persistent failure"));

    await expect(
      RetryHandler.executeWithRetry(operation, { maxRetries: 2 }),
    ).rejects.toThrow("Persistent failure");

    expect(operation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("should use custom retry condition", async () => {
    const retryableError = new Error("Should retry");
    const nonRetryableError = new Error("Should not retry");

    const operation = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(nonRetryableError)
      .mockResolvedValue("success");

    await expect(
      RetryHandler.executeWithRetry(operation, {
        maxRetries: 2,
        retryCondition: (error) => error.message === "Should retry",
      }),
    ).rejects.toThrow("Should not retry");

    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe("ErrorBoundaryUtils", () => {
  it("should identify recoverable errors", () => {
    const recoverableError = ErrorFactory.networkTimeoutError();
    const nonRecoverableError = ErrorFactory.validationError("Invalid data");

    expect(ErrorBoundaryUtils.isRecoverableError(recoverableError)).toBe(true);
    expect(ErrorBoundaryUtils.isRecoverableError(nonRecoverableError)).toBe(
      false,
    );
  });

  it("should provide appropriate recovery strategies", () => {
    const sessionError = ErrorFactory.sessionExpiredError();
    const networkError = ErrorFactory.networkConnectionError();
    const authError = ErrorFactory.authenticationError("Invalid token");

    expect(ErrorBoundaryUtils.getRecoveryStrategy(sessionError)).toEqual({
      strategy: "redirect",
      config: { destination: "/auth" },
    });

    expect(ErrorBoundaryUtils.getRecoveryStrategy(networkError)).toEqual({
      strategy: "retry",
      config: { maxRetries: 3, delayMs: 2000 },
    });

    expect(ErrorBoundaryUtils.getRecoveryStrategy(authError)).toEqual({
      strategy: "refresh",
      config: { refreshToken: true },
    });
  });
});

describe("Global error handling functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle errors using global handler", () => {
    const error = new Error("Global test error");
    const context = { component: "TestComponent" };

    const result = handleError(error, context);

    expect(result).toBeInstanceOf(EnhancedError);
    expect(mockConsoleError).toHaveBeenCalled();
  });

  it("should create errors using createError function", () => {
    const error = createError({
      code: "CUSTOM_001",
      message: "Custom error",
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.LOW,
      context: { customField: "value" },
    });

    expect(error).toBeInstanceOf(EnhancedError);
    expect(error.code).toBe("CUSTOM_001");
    expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
    expect(error.context).toEqual({ customField: "value" });
  });
});

describe("Error handling integration", () => {
  it("should handle complex error scenarios", async () => {
    // Simulate a complex error scenario
    const databaseError = new Error("Connection pool exhausted");
    const enhancedError = ErrorFactory.databaseConnectionError(
      "Failed to connect to database",
      databaseError,
    );

    // Create error with context
    const errorWithContext = createError({
      code: "DB_001",
      message: "Failed to connect to database",
      category: ErrorCategory.DATABASE_CONNECTION,
      severity: ErrorSeverity.HIGH,
      context: {
        operation: "fetchUserData",
        userId: "user123",
        attemptCount: 3,
        originalError: databaseError.message,
      },
      cause: databaseError,
    });

    // Handle the error
    const handledError = handleError(errorWithContext, {
      component: "UserProfile",
      action: "loadUserData",
      timestamp: new Date().toISOString(),
    });

    expect(handledError).toBeInstanceOf(EnhancedError);
    expect(handledError.category).toBe(ErrorCategory.DATABASE_CONNECTION);
    expect(handledError.retryable).toBe(true);
    expect(mockConsoleError).toHaveBeenCalled();
  });

  it("should demonstrate retry mechanism with fallback", async () => {
    let attemptCount = 0;
    const failingOperation = vi.fn(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw ErrorFactory.networkTimeoutError();
      }
      return "success";
    });

    const result = await RetryHandler.executeWithRetry(failingOperation, {
      maxRetries: 3,
      baseDelayMs: 10,
    });

    expect(result).toBe("success");
    expect(attemptCount).toBe(3);
    expect(mockConsoleWarn).toHaveBeenCalledTimes(2); // 2 retry attempts
  });
});

// Cleanup after tests
afterEach(() => {
  vi.clearAllMocks();
});

// Restore console methods after all tests
afterEach(() => {
  mockConsoleError.mockClear();
  mockConsoleWarn.mockClear();
  mockConsoleLog.mockClear();
});
