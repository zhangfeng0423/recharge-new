/**
 * Webhook Security Tests
 *
 * 专门测试 Stripe Webhook 处理程序的安全性
 * 包括签名验证、幂等性、防重放攻击等
 */

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { POST } from "../src/app/api/webhooks/stripe/route";

// Mock dependencies
vi.mock("../src/lib/supabaseServer", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      constructor() {
        // Mock constructor
      }
      get webhooks() {
        return {
          constructEvent: vi.fn(),
        };
      }
    },
  };
});

// Mock headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("Webhook Security Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Set required environment variables
    process.env.STRIPE_SECRET_KEY = "sk_test_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  describe("Signature Verification", () => {
    test("should reject requests without Stripe signature", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", ""],
        ]),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain("Missing Stripe signature");
    });

    test("should reject requests with invalid signatures", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "invalid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockImplementation(() => {
                throw new Error("Invalid signature");
              }),
            },
          }) as any,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain("Invalid signature");
    });

    test("should accept requests with valid signatures", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "order_123",
                    payment_status: "paid",
                    amount_total: 1099,
                    currency: "usd",
                  },
                },
              }),
            },
          }) as any,
      );

      // Mock successful order fetch and update
      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: {
            id: "order_123",
            status: "pending",
            amount: 1099,
            currency: "usd",
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Idempotency Protection", () => {
    test("should handle duplicate events gracefully", async () => {
      // Mock valid signature and event
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_duplicate_event", // Same event ID
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "order_123",
                    payment_status: "paid",
                    amount_total: 1099,
                    currency: "usd",
                  },
                },
              }),
            },
          }) as any,
      );

      // Mock order that's already completed
      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order_123",
            status: "completed", // Already completed
            amount: 1099,
            currency: "usd",
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Should not attempt to update already completed order
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    test("should prevent duplicate order completion", async () => {
      // This tests the idempotency check in the webhook handler
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "order_123",
                    payment_status: "paid",
                    amount_total: 1099,
                    currency: "usd",
                  },
                },
              }),
            },
          }) as any,
      );

      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order_123",
            status: "completed", // Already completed
            amount: 1099,
            currency: "usd",
          },
          error: null,
        }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Should return early without attempting to update
    });
  });

  describe("Data Validation & Integrity", () => {
    test("should verify order exists before processing", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "nonexistent_order",
                    payment_status: "paid",
                    amount_total: 1099,
                    currency: "usd",
                  },
                },
              }),
            },
          }) as any,
      );

      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // Order not found
          error: { message: "No rows returned" },
        }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toContain("not found");
    });

    test("should verify amounts match between order and session", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "order_123",
                    payment_status: "paid",
                    amount_total: 2199, // Different from order amount
                    currency: "usd",
                  },
                },
              }),
            },
          }) as any,
      );

      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order_123",
            status: "pending",
            amount: 1099, // Different amount
            currency: "usd",
          },
          error: null,
        }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toContain("Amount mismatch");
    });

    test("should verify currencies match", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "order_123",
                    payment_status: "paid",
                    amount_total: 1099,
                    currency: "eur", // Different currency
                  },
                },
              }),
            },
          }) as any,
      );

      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order_123",
            status: "pending",
            amount: 1099,
            currency: "usd", // Different currency
          },
          error: null,
        }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toContain("Currency mismatch");
    });
  });

  describe("Event Type Handling", () => {
    test("should ignore unsupported event types", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "unsupported.event.type", // Not in supported list
                data: {
                  object: {
                    id: "test_id",
                  },
                },
              }),
            },
          }) as any,
      );

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.received).toBe(true);
      expect(json.message).toContain("not supported");
    });

    test("should handle session.expired events", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.expired",
                data: {
                  object: {
                    id: "cs_expired",
                    client_reference_id: "order_123",
                  },
                },
              }),
            },
          }) as any,
      );

      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: "failed",
        updated_at: expect.any(String),
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValue(
        new Map([
          ["content-type", "application/json"],
          ["stripe-signature", "valid_signature"],
        ]),
      );

      const { default: Stripe } = await import("stripe");
      const mockStripe = vi.mocked(Stripe);
      mockStripe.mockImplementation(
        () =>
          ({
            webhooks: {
              constructEvent: vi.fn().mockReturnValue({
                id: "evt_test123",
                type: "checkout.session.completed",
                data: {
                  object: {
                    id: "cs_test123",
                    client_reference_id: "order_123",
                    payment_status: "paid",
                    amount_total: 1099,
                    currency: "usd",
                  },
                },
              }),
            },
          }) as any,
      );

      const { createSupabaseAdminClient } = await import(
        "../src/lib/supabaseServer"
      );
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order_123",
            status: "pending",
            amount: 1099,
            currency: "usd",
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: "Database connection failed" },
        }),
      };

      vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as any);

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({ test: "data" }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toContain("processing failed");
    });
  });
});
