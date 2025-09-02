import PoliciesFooter from "@/components/policies/policies.footer";
import PoliciesHeader from "@/components/policies/policies.header";
import TermsOfUseAdditionalTerms from "@/components/policies/terms-of-use/terms-of-use.additional-terms";
import TermsOfUseAgreementNotice from "@/components/policies/terms-of-use/terms-of-use.agreement";
import TermsOfUseAiAndContent from "@/components/policies/terms-of-use/terms-of-use.ai-and-content";
import TermsOfUseContactInformation from "@/components/policies/terms-of-use/terms-of-use.contact-information";
import TermsOfUseDisclaimer from "@/components/policies/terms-of-use/terms-of-use.disclaimer";
import TermsOfUseEligibility from "@/components/policies/terms-of-use/terms-of-use.eligibility";
import TermsOfUseEntireAgreement from "@/components/policies/terms-of-use/terms-of-use.entire-agreement";
import TermsOfUseFeesAndPayment from "@/components/policies/terms-of-use/terms-of-use.fees-and-payment";
import TermsOfUseGoverningLaw from "@/components/policies/terms-of-use/terms-of-use.governing-law";
import TermsOfUseHero from "@/components/policies/terms-of-use/terms-of-use.hero";
import TermsOfUseIndemnification from "@/components/policies/terms-of-use/terms-of-use.indemnification";
import TermsOfUseIntellectualProperty from "@/components/policies/terms-of-use/terms-of-use.intellectual-property";
import TermsOfUseLiabilityLimitation from "@/components/policies/terms-of-use/terms-of-use.liability-limitation";
import TermsOfUseLicense from "@/components/policies/terms-of-use/terms-of-use.license";
import TermsOfUseNatureOfService from "@/components/policies/terms-of-use/terms-of-use.nature-of-service";
import TermsOfUseResponsibilities from "@/components/policies/terms-of-use/terms-of-use.responsibilities";
import TermsOfUseTermination from "@/components/policies/terms-of-use/terms-of-use.termination";
import TermsOfUseTermsChange from "@/components/policies/terms-of-use/terms-of-use.terms-change";

export default function TermsOfUseRoute() {
  return (
    <main className="relative font-sans min-h-screen pt-20 w-screen overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Header --> */}
      <PoliciesHeader />
      {/* <!-- Hero Section --> */}
      <TermsOfUseHero />
      {/* <!-- Agreement Notice --> */}
      <TermsOfUseAgreementNotice />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Contact Information --> */}
        <TermsOfUseContactInformation />
        {/* <!-- Eligibility --> */}
        <TermsOfUseEligibility />
        {/* <!-- License --> */}
        <TermsOfUseLicense />
        {/* <!-- Responsibilities --> */}
        <TermsOfUseResponsibilities />
        {/* <!-- Nature of Service --> */}
        <TermsOfUseNatureOfService />
        {/* <!-- AI and Content --> */}
        <TermsOfUseAiAndContent />
        {/* <!-- Fees and Payment --> */}
        <TermsOfUseFeesAndPayment />
        {/* <!-- Termination --> */}
        <TermsOfUseTermination />
        {/* <!-- Intellectual Property --> */}
        <TermsOfUseIntellectualProperty />
        {/* <!-- Disclaimer --> */}
        <TermsOfUseDisclaimer />
        {/* <!-- Liability Limitation --> */}
        <TermsOfUseLiabilityLimitation />
        {/* <!-- Indemnification --> */}
        <TermsOfUseIndemnification />
        {/* <!-- Governing Law --> */}
        <TermsOfUseGoverningLaw />
        {/* <!-- Additional Terms --> */}
        <TermsOfUseAdditionalTerms />
        {/* <!-- Terms Change --> */}
        <TermsOfUseTermsChange />
        {/* <!-- Entire Agreement --> */}
        <TermsOfUseEntireAgreement />
      </div>

      {/* <!-- Footer --> */}
      <PoliciesFooter currentPage="terms" />
    </main>
  );
}
