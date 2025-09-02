export const dynamic = "force-static";
export default function EULARoute() {
  return (
    <main className="relative font-sans min-h-screen pt-20 w-screen overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Hero Section --> */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          End User License Agreement
        </h1>
        <p className="text-lg md:text-xl text-mir-text-secondary max-w-2xl mx-auto mb-6">
          This agreement governs your use of the Mirael application and defines the terms under which you may access our
          software.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent">
          Last Updated September 2, 2025
        </div>
      </section>

      {/* <!-- Agreement Notice --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
          <h2 className="text-2xl font-bold mb-3">Important Legal Agreement</h2>
          <p className="mb-4 opacity-90">
            By downloading, installing, or using Mirael, you agree to be bound by the terms of this End User License
            Agreement.
          </p>
          <p className="text-sm opacity-80">If you do not agree to these terms, do not install or use Mirael.</p>
        </div>
      </section>

      {/* <!-- Main Content --> */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Acceptance of Agreement --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Acceptance of Agreement</h2>
            <p className="text-mir-text-secondary">
              By downloading, installing, or using Mirael, you agree to be bound by the terms of this End User License
              Agreement (EULA). If you do not agree, do not install or use Mirael.
            </p>
          </div>
        </section>

        {/* <!-- License Grant --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">License Grant</h2>
            <p className="text-mir-text-secondary">
              Mirael grants you a limited, non-exclusive, non-transferable, revocable license to use the application for
              personal, non-commercial purposes in accordance with this EULA.
            </p>
          </div>
        </section>

        {/* <!-- License Restrictions --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">License Restrictions</h2>
            <p className="text-mir-text-secondary mb-4">You agree that you will not:</p>
            <ul className="space-y-3 text-mir-text-secondary">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-acctext-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>Reverse engineer, decompile, or disassemble Mirael</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-acctext-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>Rent, lease, lend, sell, redistribute, or sublicense Mirael</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-acctext-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>Use Mirael in any manner that violates applicable laws or regulations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-acctext-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>Attempt to circumvent security measures or access Mirael's source code</span>
              </li>
            </ul>
          </div>
        </section>

        {/* <!-- Intellectual Property Ownership --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Intellectual Property Ownership</h2>
            <p className="text-mir-text-secondary">
              All rights, title, and interest in Mirael, including all content, design, and software, remain the
              exclusive property of Mirael and its licensors. This EULA does not grant you ownership of any part of
              Mirael.
            </p>
          </div>
        </section>

        {/* <!-- Updates and Modifications --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Updates and Modifications</h2>
            <p className="text-mir-text-secondary">
              Mirael may, at its discretion, provide updates, patches, or modifications to the application. This EULA
              applies to all such updates unless they are accompanied by a separate license agreement.
            </p>
          </div>
        </section>

        {/* <!-- Termination --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p className="text-mir-text-secondary mb-3">
              This EULA is effective until terminated. Mirael may suspend or terminate your access at any time without
              notice if you breach any of its terms.
            </p>
            <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
              <p className="text-sm text-mir-text-secondary">
                <strong>Upon Termination:</strong> You must immediately uninstall Mirael and cease all use of the
                application.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Disclaimer of Warranties --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Disclaimer of Warranties</h2>
            <p className="text-mir-text-secondary">
              Mirael is provided "as is" without warranties of any kind, express or implied, including but not limited
              to warranties of fitness for a particular purpose, reliability, or availability.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-mir-bg-input">
              <p className="text-sm text-mir-text-secondary">
                This means we cannot guarantee that the app will work perfectly or meet all your expectations, though we
                strive to provide the best experience possible.
              </p>
            </div>
          </div>
        </section>

        {/* <!-- Limitation of Liability --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-mir-text-secondary">
              To the maximum extent permitted by law, Mirael and its affiliates shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the application.
            </p>
          </div>
        </section>

        {/* <!-- Governing Law --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-mir-text-secondary">
              This EULA shall be governed by and construed in accordance with the laws of the applicable jurisdiction in
              which Mirael is made available, without regard to conflict of law provisions.
            </p>
          </div>
        </section>

        {/* <!-- Contact Information --> */}
        <section className="mb-12">
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_2px_8px] shadow-black/5">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-mir-text-secondary mb-4">
              For any questions regarding this End User License Agreement, please contact us:
            </p>
            <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
              <p className="font-medium text-mir-text-primary">Email Support</p>
              <a href="mailto:support@mirael.app" className="text-mir-bg-accent hover:underline">
                support@mirael.app
              </a>
            </div>
          </div>
        </section>

        {/* <!-- Summary Notice --> */}
        <section className="mb-12">
          <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-mir-bg-accent to-mir-bg-accent-dark">
            <h2 className="text-2xl font-bold mb-3">Agreement Summary</h2>
            <p className="mb-4 opacity-90">
              This EULA grants you permission to use Mirael for personal purposes while protecting our intellectual
              property rights and limiting liability.
            </p>
            <p className="text-sm opacity-80">
              By continuing to use Mirael, you acknowledge that you have read, understood, and agree to be bound by
              these terms.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
