const TermsOfUseLiabilityLimitation = () => {
  return (
    <section className="mb-12">
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
        <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
        <p className="text-mir-text-secondary mb-3">
          To the maximum extent permitted by law, Mirael, Inc. and its affiliates shall not be liable for indirect,
          incidental, special, consequential, or punitive damages.
        </p>
        <div className="p-4 rounded-xl bg-mir-bg-input">
          <p className="text-sm text-mir-text-secondary">
            <strong>Liability Cap:</strong> Our total liability for any claim arising out of or relating to the Service
            is limited to the amount you paid us in the 12 months preceding the claim, or $50 if no payment was made.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfUseLiabilityLimitation;
