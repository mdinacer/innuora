import Link from "next/link";

const PoliciesFooter = ({ currentPage }: { currentPage?: "privacy" | "terms" }) => {
  return (
    <footer className="border-t border-mir-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-mir-text-secondary">
        <p className="mb-3">
          <strong>Questions about this policy?</strong> Contact us at{" "}
          <a href="mailto:privacy@mirael.life" className="text-mir-bg-accent hover:underline">
            privacy@mirael.life
          </a>
        </p>
        <div className="flex justify-center gap-6 flex-wrap mb-3">
          {currentPage === "terms" && (
            <Link href="/privacy" className="hover:text-[var(--text-primary)]">
              Privacy Policy
            </Link>
          )}

          {currentPage === "privacy" && (
            <Link href="/terms" className="hover:text-mir-text-primary">
              Terms of Service
            </Link>
          )}
          <Link href="#" className="hover:text-mir-text-primary">
            Contact
          </Link>
          <Link href="#" className="hover:text-mir-text-primary">
            Help
          </Link>
          <Link href="#" className="hover:text-mir-text-primary">
            Support
          </Link>
        </div>
        <p>© 2025 Mirael, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default PoliciesFooter;
