const TermsOfUseDisclaimer = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Disclaimers</h2>
      <div className="space-y-4">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">"As-Is" Service</h3>
          <p className="text-mir-text-secondary">
            Mirael is provided on an "as-is" and "as-available" basis without warranties of any kind. We do not warrant
            that Mirael will be error-free, uninterrupted, secure, or that results will be reliable or accurate.
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
  );
};

export default TermsOfUseDisclaimer;
