/**
 * Test Setup
 *
 * 配置测试环境，设置必要的环境变量和全局mock
 */

import { vi } from "vitest";

// 设置测试环境变量
process.env.STRIPE_SECRET_KEY = "sk_test_test_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_webhook_secret";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_role_key";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // 在测试中静默某些日志，但保留错误和警告
  log: vi.fn(),
  info: vi.fn(),
  warn: console.warn,
  error: console.error,
};
