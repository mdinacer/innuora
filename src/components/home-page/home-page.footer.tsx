import Link from "next/link";

const HomePageFooter = () => {
  return (
    <footer className="border-t border-mir-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-mir-text-secondary">
        <p className="mb-3">
          <strong>Important:</strong> Mirael is not a mental health or crisis service. If you are in crisis, contact
          local emergency services.
        </p>
        <div className="flex justify-center gap-6 flex-wrap mb-3">
          <Link href="/privacy" className="hover:text-mir-text-primary">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-mir-text-primary">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-mir-text-primary">
            Contact
          </Link>
          <Link href="/help" className="hover:text-mir-text-primary">
            Help
          </Link>
        </div>
        <p>© 2025 Mirael. Early access.</p>
      </div>
    </footer>
  );
};

export default HomePageFooter;
