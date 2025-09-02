import Link from "next/link";

import initTranslations from "@/lib/i18n";

export default async function TermsOfUseRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["legal"]);

  const content = {
    title: t("terms.title"),
    effectiveDate: t("terms.effectiveDate"),
    version: t("terms.version"),

    intro: {
      headline: t("terms.intro.headline"),
      message: t("terms.intro.message"),
      note: t("terms.intro.note"),
    },

    contact: {
      title: t("terms.contact.title"),
      entity: t("terms.contact.entity"),
      support: t("terms.contact.support"),
      privacy: t("terms.contact.privacy"),
    },

    eligibility: {
      title: t("terms.eligibility.title"),
      ageRequirement: t("terms.eligibility.ageRequirement"),
      message: t("terms.eligibility.message"),
    },

    license: {
      title: t("terms.license.title"),
      permitted: t("terms.license.permitted"),
      restricted: t("terms.license.restricted", { returnObjects: true, defaultValue: [] }) as string[],
    },

    responsibilities: {
      title: t("terms.responsibilities.title"),
      accountSecurity: t("terms.responsibilities.accountSecurity"),
      legalCompliance: t("terms.responsibilities.legalCompliance"),
      prohibitedUses: t("terms.responsibilities.prohibitedUses", { returnObjects: true, defaultValue: [] }) as string[],
    },

    natureOfService: {
      title: t("terms.natureOfService.title"),
      message: t("terms.natureOfService.message"),
      disclaimer: t("terms.natureOfService.disclaimer"),
    },

    aiAndContent: {
      title: t("terms.aiAndContent.title"),
      aiResponses: t("terms.aiAndContent.aiResponses"),
      userRights: t("terms.aiAndContent.userRights"),
      moderation: t("terms.aiAndContent.moderation"),
    },

    fees: {
      title: t("terms.fees.title"),
      points: t("terms.fees.points", { returnObjects: true, defaultValue: [] }) as string[],
      refundPolicy: t("terms.fees.refundPolicy"),
    },

    termination: {
      title: t("terms.termination.title"),
      byUser: t("terms.termination.byUser"),
      byUs: t("terms.termination.byUs"),
      effect: t("terms.termination.effect"),
    },

    intellectualProperty: {
      title: t("terms.intellectualProperty.title"),
      ownership: t("terms.intellectualProperty.ownership"),
      branding: t("terms.intellectualProperty.branding"),
    },

    disclaimers: {
      title: t("terms.disclaimers.title"),
      asIs: t("terms.disclaimers.asIs"),
      health: t("terms.disclaimers.health"),
    },

    liability: {
      title: t("terms.liability.title"),
      message: t("terms.liability.message"),
      cap: t("terms.liability.cap"),
    },

    indemnification: {
      title: t("terms.indemnification.title"),
      message: t("terms.indemnification.message"),
    },

    governingLaw: {
      title: t("terms.governingLaw.title"),
      points: t("terms.governingLaw.points", { returnObjects: true, defaultValue: [] }) as string[],
    },

    additional: {
      title: t("terms.additional.title"),
      thirdParty: t("terms.additional.thirdParty"),
      exportControls: t("terms.additional.exportControls"),
    },

    changes: {
      title: t("terms.changes.title"),
      message: t("terms.changes.message"),
      note: t("terms.changes.note"),
    },

    entireAgreement: {
      title: t("terms.entireAgreement.title"),
      message: t("terms.entireAgreement.message"),
    },
  };
  return (
    <main className="relative font-sans min-h-screen pt-20 w-screen overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Hero Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">{content.title}</h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent mb-8">
          {content.effectiveDate} • {content.version}
        </div>
      </section>

      {/* <!-- Agreement Notice --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
          <h2 className="text-2xl font-bold mb-3">{content.intro.headline}</h2>
          <p className="mb-4 opacity-90">{content.intro.message}</p>
          <p className="text-sm opacity-80">{content.intro.note}</p>
        </div>
      </section>

      {/* <!-- Main Content --> */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Contact Information --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">{content.contact.title}</h2>
            <div className="space-y-2 text-mir-text-secondary">
              <p>
                <strong className="text-mir-text-primary">Legal Entity:</strong>
              </p>
              <p>
                <strong className="text-mir-text-primary">Support:</strong>{" "}
                <a href="mailto:support@mirael.life" className="text-mir-bg-accent hover:underline">
                  support@mirael.life
                </a>
              </p>
              <p>
                <strong className="text-mir-text-primary">Privacy:</strong>{" "}
                <a href="mailto:privacy@mirael.life" className="text-mir-bg-accent hover:underline">
                  privacy@mirael.life
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Eligibility --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Eligibility</h2>
            <div className="p-4 rounded-xl bg-mir-bg-soft border border-[rgba(255,107,90,0.15)] mb-4">
              <p className="text-sm font-semibold text-mir-text-primary">Age Requirement: 18+</p>
            </div>
            <p className="text-mir-text-secondary">
              By using Mirael, you represent and warrant that you are at least 18 years old (or the legal age of
              majority in your jurisdiction) and have the legal capacity to enter into these Terms.
            </p>
          </div>
        </section>

        {/* <!-- License --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">License to Use</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">What You Can Do</h3>
              <p className="text-mir-text-secondary">
                We grant you a limited, non-exclusive, non-transferable, revocable license to use Mirael for personal,
                non-commercial purposes in accordance with these Terms.
              </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">What You Cannot Do</h3>
              <ul className="space-y-2 text-mir-text-secondary">
                <li>• Copy, modify, distribute, sell, or lease any part of the Service</li>
                <li>• Reverse engineer, decompile, or attempt to extract source code (except as permitted by law)</li>
                <li>• Use Mirael to build competitive products or services</li>
              </ul>
            </div>
          </div>
        </section>

        {/* <!-- User Responsibilities --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Responsibilities</h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">Account Security</h3>
              <p className="text-mir-text-secondary">
                You are responsible for maintaining the confidentiality of your login credentials and for all activities
                that occur under your account.
              </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">Legal Compliance</h3>
              <p className="text-mir-text-secondary">
                You agree to comply with all applicable laws and regulations when using Mirael.
              </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">Prohibited Uses</h3>
              <p className="text-mir-text-secondary mb-3">You agree not to:</p>
              <ul className="space-y-2 text-mir-text-secondary">
                <li>
                  • Submit content that is unlawful, harmful, defamatory, harassing, abusive, or otherwise objectionable
                </li>
                <li>• Attempt to gain unauthorized access to systems or networks</li>
                <li>
                  • Use Mirael for medical diagnosis, emergency response, or as a substitute for professional therapy
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* <!-- Nature of Service --> */}
        <section className="mb-12">
          <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
            <h2 className="text-2xl font-bold mb-3">What Mirael Is (And Isn't)</h2>
            <p className="mb-4 opacity-90">
              Mirael is an emotional reflection and clarity tool powered by AI. It is not a medical device, mental
              health service, or therapy substitute.
            </p>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.1)] mt-4">
              <p className="text-sm opacity-90">
                <strong>Medical Disclaimer:</strong> We do not provide medical, psychiatric, or psychological advice.
                Always seek the advice of a qualified health provider regarding mental health or medical conditions.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- AI and Content --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">AI and Your Content</h2>
          <div className="space-y-6">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">AI-Generated Responses</h3>
              <p className="text-mir-text-secondary">
                Mirael uses stateless AI inference to generate reflective responses and insights. These outputs are
                generated automatically and are not guaranteed to be accurate or appropriate in all contexts.
              </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">Your Content Rights</h3>
              <p className="text-mir-text-secondary">
                You retain ownership of content you submit to Mirael. However, you grant us a non-exclusive, worldwide,
                royalty-free license to process, store, and use such content to provide and improve the Service.
              </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">Content Moderation</h3>
              <p className="text-mir-text-secondary">
                We reserve the right to remove or restrict access to content that violates these Terms.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Fees and Payments --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Fees and Payments</h2>
            <div className="space-y-3 text-mir-text-secondary">
              <p>
                Certain features may require a subscription or payment. Fees, billing cycles, and cancellation terms
                will be disclosed at the time of purchase.
              </p>
              <p>Payments are processed through third-party providers. We do not store payment card details.</p>
              <div className="p-3 rounded-lg bg-mir-bg-input">
                <p className="text-sm">
                  <strong className="text-mir-text-primary">Refund Policy:</strong> Unless required by law, payments are
                  non-refundable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- Termination --> */}
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
          <div className="mt-4 p-4 rounded-xl bg-mir-bg-soft border border-[rgba(255,107,90,0.15)]">
            <p className="text-sm text-mir-text-secondary">
              <strong>Effect of Termination:</strong> Upon termination, all rights granted to you under these Terms will
              immediately cease.
            </p>
          </div>
        </section>

        {/* <!-- Intellectual Property --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
            <p className="text-mir-text-secondary mb-3">
              Mirael, including its design, features, software, and trademarks, is owned by Mirael, Inc. and protected
              by intellectual property laws.
            </p>
            <p className="text-sm text-mir-text-secondary italic">
              You may not use Mirael's trademarks or branding without our prior written permission.
            </p>
          </div>
        </section>

        {/* <!-- Disclaimers --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Disclaimers</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">"As-Is" Service</h3>
              <p className="text-mir-text-secondary">
                Mirael is provided on an "as-is" and "as-available" basis without warranties of any kind. We do not
                warrant that Mirael will be error-free, uninterrupted, secure, or that results will be reliable or
                accurate.
              </p>
            </div>

            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-xl font-semibold mb-3">Health Disclaimer</h3>
              <p className="text-mir-text-secondary">
                Mirael is not a substitute for professional diagnosis, treatment, or crisis support. Always consult
                qualified healthcare professionals for medical or mental health concerns.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Limitation of Liability --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-mir-text-secondary mb-3">
              To the maximum extent permitted by law, Mirael, Inc. and its affiliates shall not be liable for indirect,
              incidental, special, consequential, or punitive damages.
            </p>
            <div className="p-4 rounded-xl bg-mir-bg-input">
              <p className="text-sm text-mir-text-secondary">
                <strong>Liability Cap:</strong> Our total liability for any claim arising out of or relating to the
                Service is limited to the amount you paid us in the 12 months preceding the claim, or $50 if no payment
                was made.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Indemnification --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
            <p className="text-mir-text-secondary">
              You agree to indemnify and hold harmless Mirael, Inc. and its affiliates from any claims, damages,
              liabilities, costs, and expenses arising out of your use of the Service, your violation of these Terms, or
              your violation of any law or rights of a third party.
            </p>
          </div>
        </section>

        {/* <!-- Governing Law --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Governing Law and Disputes</h2>
            <div className="space-y-3 text-mir-text-secondary">
              <p>
                These Terms are governed by the laws applicable to Mirael, Inc. without regard to conflict of laws
                principles.
              </p>
              <p>
                Disputes shall be resolved in the courts of the jurisdiction where Mirael, Inc. is registered, unless
                otherwise required by law.
              </p>
              <p>
                We may require certain disputes to be resolved through binding arbitration. Specific arbitration rules
                will be disclosed if applicable.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Additional Terms --> */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Additional Terms</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-lg font-semibold mb-2">Third-Party Services</h3>
              <p className="text-sm text-mir-text-secondary">
                Mirael may contain links or integrations to third-party services. We are not responsible for third-party
                content, policies, or practices.
              </p>
            </div>
            <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
              <h3 className="text-lg font-semibold mb-2">Export Controls</h3>
              <p className="text-sm text-mir-text-secondary">
                You may not use or export Mirael in violation of applicable export laws and regulations.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Changes to Terms --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Changes to These Terms</h2>
            <p className="text-mir-text-secondary mb-3">
              We may modify these Terms at any time. Changes will be effective when posted or when communicated to you
              within the Service.
            </p>
            <p className="text-sm text-mir-text-secondary italic">
              Your continued use of Mirael after changes indicates your acceptance of the updated Terms.
            </p>
          </div>
        </section>

        {/* <!-- Entire Agreement --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Entire Agreement</h2>
            <p className="text-mir-text-secondary">
              These Terms constitute the entire agreement between you and Mirael, Inc. regarding the Service and
              supersede all prior agreements relating to the subject matter hereof.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
