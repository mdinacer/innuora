const FAQ_ITEMS = [
  {
    question: "Is this therapy?",
    answer:
      "No. Mirael is a reflective tool for daily emotional check-ins. It is not therapy or a replacement for professional help.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Mirael uses conversational patterns and reflective prompts designed to mirror emotions and surface patterns. The system is evolving with user feedback.",
  },
  {
    question: "Is my data private?",
    answer:
      "Conversations are private by design. We aim for minimal data retention and user control. In production, you will be able to export and delete your data.",
  },
  {
    question: "Can I use Mirael for therapy?",
    answer:
      "No. Mirael is a reflective tool for daily emotional check-ins. It is not therapy or a replacement for professional help.",
  },
];

const HomePageFAQ = () => {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <details key={index} className="rounded-xl border border-mir-border-light bg-mir-bg-card p-4">
            <summary className="cursor-pointer select-none list-none font-semibold">{item.question}</summary>
            <p className="mt-2 text-mir-text-secondary">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default HomePageFAQ;
