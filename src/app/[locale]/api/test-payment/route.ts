import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    console.log("=== PAYMENT DEBUG API START ===");
    
    // Test database connection
    const supabase = createSupabaseServerClient();
    
    // Test basic database connectivity
    const { data: connectionTest, error: connectionError } = await supabase
      .from("skus")
      .select("count")
      .limit(1);

    console.log("Database Connection Test:", { connectionTest, connectionError });

    // Try to get a real SKU from the database
    const { data: sku, error: skuError } = await (supabase
      .from("skus" as any)
      .select(`
        *,
        games!inner (
          id,
          merchant_id,
          name
        )
      `)
      .limit(1) as any);

    console.log("SKU Query Result:", { sku, skuError });

    // Test Stripe configuration
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    console.log("Environment Variables Check:", {
      hasStripeKey: !!stripeSecretKey,
      stripeKeyPrefix: stripeSecretKey?.substring(0, 7) + "...",
      hasWebhookSecret: !!stripeWebhookSecret,
      webhookSecretPrefix: stripeWebhookSecret?.substring(0, 7) + "...",
      appUrl,
    });

    // Test Stripe initialization
    let stripeTest = "Not initialized";
    try {
      const Stripe = require("stripe");
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2024-06-20" as any,
      });
      stripeTest = "Successfully initialized";
    } catch (stripeError) {
      stripeTest = `Failed to initialize: ${stripeError instanceof Error ? stripeError.message : "Unknown error"}`;
    }

    const response = {
      success: true,
      message: "Payment debug completed",
      tests: {
        database: {
          connected: !connectionError,
          connectionError: connectionError?.message,
          skuFound: !skuError && sku && sku.length > 0,
          skuCount: sku?.length || 0,
        },
        environment: {
          hasStripeKey: !!stripeSecretKey,
          hasWebhookSecret: !!stripeWebhookSecret,
          hasAppUrl: !!appUrl,
        },
        stripe: {
          initialized: stripeTest,
        },
        sampleSku: sku?.[0] || null,
      },
    };

    console.log("Debug Response:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("=== PAYMENT DEBUG API ERROR ===");
    console.error("Error:", error);
    console.error("Error Message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error Stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("===============================");

    return NextResponse.json({
      success: false,
      error: "Payment debug failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
