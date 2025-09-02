const PrivacyPolicySafetyNotice = () => {
  return (
    <section className="mb-12">
      <div className="rounded-2xl p-8 text-center text-white bg-gradient-to-b from-[#FF6B5A] to-mir-bg-accent-dark">
        <h2 className="text-2xl font-bold mb-3">Important Safety Notice</h2>
        <p className="mb-4 ">
          Mirael is NOT a crisis or emergency service and does not replace professional mental health care.
        </p>
        <p className="text-base opacity-90">
          If content suggests imminent harm or severe risk, the Service may prompt resources and recommend contacting
          local emergency services. If we believe there is an imminent threat to life or safety and are legally
          compelled to act, we may disclose information to emergency services as required by law.
        </p>
      </div>
    </section>
  );
};

export default PrivacyPolicySafetyNotice;
