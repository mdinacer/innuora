import PoliciesFooter from "@/components/policies/policies.footer";
import PoliciesHeader from "@/components/policies/policies.header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PoliciesHeader />
      {children}
      <PoliciesFooter currentPage="terms" />
    </>
  );
}
