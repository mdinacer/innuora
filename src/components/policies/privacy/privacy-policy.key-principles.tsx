const KEY_PRINCIPLES = [
  "We minimize the personal data we collect",
  "We separate ephemeral session processing from persistent storage",
  "We treat sensitive emotional content with heightened safeguards",
  "We minimize the exposure of your data to third parties",
];

const PrivacyPolicyKeyPrinciples = () => {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-12">
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Privacy Principles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {KEY_PRINCIPLES.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
              <p className="text-[var(--text-secondary)]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyKeyPrinciples;
