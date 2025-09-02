import Link from "next/link";

import { ThemeToggle } from "@/components/chat-ui";

const HomePageHeader = () => {
  return (
    <header className="border-b border-mir-border-light">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="#" className="font-extrabold text-xl tracking-tight">
          Mirael
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="#early-access"
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-light)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--bg-accent)] hover:border-[var(--bg-accent)] transition"
          >
            Request access
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomePageHeader;
