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
  metadata?: Record<string, string>;
  last_payment_error?: {
    message: string;
    type: string;
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  amount_paid: number;
  amount_due: number;
  status: string;
  subscription?: string;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
        currency: string;
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
