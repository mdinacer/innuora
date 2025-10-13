/**
 * Stripe Webhook Event Types
 *
 * Properly typed versions of Stripe webhook events to replace 'any' types
 */

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string | { email?: string; name?: string };
  metadata?: Record<string, string>;
  last_payment_error?: {
    message: string;
    type: string;
  };
  payment_intent?: string;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  amount_paid: number;
  amount_due: number;
  status: string;
  subscription?: string;
  payment_intent?: string;
}

export interface StripeSubscription {
  id: string;
  customer: string | { email?: string; name?: string };
  status: string;
  current_period_start: number;
  current_period_end: number;
  metadata?: Record<string, string>;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        nickname?: string;
      };
    }>;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripePaymentIntent | StripeInvoice | StripeSubscription;
  };
  created: number;
}

export interface PaymentIntentEvent extends StripeWebhookEvent {
  type: "payment_intent.succeeded" | "payment_intent.payment_failed";
  data: {
    object: StripePaymentIntent;
  };
}

export interface InvoiceEvent extends StripeWebhookEvent {
  type: "invoice.payment_succeeded" | "invoice.payment_failed";
  data: {
    object: StripeInvoice;
  };
}

export interface SubscriptionEvent extends StripeWebhookEvent {
  type: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted";
  data: {
    object: StripeSubscription;
  };
}
