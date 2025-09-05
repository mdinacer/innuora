import Header from "@/components/header";
import { AppLocales } from "@/lib/i18n";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale = "en" } = await params;
  return (
    <div className="min-h-screen w-screen flex flex-col bg-mir-bg-primary text-mir-text-primary">
      <Header locale={locale as AppLocales} />
      {children}
    </div>
  );
}
