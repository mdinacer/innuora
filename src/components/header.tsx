import Link from "next/link";

import { ThemeToggle } from "@/components/chat-ui";
import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";

interface Props {
  middleContent?: React.ReactNode;
  sideContent?: React.ReactNode;
  className?: string;
}

export default function Header({ middleContent, sideContent, className }: Props) {
  return (
    <header className={cn("border-b border-mir-border-light/20 relative", className)}>
      <div className="relative z-[200] max-w-6xl mx-auto px-6 py-4  flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight rtl:font-arabic rtl:text-2xl">
          {APP_CONFIG.name}
        </Link>

        {middleContent}
        <div className="flex items-center gap-3 rtl:font-sans">
          {sideContent}
          {/* {authUser && <SignoutButton />} */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
