const TermsOfUseEligibility = () => {
  return (
    <section className="mb-12">
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
        <h2 className="text-2xl font-bold mb-4">Eligibility</h2>
        <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15 mb-4">
          <p className="text-sm font-semibold text-mir-text-primary">Age Requirement: 18+</p>
        </div>
        <p className="text-mir-text-secondary">
          By using Mirael, you represent and warrant that you are at least 18 years old (or the legal age of majority in
          your jurisdiction) and have the legal capacity to enter into these Terms.
        </p>
      </div>
    </section>
  );
};

export default TermsOfUseEligibility;
