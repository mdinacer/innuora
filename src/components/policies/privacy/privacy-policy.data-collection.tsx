const PrivacyPolicyDataCollection = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Information We Collect</h2>
      <div className="space-y-6">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Account & Identity</h3>
          <p className="text-mir-text-secondary mb-3">Basic information needed to provide you with an account:</p>
          <ul className="space-y-1 text-mir-text-secondary list-disc list-inside [&>li]:list-item">
            <li>Email address</li>
            <li>Display name</li>
            <li>Profile preferences and metadata</li>
          </ul>
          <p className="text-sm text-mir-text-secondary mt-3 italic">
            Used for account provisioning, authentication, recovery, and support.
          </p>
        </div>

        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Your Reflections & Content</h3>
          <p className="text-mir-text-secondary mb-3">Content you create when using Mirael:</p>
          <ul className="space-y-1 text-mir-text-secondary list-disc list-inside [&>li]:list-item">
            <li>Chat messages and reflection prompts</li>
            <li>Responses to guided exercises</li>
            <li>Optional profile notes and tags</li>
          </ul>
          <p className="text-sm text-mir-text-secondary mt-3 italic">
            Essential for core functionality: emotional reflection, pattern detection, and session continuity.
          </p>
        </div>

        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Sensitive Emotional Content</h3>
          <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15 mb-3">
            <p className="text-sm text-mir-text-secondary">
              We apply additional safeguards to emotional content while maintaining that Mirael is not a medical or
              mental health service.
            </p>
          </div>
          <p className="text-mir-text-secondary mb-3">This includes:</p>
          <ul className="space-y-1 text-mir-text-secondary list-disc list-inside [&>li]:list-item">
            <li>Statements about emotional state and feelings</li>
            <li>Personal history and interpersonal concerns</li>
            <li>Content processed for cognitive pattern identification</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Device & Usage Data</h3>
          <p className="text-mir-text-secondary mb-3">Technical information to keep Mirael running smoothly:</p>
          <ul className="space-y-1 text-mir-text-secondary list-disc list-inside [&>li]:list-item">
            <li>Device model, OS version, app version</li>
            <li>IP address (transient), logs, crash reports</li>
            <li>Feature usage metrics for product improvement</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyDataCollection;
