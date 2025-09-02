const TermsOfUseFeesAndPayment = () => {
  return (
    <section className="mb-12">
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
        <h2 className="text-2xl font-bold mb-4">Fees and Payments</h2>
        <div className="space-y-3 text-mir-text-secondary">
          <p>
            Certain features may require a subscription or payment. Fees, billing cycles, and cancellation terms will be
            disclosed at the time of purchase.
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
  );
};

export default TermsOfUseFeesAndPayment;
