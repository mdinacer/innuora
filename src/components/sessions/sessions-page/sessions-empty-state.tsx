import { FileTextIcon, PlusIcon } from "lucide-react";

import SessionForm from "../session-form";

const SessionsEmptyState = () => {
  return (
    <div id="emptyState" className="text-center py-16 ">
      <div className="w-20 h-20 mx-auto rounded-full bg-mir-bg-soft border border-mib-bg-accent/25 flex items-center justify-center mb-6">
        <FileTextIcon className="size-8 text-mir-bg-accent" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
      <p className="text-mir-text-secondary mb-6 max-w-md mx-auto">
        Start your first reflection session to begin your journey of emotional clarity and self-discovery.
      </p>
      <SessionForm
        trigger={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px]">
            <PlusIcon className="size-4" />
            Start Reflecting
          </button>
        }
      />
      {/* <button className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px]">
        <PlusIcon className="size-4" />
        Start Reflecting
      </button> */}
    </div>
  );
};

export default SessionsEmptyState;
