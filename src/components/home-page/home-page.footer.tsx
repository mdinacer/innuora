import Link from "next/link";

const HomePageFooter = () => {
  return (
    <footer className="border-t border-inn-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-inn-text-secondary">
        <p className="mb-3">
          <strong>Important:</strong> Mirael is not a mental health or crisis service. If you are in crisis, contact
          local emergency services.
        </p>
        <div className="flex justify-center gap-6 flex-wrap mb-3">
          <Link href="/privacy" className="hover:text-inn-text-primary">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-inn-text-primary">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-inn-text-primary">
            Contact
          </Link>
          <Link href="/help" className="hover:text-inn-text-primary">
            Help
          </Link>
        </div>
        <p>© 2025 Mirael. Early access.</p>
      </div>
    </footer>
  );
};

export default HomePageFooter;
