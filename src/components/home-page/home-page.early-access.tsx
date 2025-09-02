const HomePageEarlyAccess = () => {
  return (
    <section id="early-access" className="px-6 py-16">
      <div className="max-w-5xl mx-auto rounded-3xl p-10 text-center text-white bg-gradient-to-br from-[#FF6B5A] to-[#FF8A7A]">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Shape Mirael with us</h2>
        <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8">
          We’re inviting a small group of early testers to try Mirael, share feedback, and help us shape this new kind
          of emotional AI tool.
        </p>
        <form id="waitlistForm" className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-black placeholder:mir-text-secondary dark:placeholder:mir-text-secondary ring-0 border-0 outline-none"
          />
          <button
            type="submit"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-mir-bg-accent transition hover:translate-y-[-1px]"
          >
            Request access
          </button>
        </form>
      </div>
    </section>
  );
};

export default HomePageEarlyAccess;
