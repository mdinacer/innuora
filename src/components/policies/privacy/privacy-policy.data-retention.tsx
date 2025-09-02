const PrivacyPolicyDataRetention = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">How Long We Keep Your Data</h2>
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
        <p className="text-mir-text-secondary mb-4">
          We retain personal data only as long as necessary for the purpose collected or to satisfy legal obligations:
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
  );
};

export default PrivacyPolicyDataRetention;
