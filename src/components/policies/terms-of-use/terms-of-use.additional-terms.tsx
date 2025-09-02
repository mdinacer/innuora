const TermsOfUseAdditionalTerms = () => {
  return (
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
  );
};

export default TermsOfUseAdditionalTerms;
