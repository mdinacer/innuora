const PrivacyPolicyContactInformation = () => {
  return (
    <section className="mb-12">
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
        <h2 className="text-2xl font-bold mb-4">Contact & Data Controller</h2>
        <div className="space-y-2 text-mir-text-secondary">
          <p>
            <strong className="text-mir-text-primary">Data Controller:</strong> Mirael, Inc.
          </p>
          <p>
            <strong className="text-mir-text-primary">Privacy Contact:</strong>{" "}
            <a href="mailto:privacy@mirael.app" className="text-mir-bg-accent hover:underline">
              privacy@mirael.app
            </a>
          </p>
          <p>
            <strong className="text-mir-text-primary">Data Protection Officer:</strong>{" "}
            <a href="mailto:privacy@mirael.app" className="text-mir-bg-accent hover:underline">
              privacy@mirael.app
            </a>
          </p>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
          <p className="text-sm text-mir-text-secondary">
            <strong>Important:</strong> This policy applies to all users of Mirael. Mirael does not create a therapeutic
            relationship and is designed as a self-help emotional reflection tool.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyContactInformation;
