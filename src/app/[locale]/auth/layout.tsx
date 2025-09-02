import Header from "@/components/layout/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-mir-bg-primary text-mir-text-primary">
      <Header />
      {children}
    </div>
  );
}
