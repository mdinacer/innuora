/**
 * Email Notification Service
 *
 * Handles sending email notifications for payment events.
 * Uses environment-configured email provider (e.g., Resend, SendGrid, AWS SES).
 */

import { logger } from "@/lib/logging/unified-logger";

// Email templates
const EMAIL_TEMPLATES = {
  PAYMENT_SUCCESS: {
    subject: "Payment Successful - Credits Added",
    getBody: (userName: string, credits: number, amount: number) => `
      <h2>Payment Successful!</h2>
      <p>Hi ${userName},</p>
      <p>Your payment has been processed successfully.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Credits Added: ${credits}</li>
        <li>Amount Paid: $${(amount / 100).toFixed(2)}</li>
      </ul>
      <p>You can start using your credits right away.</p>
      <p>Thank you for your purchase!</p>
    `,
  },
  PAYMENT_FAILED: {
    subject: "Payment Failed - Action Required",
    getBody: (userName: string, reason: string) => `
      <h2>Payment Failed</h2>
      <p>Hi ${userName},</p>
      <p>Unfortunately, your payment could not be processed.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please try again or use a different payment method.</p>
      <p>If you continue to experience issues, please contact support.</p>
    `,
  },
  REFUND_PROCESSED: {
    subject: "Refund Processed",
    getBody: (userName: string, amount: number, creditsDeducted: number) => `
      <h2>Refund Processed</h2>
      <p>Hi ${userName},</p>
      <p>Your refund has been processed successfully.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Refund Amount: $${(amount / 100).toFixed(2)}</li>
        <li>Credits Deducted: ${creditsDeducted}</li>
      </ul>
      <p>The refund should appear in your account within 5-10 business days.</p>
    `,
  },
  SUBSCRIPTION_CREATED: {
    subject: "Subscription Activated",
    getBody: (userName: string, planName: string, credits: number) => `
      <h2>Subscription Activated!</h2>
      <p>Hi ${userName},</p>
      <p>Your subscription has been activated successfully.</p>
      <p><strong>Subscription Details:</strong></p>
      <ul>
        <li>Plan: ${planName}</li>
        <li>Credits per Period: ${credits}</li>
      </ul>
      <p>Your credits will be renewed automatically each billing period.</p>
      <p>Thank you for subscribing!</p>
    `,
  },
  SUBSCRIPTION_CANCELLED: {
    subject: "Subscription Cancelled",
    getBody: (userName: string, planName: string) => `
      <h2>Subscription Cancelled</h2>
      <p>Hi ${userName},</p>
      <p>Your subscription (${planName}) has been cancelled as requested.</p>
      <p>You will retain access until the end of your current billing period.</p>
      <p>We're sorry to see you go. If you have feedback, we'd love to hear it.</p>
    `,
  },
};

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  userId?: string;
}

/**
 * Send email notification
 * NOTE: This is a placeholder. Implement with your email provider (Resend, SendGrid, etc.)
 */
async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    // TODO: Implement with actual email provider
    // Example with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: 'noreply@innuora.com',
    //   to: params.to,
    //   subject: params.subject,
    //   html: params.html,
    // });

    await logger.logInfo("Email notification sent", {
      operation: "send_email_notification",
      userId: params.userId,
      metadata: {
        to: params.to,
        subject: params.subject,
        provider: "pending_implementation", // Replace with actual provider
      },
    });

    // For now, just log (implement actual sending when email provider is configured)
    console.log(`[EMAIL NOTIFICATION] To: ${params.to}, Subject: ${params.subject}`);
    return true;
  } catch (error) {
    await logger.logWarning("Failed to send email notification", {
      operation: "send_email_failed",
      userId: params.userId,
      metadata: {
        to: params.to,
        subject: params.subject,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return false;
  }
}

/**
 * Send payment success notification
 */
export async function notifyPaymentSuccess(
  userEmail: string,
  userName: string,
  credits: number,
  amountCents: number,
  userId?: string
): Promise<void> {
  const template = EMAIL_TEMPLATES.PAYMENT_SUCCESS;
  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.getBody(userName, credits, amountCents),
    userId,
  });
}

/**
 * Send payment failure notification
 */
export async function notifyPaymentFailure(
  userEmail: string,
  userName: string,
  reason: string,
  userId?: string
): Promise<void> {
  const template = EMAIL_TEMPLATES.PAYMENT_FAILED;
  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.getBody(userName, reason),
    userId,
  });
}

/**
 * Send refund processed notification
 */
export async function notifyRefundProcessed(
  userEmail: string,
  userName: string,
  amountCents: number,
  creditsDeducted: number,
  userId?: string
): Promise<void> {
  const template = EMAIL_TEMPLATES.REFUND_PROCESSED;
  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.getBody(userName, amountCents, creditsDeducted),
    userId,
  });
}

/**
 * Send subscription created notification
 */
export async function notifySubscriptionCreated(
  userEmail: string,
  userName: string,
  planName: string,
  creditsPerPeriod: number,
  userId?: string
): Promise<void> {
  const template = EMAIL_TEMPLATES.SUBSCRIPTION_CREATED;
  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.getBody(userName, planName, creditsPerPeriod),
    userId,
  });
}

/**
 * Send subscription cancelled notification
 */
export async function notifySubscriptionCancelled(
  userEmail: string,
  userName: string,
  planName: string,
  userId?: string
): Promise<void> {
  const template = EMAIL_TEMPLATES.SUBSCRIPTION_CANCELLED;
  await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.getBody(userName, planName),
    userId,
  });
}
