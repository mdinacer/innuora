"use client";

import React from "react";
import { CreditCardIcon } from "lucide-react";

import CreditsBalance from "../credits/credits-balance";

interface Props {
  className?: string;
}

const BillingOverview: React.FC<Props> = ({}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <CreditCardIcon className="size-6 text-primary shrink-0" />

          <h3 className="text-xl font-semibold">Current Balance</h3>
        </div>
        <div className="mb-6">
          <CreditsBalance
            showUSDValue={false}
            content={({ currentBalance, subText }) => (
              <>
                <div className="text-5xl font-extrabold text-primary mb-2">{currentBalance}</div>
                <div className="text-muted-foreground">{subText}</div>
              </>
            )}
          />
        </div>
        <div className="rounded-xl bg-muted border border-primary/25 p-4">
          <h4 className="font-semibold mb-2">How Credits Work</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Each credit supports your ongoing space for reflection and emotional clarity</li>
            <li>Conversations typically draw 15-35 credits, depending on depth and pace</li>
            <li>Your credits don't expire - they wait for you, whenever you're ready to continue</li>
            <li>Payments are protected and handled with complete confidentiality</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-green-500 mb-1">Secure</div>
          <div className="text-sm font-medium mb-1">Payment Processing</div>
          <div className="text-xs text-[var(--text-secondary)]">256-bit SSL encryption</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-primary mb-1">24/7</div>
          <div className="text-sm font-medium mb-1">Support Available</div>
          <div className="text-xs text-[var(--text-secondary)]">Always here to help</div>
        </div>
      </div>
    </div>
  );
};

export default BillingOverview;
