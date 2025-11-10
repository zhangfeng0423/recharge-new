"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Order action error:", error);
    return {
      message: "An unexpected error occurred",
    };
  },
});

const getOrderByIdSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

const getOrderBySessionIdSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

// Get order by ID
export const getOrderById = actionClient
  .schema(getOrderByIdSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase = createSupabaseServerClient();

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", parsedInput.orderId)
        .single();

      if (error) {
        console.error("Get order by ID error:", error);
        return { success: false, message: "Order not found" };
      }

      return {
        success: true,
        message: "Order fetched successfully",
        data,
      };
    } catch (error) {
      console.error("Unexpected get order error:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  });

// Get order by session ID (for payment success page)
export const getOrderBySessionId = actionClient
  .schema(getOrderBySessionIdSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase = createSupabaseServerClient();

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_session_id", parsedInput.sessionId)
        .single();

      if (error) {
        console.error("Get order by session ID error:", error);
        return { success: false, message: "Order not found" };
      }

      return {
        success: true,
        message: "Order fetched successfully",
        data,
      };
    } catch (error) {
      console.error("Unexpected get order error:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  });

// Simple function for non-action contexts (like server components)
export async function getOrderByIdServer(orderId: string) {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Get order by ID error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected get order error:", error);
    return null;
  }
}

// Simple function for getting order by session ID
export async function getOrderBySessionIdServer(sessionId: string) {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (error) {
      console.error("Get order by session ID error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected get order error:", error);
    return null;
  }
}