import Header from "@/components/header";
import { APP_CONFIG } from "@/config/app";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-full pt-30">
      <Header className="fixed top-0 inset-x-0" />
      {children}
      <footer className="border-t border-inn-border-light mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center text-xs sm:text-sm text-inn-text-secondary">
          <p className="mb-3">
            This content is for educational purposes and is not a substitute for professional mental health care.
          </p>
          <p>© 2025 {APP_CONFIG.company.legalName}. Your privacy matters.</p>
        </div>
      </footer>
    </div>
  );
}
