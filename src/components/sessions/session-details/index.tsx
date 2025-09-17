"use client";

import React from "react";

import SessionDetailsAnalysis from "@/components/sessions/session-details/session-details.analysis";
import SessionDetailsDangerZone from "@/components/sessions/session-details/session-details.danger-zone";
import SessionDetailsHeader from "@/components/sessions/session-details/session-details.header";
import SessionDetailsQuickActions from "@/components/sessions/session-details/session-details.quick-actions";
import SessionDetailsSnapshot from "@/components/sessions/session-details/session-details.snapshot";
import SessionDetailsSummary from "@/components/sessions/session-details/session-details.summary";
import SessionDetailsSyncStatus from "@/components/sessions/session-details/session-details.sync-status";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { cn } from "@/lib/utils";

interface Props {
  session: Session;
  className?: string;
}

const SessionDetailsPage: React.FC<Props> = ({ session, className }) => {
  return (
    <div className={cn(" max-w-4xl w-full mx-auto mt-20 p-4", className)}>
      {/* <!-- Session Header --> */}
      <SessionDetailsHeader session={session} />

      {/* <!-- Main Content Grid --> */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* <!-- Left Column - Primary Content --> */}
        <div className="lg:col-span-2 space-y-6">
          {/* <!-- Session Analysis --> */}
          <SessionDetailsAnalysis session={session} />

          {/* <!-- Session Summary --> */}
          <SessionDetailsSummary session={session} />

          {/* <!-- Analysis History --> */}
          <SessionDetailsSnapshot session={session} />
        </div>

        {/* <!-- Right Column - Actions & Info --> */}
        <div className="space-y-6">
          {/* <!-- Quick Actions --> */}
          <SessionDetailsQuickActions session={session} />

          {/* <!-- Cloud Sync Status --> */}
          <SessionDetailsSyncStatus session={session} />

          {/* <!-- Danger Zone --> */}
          <SessionDetailsDangerZone session={session} />
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsPage;
