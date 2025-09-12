import Header from "@/components/header";
import SessionsPage from "@/components/sessions/sessions-page";

export default function SessionsRoute() {
  return (
    <main className="relative h-screen w-screen standalone:w-full bg-mir-bg-primary">
      <Header />
      <SessionsPage />
    </main>
  );
}
