import Link from "next/link";

import { ThemeToggle } from "@/components/chat-ui";
import { cn } from "@/lib/utils";

interface Props {
  middleContent?: React.ReactNode;
  sideContent?: React.ReactNode;
  className?: string;
}

const Header: React.FC<Props> = ({ middleContent, sideContent, className }) => {
  return (
    <header className={cn("border-b border-mir-border-light", className)}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="#" className="font-extrabold text-xl tracking-tight">
          Mirael
        </Link>

        {middleContent}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {sideContent}
        </div>
      </div>
    </header>
  );
};

export default Header;
