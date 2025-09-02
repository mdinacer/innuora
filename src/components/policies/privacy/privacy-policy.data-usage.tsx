const PrivacyPolicyDataUsage = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">How We Process Your Information</h2>

      <div className="space-y-6">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">AI Processing</h3>
          <p className="text-mir-text-secondary mb-3">
            Mirael uses stateless AI inference (like GPT-4) to process your text for reflection and pattern recognition.
            Your inputs are transmitted securely for immediate processing, and the AI returns outputs that help provide
            personalized reflections.
          </p>
          <div className="p-4 rounded-xl bg-mir-bg-input mt-3">
            <p className="text-sm text-mir-text-secondary">
              <strong>Data Protection:</strong> All transmissions are encrypted, and we work with AI providers as
              processors with security and retention obligations where technically possible.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Local Storage</h3>
          <p className="text-mir-text-secondary mb-3">
            To provide continuity, Mirael stores some data locally on your device using client-side persistence. This
            data remains on your device unless you explicitly choose to sync or export it.
          </p>
          <p className="text-sm text-mir-text-secondary italic">
            You can clear local data through app settings—this storage is under your control.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyDataUsage;
