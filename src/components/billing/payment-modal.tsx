"use client";

import { useCallback, useState } from "react";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, CreditCard, Loader2, XCircle, XIcon } from "lucide-react";

import { createCreditPurchaseIntent } from "@/app/actions/billing-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BILLING_PRODUCTS, BillingProductKey, BillingUtils } from "@/lib/billing/billing-config";
import { getStripePublishableKey } from "@/lib/billing/stripe-client";
import { CreditUXUtils } from "@/lib/credits/credit-config";

// =========================
// Stripe Promise Initialization
// =========================

const stripePromise = loadStripe(getStripePublishableKey());

// =========================
// Payment Form Component
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "succeeded" | "failed">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = BILLING_PRODUCTS[productKey];
  const timeFrame = CreditUXUtils.creditsToEstimatedWeeks(product.credits);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      // Prevent duplicate submissions
      if (isSubmitting || isCreatingIntent || isProcessing) {
        return;
      }

      // Create payment intent only when user submits (not on mount)
      if (!clientSecret) {
        setIsSubmitting(true);
        setIsCreatingIntent(true);
        try {
          const result = await createCreditPurchaseIntent(productKey, userEmail, userName);

          if (result.error) {
            onError(result.error.message || "Failed to initialize payment");
            setIsCreatingIntent(false);
            setIsSubmitting(false);
            return;
          }

          if (!result.data.success || !result.data.clientSecret) {
            onError("Failed to initialize payment");
            setIsCreatingIntent(false);
            setIsSubmitting(false);
            return;
          }

          setClientSecret(result.data.clientSecret);
          setIsCreatingIntent(false);

          // Continue with payment confirmation after intent is created
          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
            onError("Payment form not loaded properly");
            setIsSubmitting(false);
            return;
          }

          setIsProcessing(true);
          setPaymentStatus("processing");

          const { error, paymentIntent } = await stripe.confirmCardPayment(result.data.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: userEmail,
                name: userName,
              },
            },
          });

          if (error) {
            onError(error.message || "Payment failed");
            setPaymentStatus("failed");
            setIsSubmitting(false);
          } else if (paymentIntent.status === "succeeded") {
            setPaymentStatus("succeeded");
            onSuccess({
              creditsAdded: product.credits,
              newBalance: 0,
            });
            // Keep isSubmitting true to prevent any further submissions
          }
          setIsProcessing(false);
        } catch {
          onError("An unexpected error occurred");
          setPaymentStatus("failed");
          setIsCreatingIntent(false);
          setIsProcessing(false);
          setIsSubmitting(false);
        }
        return;
      }

      // If clientSecret already exists, just confirm payment
      setIsSubmitting(true);
      setIsProcessing(true);
      setPaymentStatus("processing");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError("Payment form not loaded properly");
        setIsProcessing(false);
        setPaymentStatus("failed");
        setIsSubmitting(false);
        return;
      }

      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: userEmail,
              name: userName,
            },
          },
        });

        if (error) {
          onError(error.message || "Payment failed");
          setPaymentStatus("failed");
          setIsSubmitting(false);
        } else if (paymentIntent.status === "succeeded") {
          setPaymentStatus("succeeded");
          onSuccess({
            creditsAdded: product.credits,
            newBalance: 0,
          });
          // Keep isSubmitting true to prevent any further submissions
        }
      } catch {
        onError("An unexpected error occurred");
        setPaymentStatus("failed");
        setIsSubmitting(false);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      clientSecret,
      elements,
      onError,
      onSuccess,
      product.credits,
      stripe,
      userEmail,
      userName,
      productKey,
      isSubmitting,
      isCreatingIntent,
      isProcessing,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Product Summary */}
      <div className="rounded-2xl bg-inn-bg-soft border border-inn-border-light p-4">
        <h3 className="font-semibold text-lg">
          {BillingUtils.formatAmount(BillingUtils.dollarsToCents(product.price))} Pack - {timeFrame} weeks of support
        </h3>
        <p className="text-sm text-gray-600 mt-1">~{product.credits.toLocaleString()} credits, automatically applied</p>
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
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
      </div>

      {/* Status Messages */}
      {paymentStatus === "processing" && (
        <div className="flex items-center text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing payment...
        </div>
      )}

      {paymentStatus === "succeeded" && (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-2" />
          Payment successful! Credits are being added to your account.
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-2" />
          Payment failed. Please try again.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 rounded-2xl border border-inn-border-light px-6 py-3 text-base font-semibold hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isSubmitting || isProcessing || isCreatingIntent || paymentStatus === "succeeded"}
          className="flex-1 rounded-2xl bg-inn-bg-accent px-6 py-3 text-nowrap text-base font-semibold text-white hover:translate-y-[-1px] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingIntent || isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
              {isCreatingIntent ? "Initializing..." : "Processing..."}
            </>
          ) : (
            `Secure ${timeFrame} weeks of support`
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center">
        <p>Your payment is secured by Stripe. We never store your card information.</p>
      </div>
    </form>
  );
}

// =========================
// Payment Modal Component
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

export function PaymentModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
  productKey,
  onSuccess,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successResult, setSuccessResult] = useState<{ creditsAdded: number; newBalance: number } | null>(null);

  const resetModal = () => {
    setPaymentStatus("idle");
    setErrorMessage("");
    setSuccessResult(null);
  };

  const handleSuccess = (result: { creditsAdded: number; newBalance: number }) => {
    setPaymentStatus("success");
    setSuccessResult(result);
    onSuccess?.(result);

    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose();
      resetModal();
    }, 3000);
  };

  const handleError = (error: string) => {
    setPaymentStatus("error");
    setErrorMessage(error);
  };

  const handleClose = () => {
    onClose();
    // Reset after modal animation completes
    setTimeout(resetModal, 300);
  };

  if (paymentStatus === "success" && successResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Payment Successful!
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            <p className="text-lg font-semibold mb-2">
              {successResult.creditsAdded.toLocaleString()} credits added to your account
            </p>
            <p className="text-gray-600">Your support is now secured and ready to use.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (paymentStatus === "error") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Payment Failed
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <Button onClick={() => setPaymentStatus("idle")} className="mr-2">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
    </Dialog>
  );
}

export default PaymentModal;
