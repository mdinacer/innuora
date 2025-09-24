import Image from "next/image";
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
    <header className={cn("border-b border-inn-border-light/20 relative", className)}>
      <div className="relative z-[200] max-w-6xl mx-auto px-6 py-4  flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-extrabold text-2xl tracking-tight rtl:font-arabic rtl:text-2xl"
        >
          <Image src="/assets/logo.png" alt="Innuora" className=" object-cover object-center" width={32} height={32} />
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
