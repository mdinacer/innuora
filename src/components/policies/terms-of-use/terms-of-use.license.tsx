const TermsOfUseLicense = () => {
  return (
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
          <ul className="space-y-2 text-mir-text-secondary list-disc list-inside">
            <li>Copy, modify, distribute, sell, or lease any part of the Service</li>
            <li>Reverse engineer, decompile, or attempt to extract source code (except as permitted by law)</li>
            <li>Use Mirael to build competitive products or services</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TermsOfUseLicense;
