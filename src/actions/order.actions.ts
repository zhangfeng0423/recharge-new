"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSafeActionClient } from "next-safe-action";
import Stripe from "stripe";
import { z } from "zod";
import type { Database, Order } from "@/lib/supabase-types";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getCurrentUser } from "./auth.actions";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

// Create the action client
const actionClient = createSafeActionClient({
  handleServerError: (e: unknown) => {
    console.error("Order Action Error:", e);
    return {
      serverError: "An unexpected error occurred.",
    };
  },
});

// Validation schemas
const getOrderByIdSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
});

const getOrderBySessionIdSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

// Types
export interface OrderDetails {
  id: string;
  user_id: string;
  sku_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  stripe_checkout_session_id?: string | null;
  created_at: string;
  updated_at: string;
  sku?: {
    id: string;
    name: { en: string; zh: string };
    description?: { en: string; zh: string } | null;
    image_url?: string | null;
    game?: {
      id: string;
      name: { en: string; zh: string };
    } | null;
  } | null;
  merchant?: {
    merchant_name?: string | null;
  } | null;
}

// Get order by ID (for order details page)
export const getOrderById = actionClient
  .schema(getOrderByIdSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase: SupabaseClient<Database> = createSupabaseServerClient();
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get order with related data
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          *,
          skus (
            id,
            name,
            description,
            image_url,
            games (
              id,
              name
            )
          ),
          profiles!merchant_id (
            merchant_name
          )
        `)
        .eq("id", parsedInput.orderId)
        .eq("user_id", user.id) // Ensure user can only access their own orders
        .single();

      if (error || !order) {
        console.error("Order fetch error:", error);
        throw new Error("Order not found or access denied");
      }

      return {
        success: true,
        order: order as OrderDetails,
      };
    } catch (error) {
      console.error("Get order by ID error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch order",
      };
    }
  });

// Get order by Stripe session ID (for payment success/cancel pages)
export const getOrderBySessionId = actionClient
  .schema(getOrderBySessionIdSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase: SupabaseClient<Database> = createSupabaseServerClient();
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // First get the Stripe session to verify
      try {
        const session = await stripe.checkout.sessions.retrieve(
          parsedInput.sessionId,
        );

        if (!session) {
          throw new Error("Invalid session ID");
        }

        // Verify the session belongs to the current user
        if (session.metadata?.userId !== user.id) {
          throw new Error("Session access denied");
        }

        // Get order by session ID
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_checkout_session_id", session.id)
          .eq("user_id", user.id)
          .single();

        const order = data as Order | null; // Explicitly assert type

        if (error || !order) {
          console.error("Order fetch error:", error);
          throw new Error("Order not found");
        }

        // Sync order status with Stripe if needed
        if (
          session.payment_status === "paid" &&
          (order as any).status === "pending"
        ) {
          const { error: updateError } = await (supabase.from("orders") as any)
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", (order as any).id);

          if (updateError) {
            console.error("Failed to update order status:", updateError);
            // Don't fail the request, just log the error
          } else {
            order.status = "completed";
          }
        }

        return {
          success: true,
          order: order as OrderDetails,
          stripeSession: session,
        };
      } catch (stripeError) {
        console.error("Stripe session fetch error:", stripeError);
        throw new Error("Failed to verify payment session");
      }
    } catch (error) {
      console.error("Get order by session ID error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch order",
      };
    }
  });

// Get user's recent orders
export interface RecentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  sku: {
    name: { en: string; zh: string };
    image_url?: string | null;
    game: {
      name: { en: string; zh: string };
    };
  };
}

export const getUserRecentOrders = actionClient.action(async () => {
  try {
    const supabase: SupabaseClient<Database> = createSupabaseServerClient();
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
          id,
          amount,
          currency,
          status,
          created_at,
          skus (
            name,
            image_url,
            games (
              name
            )
          )
        `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Recent orders fetch error:", error);
      throw new Error("Failed to fetch recent orders");
    }

    return {
      success: true,
      orders: orders as RecentOrder[],
    };
  } catch (error) {
    console.error("Get user recent orders error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
});
