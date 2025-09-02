import PoliciesFooter from "@/components/policies/policies.footer";
import PoliciesHeader from "@/components/policies/policies.header";
import PrivacyPolicyChangesNotice from "@/components/policies/privacy/privacy-policy.changes-notice";
import PrivacyPolicyContactInformation from "@/components/policies/privacy/privacy-policy.contact-information";
import PrivacyPolicyDataCollection from "@/components/policies/privacy/privacy-policy.data-collection";
import PrivacyPolicyDataRetention from "@/components/policies/privacy/privacy-policy.data-retention";
import PrivacyPolicyDataSecurity from "@/components/policies/privacy/privacy-policy.data-security";
import PrivacyPolicyDataUsage from "@/components/policies/privacy/privacy-policy.data-usage";
import PrivacyPolicyHero from "@/components/policies/privacy/privacy-policy.hero";
import PrivacyPolicyInternationalUsers from "@/components/policies/privacy/privacy-policy.international-users";
import PrivacyPolicyKeyPrinciples from "@/components/policies/privacy/privacy-policy.key-principles";
import PrivacyPolicySafetyNotice from "@/components/policies/privacy/privacy-policy.safety-notice";
import PrivacyPolicyUserRights from "@/components/policies/privacy/privacy-policy.user-rights";

export default function PrivacyPolicyRoute() {
  return (
    <main className="relative font-sans min-h-screen pt-20 w-screen overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      {/* <!-- Header --> */}
      <PoliciesHeader />
      {/* <!-- Hero Section --> */}
      <PrivacyPolicyHero />
      {/* <!-- Key Principles --> */}
      <PrivacyPolicyKeyPrinciples />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* <!-- Contact Information --> */}
        <PrivacyPolicyContactInformation />
        {/* <!-- Data We Collect --> */}
        <PrivacyPolicyDataCollection />
        {/* <!-- How We Use Your Data --> */}
        <PrivacyPolicyDataUsage />
        {/* <!-- User Rights --> */}
        <PrivacyPolicyUserRights />
        {/* <!-- Data Retention --> */}
        <PrivacyPolicyDataRetention />
        {/* <!-- Security --> */}
        <PrivacyPolicyDataSecurity />
        {/* <!-- Safety Notice --> */}
        <PrivacyPolicySafetyNotice />
        {/* <!-- International Users --> */}
        <PrivacyPolicyInternationalUsers />
        {/* <!-- Changes to Policy --> */}
        <PrivacyPolicyChangesNotice />
      </div>
      {/* <!-- Footer --> */}
      <PoliciesFooter currentPage="privacy" />
    </main>
  );
}
