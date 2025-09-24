import Header from "@/components/header";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-screen standalone:w-full flex flex-col bg-inn-bg-primary text-inn-text-primary">
      <Header />
      {children}
    </div>
  );
}
