const HomePageDemo = () => {
  return (
    <section id="demo" className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">A glimpse of Mirael</h2>
        <p className="text-[17px] text-inn-text-secondary max-w-2xl mx-auto">
          Here’s how Mirael mirrors back emotions with clarity and care:
        </p>
      </div>
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-card space-y-4">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl border border-inn-border-light bg-inn-bg-input px-4 py-3 text-sm">
            I feel stuck and weighed down by everything.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl bg-inn-bg-accent px-4 py-3 text-sm text-white">
            It sounds like there’s a heaviness you’re carrying. What part of that weight feels most present right now?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl border border-inn-border-light bg-inn-bg-input px-4 py-3 text-sm">
            Mostly pressure at work. I can’t seem to shut it off at night.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl bg-inn-bg-accent px-4 py-3 text-sm text-white">
            So even after work ends, the pressure follows you. That must be exhausting. How do you usually cope when
            that pressure shows up?
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageDemo;
