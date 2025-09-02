const TermsOfUseResponsibilities = () => {
  return (
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
          <ul className="space-y-2 text-mir-text-secondary list-disc list-inside [&>li]:list-item [&>li]">
            <li>
              Submit content that is unlawful, harmful, defamatory, harassing, abusive, or otherwise objectionable
            </li>
            <li>Attempt to gain unauthorized access to systems or networks</li>
            <li>Use Mirael for medical diagnosis, emergency response, or as a substitute for professional therapy</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TermsOfUseResponsibilities;
