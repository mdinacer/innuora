#!/usr/bin/env node

/**
 * Debug webhook endpoint and Stripe configuration
 */

require("dotenv").config();

console.log("=== Webhook Debugging ===\n");

// Check environment variables
console.log("1. Environment Check:");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const secretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

console.log(`   STRIPE_WEBHOOK_SECRET: ${webhookSecret ? "✓ Set" : "✗ Missing"}`);
console.log(`   STRIPE_SECRET_KEY: ${secretKey ? "✓ Set" : "✗ Missing"}`);
console.log(`   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${publishableKey ? "✓ Set" : "✗ Missing"}`);

if (webhookSecret) {
  console.log(`   Webhook Secret Format: ${webhookSecret.startsWith("whsec_") ? "✓ Valid" : "✗ Invalid"}`);
}

// Test webhook endpoint accessibility
console.log("\n2. Webhook Endpoint Test:");

async function testWebhookEndpoint() {
  try {
    const response = await fetch("http://localhost:3000/api/stripe/webhook", {
      method: "GET",
    });

    console.log(`   GET /api/stripe/webhook: ${response.status} ${response.statusText}`);

    if (response.status === 405) {
      console.log("   ✓ Endpoint exists (Method Not Allowed is expected for GET)");
    } else {
      console.log(`   ⚠️  Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ✗ Cannot reach webhook endpoint: ${error.message}`);
    console.log("   Make sure the dev server is running on localhost:3000");
  }
}

// Check Stripe configuration via API
console.log("\n3. Stripe API Test:");

async function testStripeAPI() {
  if (!secretKey) {
    console.log("   ✗ Cannot test - no secret key");
    return;
  }

  try {
    const stripe = require("stripe")(secretKey);

    // List recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 5,
    });

    console.log(`   ✓ Stripe API accessible`);
    console.log(`   Recent payment intents: ${paymentIntents.data.length}`);

    for (const pi of paymentIntents.data) {
      console.log(`     - ${pi.id}: ${pi.status} (${pi.amount / 100} ${pi.currency.toUpperCase()})`);
      if (pi.metadata?.userId) {
        console.log(`       User: ${pi.metadata.userId}`);
      }
    }

    // List webhook endpoints configured in Stripe
    const webhookEndpoints = await stripe.webhookEndpoints.list();
    console.log(`\n   Configured webhook endpoints: ${webhookEndpoints.data.length}`);

    for (const webhook of webhookEndpoints.data) {
      console.log(`     - ${webhook.url}`);
      console.log(`       Status: ${webhook.status}`);
      console.log(`       Events: ${webhook.enabled_events.join(", ")}`);
    }
  } catch (error) {
    console.log(`   ✗ Stripe API error: ${error.message}`);
  }
}

// Main execution
async function main() {
  await testWebhookEndpoint();
  await testStripeAPI();

  console.log("\n4. Next Steps:");
  console.log("   - Check Stripe Dashboard > Webhooks for endpoint configuration");
  console.log("   - Verify webhook URL points to your deployed app or ngrok tunnel");
  console.log("   - Check recent webhook delivery attempts in Stripe Dashboard");
  console.log("   - Look for webhook events in your app logs");
}

main().catch(console.error);
