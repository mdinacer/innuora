const TermsOfUseTermination = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Account Termination</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-lg font-semibold mb-2">By You</h3>
          <p className="text-mir-text-secondary">
            You may stop using Mirael at any time and request account deletion through your settings.
          </p>
        </div>
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-lg font-semibold mb-2">By Us</h3>
          <p className="text-mir-text-secondary">
            We may suspend or terminate your access if you violate these Terms, misuse the Service, or create legal
            risk.
          </p>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
        <p className="text-sm text-mir-text-secondary">
          <strong>Effect of Termination:</strong> Upon termination, all rights granted to you under these Terms will
          immediately cease.
        </p>
      </div>
    </section>
  );
};

export default TermsOfUseTermination;
