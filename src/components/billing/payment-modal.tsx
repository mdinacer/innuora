"use client";

import { useCallback, useReducer } from "react";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, CreditCard, Loader2, XCircle, XIcon } from "lucide-react";

import { createCreditPurchaseIntent } from "@/app/actions/billing-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BILLING_PRODUCTS, BillingProductKey, BillingUtils } from "@/lib/billing/billing-config";
import { getStripePublishableKey } from "@/lib/billing/stripe-client";

// =========================
// Stripe Promise Initialization
// =========================
const stripePromise = loadStripe(getStripePublishableKey());

// =========================
// Payment Reducer
// =========================
type PaymentStatus = "idle" | "creating_intent" | "processing_payment" | "succeeded" | "failed";

interface PaymentState {
  status: PaymentStatus;
  clientSecret: string | null;
  error: string | null;
  successResult?: { creditsAdded: number; newBalance: number } | null;
}

type PaymentAction =
  | { type: "START_CREATE_INTENT" }
  | { type: "INTENT_CREATED"; clientSecret: string }
  | { type: "START_PAYMENT" }
  | { type: "PAYMENT_SUCCEEDED"; result: { creditsAdded: number; newBalance: number } }
  | { type: "PAYMENT_FAILED"; error: string }
  | { type: "RESET" };

const initialState: PaymentState = {
  status: "idle",
  clientSecret: null,
  error: null,
  successResult: null,
};

function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case "START_CREATE_INTENT":
      return { ...state, status: "creating_intent", error: null };
    case "INTENT_CREATED":
      return { ...state, status: "idle", clientSecret: action.clientSecret };
    case "START_PAYMENT":
      return { ...state, status: "processing_payment", error: null };
    case "PAYMENT_SUCCEEDED":
      return { ...state, status: "succeeded", successResult: action.result, error: null };
    case "PAYMENT_FAILED":
      return { ...state, status: "failed", error: action.error };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// =========================
// Payment Form
// =========================
interface PaymentFormProps {
  userEmail?: string;
  userName?: string;
  productKey: BillingProductKey;
  onSuccess: (result: { creditsAdded: number; newBalance: number }) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

function PaymentForm({ userEmail, userName, productKey, onSuccess, onError, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  const product = BILLING_PRODUCTS[productKey];
  const { status, clientSecret, error } = state;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      if (status === "creating_intent" || status === "processing_payment" || status === "succeeded") return;

      try {
        if (!clientSecret) {
          // Create payment intent
          dispatch({ type: "START_CREATE_INTENT" });
          const result = await createCreditPurchaseIntent(productKey, userEmail, userName);

          if (result.error || !result.data.success || !result.data.clientSecret) {
            dispatch({ type: "PAYMENT_FAILED", error: result.error?.message || "Failed to initialize payment" });
            onError(result.error?.message || "Failed to initialize payment");
            return;
          }

          dispatch({ type: "INTENT_CREATED", clientSecret: result.data.clientSecret });
        }

        // Confirm payment
        const finalClientSecret = clientSecret || state.clientSecret;
        if (!finalClientSecret) throw new Error("Missing client secret");

        dispatch({ type: "START_PAYMENT" });

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Payment form not loaded properly");

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(finalClientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { email: userEmail, name: userName },
          },
        });

        if (stripeError) {
          dispatch({ type: "PAYMENT_FAILED", error: stripeError.message || "Payment failed" });
          onError(stripeError.message || "Payment failed");
          return;
        }

        if (paymentIntent.status === "succeeded") {
          const result = { creditsAdded: product.credits, newBalance: 0 };
          dispatch({ type: "PAYMENT_SUCCEEDED", result });
          onSuccess(result);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unexpected error";
        dispatch({ type: "PAYMENT_FAILED", error: msg });
        onError(msg);
      }
    },
    [stripe, elements, clientSecret, productKey, product.credits, userEmail, userName, onSuccess, onError, status]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Product Summary */}
      <div className="rounded-2xl bg-inn-bg-soft border border-inn-border-light p-4">
        <h3 className="font-semibold text-lg">
          {BillingUtils.formatAmount(BillingUtils.dollarsToCents(product.price))} - {product.label} Package
        </h3>
        <p className="text-sm text-gray-600 mt-1">{product.credits.toLocaleString()} credits</p>
        <p className="text-xs text-gray-500 mt-1">{product.tagline}</p>
      </div>

      {/* Card Input */}
      <div className="space-y-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
          <CreditCard className="inline h-4 w-4 mr-2" />
          Card Information
        </label>
        <div className="border rounded-md p-3 bg-white">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
                invalid: { color: "#9e2146" },
              },
              hidePostalCode: false,
            }}
          />
        </div>
      </div>

      {/* Status Messages */}
      {status === "processing_payment" && (
        <div className="flex items-center text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing payment...
        </div>
      )}
      {status === "succeeded" && (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-2" />
          Payment successful! Credits added.
        </div>
      )}
      {status === "failed" && (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-2" />
          {error || "Payment failed. Please try again."}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={status === "processing_payment"}
          className="flex-1 rounded-2xl border border-inn-border-light px-6 py-3 text-base font-semibold hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={status === "processing_payment" || status === "creating_intent" || status === "succeeded"}
          className="flex-1 rounded-2xl bg-inn-bg-accent px-6 py-3 text-base font-semibold text-white shadow-lg disabled:opacity-50"
        >
          {status === "creating_intent" || status === "processing_payment" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
              {status === "creating_intent" ? "Initializing..." : "Processing..."}
            </>
          ) : (
            `Confirm Payment - ${product.credits.toLocaleString()} Credits`
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Your payment is secured by Stripe. We never store your card data.</p>
      </div>
    </form>
  );
}

// =========================
// Payment Modal
// =========================
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string;
  userName?: string;
  productKey: BillingProductKey;
  onSuccess?: (result: { creditsAdded: number; newBalance: number }) => void;
}

export function PaymentModal({ isOpen, onClose, userEmail, userName, productKey, onSuccess }: PaymentModalProps) {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { status, error, successResult } = state;

  const handleSuccess = (result: { creditsAdded: number; newBalance: number }) => {
    dispatch({ type: "PAYMENT_SUCCEEDED", result });
    onSuccess?.(result);
    setTimeout(() => {
      onClose();
      dispatch({ type: "RESET" });
    }, 3000);
  };

  const handleError = (error: string) => dispatch({ type: "PAYMENT_FAILED", error });
  const handleClose = () => {
    onClose();
    setTimeout(() => dispatch({ type: "RESET" }), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {status === "succeeded" && successResult ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" /> Payment Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-lg font-semibold mb-2">{successResult.creditsAdded.toLocaleString()} credits added.</p>
            <p className="text-gray-600">Your support is now secured.</p>
          </div>
        </DialogContent>
      ) : status === "failed" ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" /> Payment Failed
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => dispatch({ type: "RESET" })} className="mr-2">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-lg p-0 bg-inn-bg-card rounded-3xl border border-inn-border-light shadow-[0_20px_60px] shadow-black/30 max-w-[500px] max-h-[90vh]"
        >
          <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-inn-border-light">
            <div>
              <DialogTitle className="text-xl font-bold">Secure Your Support</DialogTitle>
              <DialogDescription className="hidden" />
            </div>
            <DialogClose asChild>
              <button className="w-8 h-8 rounded-full hover:bg-inn-bg-secondary flex items-center justify-center transition">
                <XIcon className="size-5 shrink-0" />
              </button>
            </DialogClose>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <PaymentForm
              userEmail={userEmail}
              userName={userName}
              productKey={productKey}
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={handleClose}
            />
          </Elements>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default PaymentModal;
