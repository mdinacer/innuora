const MIRAEL_FEATURES = [
  {
    title: "Reflective Conversations",
    subtitle: "Mirael mirrors back your emotions, helping you name and understand what you're really experiencing.",
  },
  {
    title: "Spotting Patterns",
    subtitle:
      "Over time, Mirael highlights recurring themes in your thinking so you can see connections you might miss.",
  },
  {
    title: "Private by Default",
    subtitle: "Your reflections are yours alone. Conversations are private and under your control.",
  },
];

const HomePageHowItHelps = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">How Mirael helps</h2>
        <p className="text-[17px] text-mir-text-secondary max-w-3xl mx-auto">
          Designed as a gentle mirror, Mirael helps you explore feelings, recognize patterns, and reflect in a private
          space you control.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {MIRAEL_FEATURES.map((feature, index) => (
          <div key={index} className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle">
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-mir-text-secondary">{feature.subtitle}</p>
          </div>
        ))}
        {/* <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle">
          <h3 className="text-xl font-semibold mb-2">Reflective Conversations</h3>
          <p className="text-mir-text-secondary">
            Mirael mirrors back your emotions, helping you name and understand what you’re really experiencing.
          </p>
        </div>
        <div className="rounded-2xl border border-border-mir-border-light bg-mir-bg-card p-6 shadow-subtle">
          <h3 className="text-xl font-semibold mb-2">Spotting Patterns</h3>
          <p className="text-mir-text-secondary">
            Over time, Mirael highlights recurring themes in your thinking so you can see connections you might miss.
          </p>
        </div>
        <div className="rounded-2xl border border-border-mir-border-light bg-mir-bg-card p-6 shadow-subtle">
          <h3 className="text-xl font-semibold mb-2">Private by Default</h3>
          <p className="text-mir-text-secondary">
            Your reflections are yours alone. Conversations are private and under your control.
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default HomePageHowItHelps;
