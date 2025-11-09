#!/usr/bin/env tsx

/**
 * Generic Secure Payment Webhook Handler for Next.js
 *
 * A secure, extensible framework for handling webhooks from multiple payment providers.
 */

import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import crypto from "crypto";
import { Command } from "commander";

// --- Zod Schemas (as before) ---
const chargeSucceededEventSchema = z.object({
  id: z.string(),
  type: z.literal("charge.succeeded"),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount: z.number(),
      currency: z.string(),
      receipt_email: z.string().email().nullable(),
    }),
  }),
});
const subscriptionCreatedEventSchema = z.object({
  id: z.string(),
  type: z.literal("customer.subscription.created"),
  data: z.object({
    object: z.object({
      id: z.string(),
      customer: z.string(),
      status: z.string(),
    }),
  }),
});
const webhookEventSchema = z.union([
  chargeSucceededEventSchema,
  subscriptionCreatedEventSchema,
]);
type WebhookEvent = z.infer<typeof webhookEventSchema>;

// --- Provider Configuration ---
const providers = {
  stripe: {
    secret: process.env.STRIPE_WEBHOOK_SECRET || "stripe_secret",
    signatureHeader: "stripe-signature",
    verify: (secret: string, header: string, body: Buffer) => {
      const parts = header.split(",");
      const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
      const signature = parts.find((p) => p.startsWith("v1="))?.split("=")[1];
      if (!timestamp || !signature) return false;
      const signedPayload = `${timestamp}.${body.toString("utf8")}`;
      const expected = crypto
        .createHmac("sha256", secret)
        .update(signedPayload)
        .digest("hex");
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex"),
      );
    },
  },
  lemonsqueezy: {
    secret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "lemon_secret",
    signatureHeader: "x-signature",
    verify: (secret: string, header: string, body: Buffer) => {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
    },
  },
};

// --- Idempotency (as before) ---
const processedEventIds = new Set<string>();
async function isNewEvent(eventId: string): Promise<boolean> {
  if (processedEventIds.has(eventId)) {
    console.log(`Event ${eventId} already processed. Skipping.`);
    return false;
  }
  processedEventIds.add(eventId);
  return true;
}

// --- Dynamic Event Handlers ---
type EventHandler = (event: any) => Promise<void>;
const eventHandlers: Record<string, EventHandler> = {
  "charge.succeeded": async (
    event: z.infer<typeof chargeSucceededEventSchema>,
  ) => {
    console.log(
      `Processing charge.succeeded: Charge ${event.data.object.id} for ${event.data.object.amount} ${event.data.object.currency}`,
    );
  },
  "customer.subscription.created": async (
    event: z.infer<typeof subscriptionCreatedEventSchema>,
  ) => {
    console.log(
      `Processing customer.subscription.created: Subscription ${event.data.object.id} for customer ${event.data.object.customer}`,
    );
  },
};

// --- Generic Webhook Processor ---
class WebhookProcessor {
  constructor(private providerName: keyof typeof providers) {}

  async process(req: NextApiRequest, res: NextApiResponse) {
    const provider = providers[this.providerName];
    if (!provider) {
      return res.status(400).send("Unsupported payment provider.");
    }

    const signature = req.headers[provider.signatureHeader.toLowerCase()];
    if (!signature || typeof signature !== "string") {
      return res.status(400).send("Signature missing or invalid.");
    }

    const rawBody = await this.getRawBody(req);
    if (!provider.verify(provider.secret, signature, rawBody)) {
      return res.status(400).send("Signature verification failed.");
    }

    const event = this.parseEvent(rawBody);
    if (!event) {
      return res.status(400).send("Invalid event payload.");
    }

    if (!(await isNewEvent(event.id))) {
      return res.status(200).json({ message: "Event already processed." });
    }

    const handler = eventHandlers[event.type];
    if (handler) {
      await handler(event);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }

  private parseEvent(rawBody: Buffer): WebhookEvent | null {
    try {
      return webhookEventSchema.parse(JSON.parse(rawBody.toString("utf8")));
    } catch (error) {
      console.error("Payload validation failed:", error);
      return null;
    }
  }

  private async getRawBody(req: NextApiRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }
}

// --- Next.js API Route Handler ---
export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const provider = req.query.provider as string;
  if (provider in providers) {
    const processor = new WebhookProcessor(provider as keyof typeof providers);
    await processor.process(req, res);
  } else {
    res.status(400).send("Invalid or missing provider in query parameter.");
  }
}

// --- CLI for Testing ---
async function testWebhook(
  providerName: string,
  eventType: string,
  fixturePath: string,
) {
  const provider = providers[providerName as keyof typeof providers];
  if (!provider) {
    console.error(`Provider '${providerName}' not found.`);
    return;
  }

  const fixture = await fs.readFile(fixturePath, "utf-8");
  const body = Buffer.from(fixture);
  let signature: string;

  if (providerName === "stripe") {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${fixture}`;
    const hmac = crypto
      .createHmac("sha256", provider.secret)
      .update(signedPayload)
      .digest("hex");
    signature = `t=${timestamp},v1=${hmac}`;
  } else {
    signature = crypto
      .createHmac("sha256", provider.secret)
      .update(body)
      .digest("hex");
  }

  console.log(`Simulating '${eventType}' from '${providerName}'...`);
  console.log(`Signature: ${signature}`);

  const mockReq = {
    method: "POST",
    headers: { [provider.signatureHeader.toLowerCase()]: signature },
    query: { provider: providerName },
    [Symbol.asyncIterator]: async function* () {
      yield body;
    },
  } as unknown as NextApiRequest;

  const mockRes = {
    status: (code: number) => {
      console.log(`Response Status: ${code}`);
      return {
        send: (message: string) => console.log(`Response Body: ${message}`),
        json: (data: any) => console.log("Response JSON:", data),
        setHeader: () => {},
      };
    },
  } as NextApiResponse;

  await handler(mockReq, mockRes);
}

if (require.main === module) {
  const program = new Command();
  program
    .name("payment-processor")
    .description("A tool for processing and testing payment webhooks.");

  program
    .command("test-webhook")
    .description("Simulate a webhook event for local testing.")
    .argument("<provider>", "The payment provider (e.g., stripe, lemonsqueezy)")
    .argument(
      "<eventType>",
      "The type of event to simulate (e.g., charge.succeeded)",
    )
    .argument("<fixture>", "Path to the JSON fixture for the event payload")
    .action(testWebhook);

  program.parse(process.argv);
}
