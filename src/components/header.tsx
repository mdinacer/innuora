import Link from "next/link";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { ThemeToggle } from "@/components/chat-ui";
import initTranslations, { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import SignoutButton from "./auth/signout-button";
import LanguageSwitcher from "./language-switcher";

interface Props {
  middleContent?: React.ReactNode;
  sideContent?: React.ReactNode;
  className?: string;
  locale?: AppLocales;
}

export default async function Header({ middleContent, sideContent, className, locale = "en" }: Props) {
  const authUser = await findCurrentUser();
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <header className={cn("border-b border-mir-border-light relative z-40", className)}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight rtl:font-arabic rtl:text-2xl">
          {t("app-name", { defaultValue: "Mirael" })}
        </Link>

        {middleContent}
        <div className="flex items-center gap-3 rtl:font-sans">
          <LanguageSwitcher />

          {sideContent}
          {authUser && <SignoutButton />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
