"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";

const BillingHelp = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Payment Security</h3>
        <p className="text-[var(--text-secondary)] mb-4">
          Your payment information is secured by Stripe, a PCI-compliant payment processor trusted by millions of
          businesses worldwide.
        </p>
        <div className="flex items-center gap-2 text-sm text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          SSL Encrypted
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Credit Policy</h3>
        <ul className="text-[var(--text-secondary)] space-y-2">
          <li className="flex items-start gap-2">
            <CheckIcon className="size-4 text-primary mt-1 flex-shrink-0" />
            <span>Credits never expire - they remain available whenever you choose to continue your process</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="size-4 text-primary mt-1 flex-shrink-0" />
            <span>Credits are non-refundable once activated, ensuring fairness and continuity of support</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="size-4 text-primary mt-1 flex-shrink-0" />
            <span>All payments are securely processed and confidentially handled</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="size-4 text-primary mt-1 flex-shrink-0" />
            <span>Unused credits carry forward indefinitely - your progress remains intact</span>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Support</h3>
        <p className="text-[var(--text-secondary)] mb-4">
          Need help with billing or have questions about your credits?
        </p>
        <Link
          href="#"
          className="inline-flex rounded-2xl border border-border px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:text-primary hover:border-primary transition"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default BillingHelp;
