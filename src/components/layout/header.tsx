import Link from "next/link";

import { ThemeToggle } from "@/components/chat-ui";

const Header = () => {
  return (
    <header className="border-b border-mir-border-light">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight">
          Mirael
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
