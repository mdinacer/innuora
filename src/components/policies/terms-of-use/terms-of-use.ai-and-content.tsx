const TermsOfUseAiAndContent = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">AI and Your Content</h2>
      <div className="space-y-6">
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">AI-Generated Responses</h3>
          <p className="text-mir-text-secondary">
            Mirael uses stateless AI inference to generate reflective responses and insights. These outputs are
            generated automatically and are not guaranteed to be accurate or appropriate in all contexts.
          </p>
        </div>

        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Your Content Rights</h3>
          <p className="text-mir-text-secondary">
            You retain ownership of content you submit to Mirael. However, you grant us a non-exclusive, worldwide,
            royalty-free license to process, store, and use such content to provide and improve the Service.
          </p>
        </div>

        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5">
          <h3 className="text-xl font-semibold mb-3">Content Moderation</h3>
          <p className="text-mir-text-secondary">
            We reserve the right to remove or restrict access to content that violates these Terms.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfUseAiAndContent;
