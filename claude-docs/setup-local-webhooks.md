# Setup Local Webhooks for Development

## Option 1: Stripe CLI (Recommended)

1. **Install Stripe CLI:**

   ```bash
   # On macOS
   brew install stripe/stripe-cli/stripe

   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe:**

   ```bash
   stripe login
   ```

3. **Forward webhooks to local development server:**

   ```bash
   # Start your Next.js dev server first
   npm run dev

   # In another terminal, forward webhooks
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret:**
   The CLI will output something like:

   ```
   Your webhook signing secret is whsec_1234567890abcdef...
   ```

   Update your `.env` file:

   ```env
   STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef..."
   ```

5. **Test a payment:**
   ```bash
   # Trigger a test payment event
   stripe trigger payment_intent.succeeded
   ```

## Option 2: ngrok (Alternative)

1. **Install ngrok:**

   ```bash
   # Download from https://ngrok.com/download
   # Or use brew
   brew install ngrok
   ```

2. **Start ngrok tunnel:**

   ```bash
   # Start your Next.js dev server first
   npm run dev

   # In another terminal, create tunnel
   ngrok http 3000
   ```

3. **Update Stripe webhook endpoint:**
   - Go to Stripe Dashboard > Webhooks
   - Update your webhook URL to: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
   - Make sure these events are enabled:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

## Option 3: Test Webhook Manually

If you want to test without external tools:

```bash
# Use the test script we created
STRIPE_WEBHOOK_SECRET="your_webhook_secret" node debug-webhook-endpoint.js
```

## Recommended Setup

Use **Stripe CLI** method because:

- ✅ No need to change webhook URLs in Stripe Dashboard
- ✅ Automatically handles webhook signing
- ✅ Can trigger test events easily
- ✅ Works with localhost directly

## After Setup

1. Make a test purchase in your app
2. Watch the terminal with `stripe listen` - you should see webhook events
3. Check your app logs for webhook processing
4. Verify credits are added to user account

## Troubleshooting

- Make sure `npm run dev` is running on port 3000
- Verify webhook secret is updated in `.env`
- Check that webhook endpoint responds with 200 status
- Look for error messages in both terminals
