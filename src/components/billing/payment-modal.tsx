"use client";

import { useEffect, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, CreditCard, Loader2, XCircle } from "lucide-react";

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
  userId: string;
  userEmail?: string;
  userName?: string;
  productKey: BillingProductKey;
  onSuccess: (result: { creditsAdded: number; newBalance: number }) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

function PaymentForm({ userId, userEmail, userName, productKey, onSuccess, onError, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "succeeded" | "failed">("idle");

  const product = BILLING_PRODUCTS[productKey];
  const timeFrame = CreditUXUtils.creditsToEstimatedWeeks(product.credits);

  // Create payment intent on mount
  useEffect(() => {
    async function createIntent() {
      try {
        const result = await createCreditPurchaseIntent(productKey, userEmail, userName);

        if (result.success && result.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          onError(result.error || "Failed to initialize payment");
        }
      } catch {
        onError("Failed to initialize payment");
      }
    }

    createIntent();
  }, [userId, productKey, userEmail, userName, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError("Payment form not loaded properly");
      setIsProcessing(false);
      setPaymentStatus("failed");
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
      } else if (paymentIntent.status === "succeeded") {
        setPaymentStatus("succeeded");
        onSuccess({
          creditsAdded: product.credits,
          newBalance: 0, // This will be updated from the server
        });
      }
    } catch {
      onError("An unexpected error occurred");
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Initializing payment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg">
          {BillingUtils.formatAmount(BillingUtils.dollarsToCents(product.price))} Pack — {timeFrame} weeks of support
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing || paymentStatus === "succeeded"}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Secure ${timeFrame} weeks of support`
          )}
        </Button>
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Secure Your Support</DialogTitle>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <PaymentForm
            userId={userId}
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
