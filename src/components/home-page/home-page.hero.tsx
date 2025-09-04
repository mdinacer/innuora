export default function HomePageHero() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-mir-bg-accent/25 bg-mir-bg-soft px-3 py-1 text-[13px] font-semibold text-mir-bg-accent">
        Early Access
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
        A mirror for your inner world
      </h1>
      <p className="text-lg md:text-xl text-mir-text-secondary max-w-2xl mx-auto mb-8">
        Mirael helps you slow down, notice patterns, and find clarity when life feels overwhelming — through reflective,
        emotionally attuned conversations.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
        <a
          href="#early-access"
          className="inline-flex justify-center rounded-2xl bg-mir-bg-accent px-6 py-3 text-white font-semibold shadow hover:translate-y-[-1px] transition"
        >
          Join early access
        </a>
        <a
          href="#demo"
          className="inline-flex justify-center rounded-2xl border border-mir-border-light bg-transparent px-6 py-3 font-semibold text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
        >
          See a conversation
        </a>
      </div>
      <p className="text-sm text-mir-text-secondary max-w-xl mx-auto">
        <em>
          Mirael is not therapy or a crisis service. If you’re in immediate danger, contact local emergency services.
        </em>
      </p>
    </section>
  );
}
