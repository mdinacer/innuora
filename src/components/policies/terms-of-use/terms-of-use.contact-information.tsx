import Link from "next/link";

const TermsOfUseContactInformation = () => {
  return (
    <section className="mb-12">
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <div className="space-y-2 text-mir-text-secondary">
          <p>
            <strong className="text-mir-text-primary">Legal Entity:</strong> Mirael, Inc.
          </p>
          <p>
            <strong className="text-mir-text-primary">Support:</strong>{" "}
            <Link href="mailto:support@mirael.life" className="text-mir-bg-accent hover:underline">
              support@mirael.life
            </Link>
          </p>
          <p>
            <strong className="text-mir-text-primary">Privacy:</strong>{" "}
            <Link href="mailto:privacy@mirael.life" className="text-mir-bg-accent hover:underline">
              privacy@mirael.life
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfUseContactInformation;
