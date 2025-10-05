import { listTesters } from "@/app/actions/tester-actions";
import TesterManagementClient from "@/components/admin/tester-management-client";

export default async function TestersPage() {
  const testers = await listTesters();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-inn-text-primary mb-2">Tester Applications</h2>
        <p className="text-inn-text-secondary">
          Manage tester applications from the join page. Accept or reject applications to grant platform access.
        </p>
      </div>

      <TesterManagementClient initialTesters={testers} />
    </div>
  );
}
