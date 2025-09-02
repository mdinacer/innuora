const KEY_PRINCIPLES = [
  "We minimize the personal data we collect",
  "We separate ephemeral session processing from persistent storage",
  "We treat sensitive emotional content with heightened safeguards",
  "We minimize the exposure of your data to third parties",
];
export default function PrivacyPolicyRoute() {
  return (
    <main className="relative font-sans min-h-screen pt-20 w-screen overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Hero Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-lg md:text-xl text-mir-text-secondary max-w-2xl mx-auto mb-6">
          How we collect, use, and protect your personal information when you use Mirael's emotional reflection and
          clarity tools.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent">
          Effective September 2, 2025 • Version 1.0
        </div>
      </section>

      {/* <!-- Key Principles --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Privacy Principles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {KEY_PRINCIPLES.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
                <p className="text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Contact Information --> */}
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
                <strong>Important:</strong> This policy applies to all users of Mirael. Mirael does not create a
                therapeutic relationship and is designed as a self-help emotional reflection tool.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Data We Collect --> */}
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

        {/* <!-- How We Use Your Data --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How We Process Your Information</h2>

          <div className="space-y-6">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">AI Processing</h3>
              <p className="text-mir-text-secondary mb-3">
                Mirael uses stateless AI inference (like GPT-4) to process your text for reflection and pattern
                recognition. Your inputs are transmitted securely for immediate processing, and the AI returns outputs
                that help provide personalized reflections.
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
                To provide continuity, Mirael stores some data locally on your device using client-side persistence.
                This data remains on your device unless you explicitly choose to sync or export it.
              </p>
              <p className="text-sm text-mir-text-secondary italic">
                You can clear local data through app settings—this storage is under your control.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- User Rights --> */}
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

        {/* <!-- Data Retention --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How Long We Keep Your Data</h2>
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <p className="text-mir-text-secondary mb-4">
              We retain personal data only as long as necessary for the purpose collected or to satisfy legal
              obligations:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-mir-border-light">
                <span className="font-medium">Account Data</span>
                <span className="text-mir-text-secondary">While active + 12 months after deletion</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-mir-border-light">
                <span className="font-medium">Your Content</span>
                <span className="text-mir-text-secondary">Until you delete it</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-mir-border-light">
                <span className="font-medium">Backup Copies</span>
                <span className="text-mir-text-secondary">Up to 90 days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-mir-border-light">
                <span className="font-medium">Analytics & Logs</span>
                <span className="text-mir-text-secondary">Up to 24 months</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Local Device Storage</span>
                <span className="text-mir-text-secondary">Until you clear it</span>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- Security --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Security</h2>
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <p className="text-mir-text-secondary mb-4">
              We implement comprehensive security measures to protect your information:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span className="text-sm text-mir-text-secondary">
                  Encryption in transit (TLS) for all communications
                </span>
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
                <span className="text-sm text-mir-text-secondary">
                  Optional client-side encryption for local storage
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- Safety Notice --> */}
        <section className="mb-12">
          <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-[#FF6B5A] to-mir-bg-accent-dark">
            <h2 className="text-2xl font-bold mb-3">Important Safety Notice</h2>
            <p className="mb-4 ">
              Mirael is NOT a crisis or emergency service and does not replace professional mental health care.
            </p>
            <p className="text-base opacity-90">
              If content suggests imminent harm or severe risk, the Service may prompt resources and recommend
              contacting local emergency services. If we believe there is an imminent threat to life or safety and are
              legally compelled to act, we may disclose information to emergency services as required by law.
            </p>
          </div>
        </section>

        {/* <!-- International Users --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">International Users</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-lg font-semibold mb-2">EU/EEA Users (GDPR)</h3>
              <p className="text-mir-text-secondary">
                EU and EEA users have additional rights under GDPR. We will respond to GDPR rights requests and provide
                data processing information relevant to EU residents upon request.
              </p>
            </div>
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-lg font-semibold mb-2">California Residents (CCPA/CPRA)</h3>
              <p className="text-mir-text-secondary">
                California residents have rights under the CCPA/CPRA: access, deletion, and opt-out of sale. Note that
                Mirael does not sell personal information. Requests can be made via{" "}
                <a href="mailto:privacy@mirael.life" className="text-mir-bg-accent hover:underline">
                  privacy@mirael.life
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Changes to Policy --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-xl font-bold mb-3">Changes to This Policy</h2>
            <p className="text-mir-text-secondary">
              We may update this Privacy Policy from time to time. Significant changes will be posted with a new
              effective date and, where appropriate, we'll notify you within the app or by email. The current version is
              1.0, effective September 2, 2025.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
