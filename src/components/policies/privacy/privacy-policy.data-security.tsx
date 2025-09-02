const PrivacyPolicyDataSecurity = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Security</h2>
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
        <p className="text-mir-text-secondary mb-4">
          We implement comprehensive security measures to protect your information:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
            <span className="text-sm text-mir-text-secondary">Encryption in transit (TLS) for all communications</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
            <span className="text-sm text-mir-text-secondary">Encryption at rest for sensitive stored data</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
            <span className="text-sm text-mir-text-secondary">Access controls and least privilege principles</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
            <span className="text-sm text-mir-text-secondary">Regular security assessments and monitoring</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
            <span className="text-sm text-mir-text-secondary">Secure authentication credential storage</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
            <span className="text-sm text-mir-text-secondary">Optional client-side encryption for local storage</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyDataSecurity;
