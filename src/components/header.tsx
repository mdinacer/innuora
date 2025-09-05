import Link from "next/link";

import { ThemeToggle } from "@/components/chat-ui";
import initTranslations, { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  middleContent?: React.ReactNode;
  sideContent?: React.ReactNode;
  className?: string;
  locale?: AppLocales;
}

export default async function Header({ middleContent, sideContent, className, locale = "en" }: Props) {
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <header className={cn("border-b border-mir-border-light", className)}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="#" className="font-extrabold text-xl tracking-tight rtl:font-arabic rtl:text-2xl">
          {t("app-name", { defaultValue: "Mirael" })}
        </Link>

        {middleContent}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {sideContent}
        </div>
      </div>
    </header>
  );
}
