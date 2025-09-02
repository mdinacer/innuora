const PrivacyPolicyUserRights = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Your Rights & Controls</h2>

      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">Access</h4>
              <p className="text-sm text-mir-text-secondary">Request a copy of your personal data</p>
            </div>
            <div>
              <h4 className="font-semibold">Correction</h4>
              <p className="text-sm text-mir-text-secondary">Fix inaccurate or incomplete information</p>
            </div>
            <div>
              <h4 className="font-semibold">Deletion</h4>
              <p className="text-sm text-mir-text-secondary">Request deletion of your personal data</p>
            </div>
            <div>
              <h4 className="font-semibold">Portability</h4>
              <p className="text-sm text-mir-text-secondary">Export your data in machine-readable format</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">Restrict Processing</h4>
              <p className="text-sm text-mir-text-secondary">Limit certain processing activities</p>
            </div>
            <div>
              <h4 className="font-semibold">Object</h4>
              <p className="text-sm text-mir-text-secondary">Object to processing for marketing</p>
            </div>
            <div>
              <h4 className="font-semibold">Withdraw Consent</h4>
              <p className="text-sm text-mir-text-secondary">Remove consent for optional features</p>
            </div>
            <div>
              <h4 className="font-semibold">Opt-out</h4>
              <p className="text-sm text-mir-text-secondary">Disable analytics or tracking</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
          <p className="text-sm text-mir-text-secondary">
            <strong>How to Exercise Your Rights:</strong> Email us at{" "}
            <a href="mailto:privacy@mirael.life" className="text-mir-bg-accent hover:underline">
              privacy@mirael.life
            </a>{" "}
            with proof of identity. We'll respond within 30 days in accordance with applicable law.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyUserRights;
