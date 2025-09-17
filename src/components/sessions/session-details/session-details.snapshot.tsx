import React from "react";
import Link from "next/link";
import { ListChecksIcon } from "lucide-react";

import { Badge } from "@/components/mir-ui/badge";
import Card from "@/components/mir-ui/card";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsSnapshot: React.FC<Props> = ({ className, session }) => {
  const { analysisSnapshots } = session;

  // take last 3 updates for snapshot view
  const updates = analysisSnapshots.slice(-3);

  return (
    <Card className={className}>
      <div className="flex items-center gap-2 mb-4">
        <ListChecksIcon className="size-5 text-mir-bg-accent" />
        <h2 className="text-xl font-bold">Analysis Snapshots</h2>
        <Badge variant="default">{updates.length} updates</Badge>
      </div>

      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update, idx) => {
            // sort distortions by severity
            const topDistortion = update.distortions
              .sort((a, b) => {
                const rank = { mild: 1, moderate: 2, severe: 3 };
                return rank[b.severity] - rank[a.severity];
              })
              .slice(0, 1)[0];

            // sort themes by frequency
            const topTheme = update.themes
              .sort((a, b) => {
                const rank = { occasional: 1, frequent: 2, pervasive: 3 };
                return rank[b.frequency] - rank[a.frequency];
              })
              .slice(0, 1)[0];

            const belief = update.core_beliefs?.[0]?.belief;
            const rule = update.silent_rules?.[0]?.rule;
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-mir-bg-input">
                <div
                  className={`w-2 h-2 rounded-full ${
                    update.intensity === "low"
                      ? "bg-blue-500"
                      : update.intensity === "moderate"
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                ></div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {idx === updates.length - 1
                        ? "Final Analysis"
                        : idx === 0
                          ? "Initial Assessment"
                          : "Mid-session Update"}
                    </span>
                  </div>

                  <p className="text-sm text-mir-text-secondary">
                    Focus: {update.core_module ?? "general"} • Intensity: {update.intensity} • Crisis: {update.crisis}
                  </p>

                  {topTheme && (
                    <p className="text-sm">
                      <span className="font-medium">Theme:</span> {topTheme.theme} ({topTheme.frequency})
                    </p>
                  )}

                  {topDistortion && (
                    <p className="text-sm">
                      <span className="font-medium">Distortion:</span> {topDistortion.type} ({topDistortion.severity}) —{" "}
                      <Link
                        href={`/learn/${topDistortion.type.toLowerCase().replace(/\s+/g, "-")}`}
                        className="underline text-mir-accent"
                      >
                        learn more
                      </Link>
                    </p>
                  )}

                  {belief && (
                    <p className="text-sm">
                      <span className="font-medium">Core belief:</span> {belief}
                    </p>
                  )}

                  {rule && (
                    <p className="text-sm">
                      <span className="font-medium">Silent rule:</span> {rule}
                    </p>
                  )}

                  <p className="text-xs text-mir-text-secondary">Engagement: {update.therapeutic_readiness}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-mir-text-secondary">No analysis snapshots available for this session.</div>
      )}
    </Card>
  );
};

export default SessionDetailsSnapshot;
