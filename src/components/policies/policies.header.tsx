import Link from "next/link";

import { ThemeToggle } from "@/components/chat-ui";

const PoliciesHeader = () => {
  return (
    <header className="border-b shadow-sm border-inn-border-light fixed bg-inn-bg-primary top-0 inset-x-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight">
          Mirael
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-inn-border-light px-4 py-2 text-sm font-medium text-inn-text-primary hover:text-inn-bg-accent hover:border-inn-bg-accent transition"
          >
            Back to Mirael
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PoliciesHeader;
