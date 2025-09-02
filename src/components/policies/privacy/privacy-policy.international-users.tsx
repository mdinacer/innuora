const PrivacyPolicyInternationalUsers = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">International Users</h2>
      <div className="space-y-4">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-lg font-semibold mb-2">EU/EEA Users (GDPR)</h3>
          <p className="text-mir-text-secondary">
            EU and EEA users have additional rights under GDPR. We will respond to GDPR rights requests and provide data
            processing information relevant to EU residents upon request.
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
  );
};

export default PrivacyPolicyInternationalUsers;
