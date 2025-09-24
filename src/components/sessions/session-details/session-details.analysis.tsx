import React, { useCallback, useState } from "react";
import Link from "next/link";
import { ChartBarIcon } from "lucide-react";

import { Badge } from "@/components/mir-ui/badge";
import { Button } from "@/components/mir-ui/button";
import Card from "@/components/mir-ui/card";
import { updateStoreSession } from "@/domains/encrypted-session/encrypted-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import { combineToSessionAnalysis } from "@/domains/session-analysis/session-analysis.utils";

interface Props {
  className?: string;
  session: Session;
}

function topN<T extends { count: number }>(items: T[], n = 3): T[] {
  return [...items].sort((a, b) => b.count - a.count).slice(0, n);
}

const SessionDetailsAnalysis: React.FC<Props> = ({ className, session }) => {
  const [aggregatedAnalysis, setAggregatedAnalysis] = useState<SessionAnalysis | null>(session.aggregatedAnalysis);

  const handleGenerateAnalysis = useCallback(async () => {
    if (session.analysisSnapshots.length === 0) {
      console.log("No analysis snapshots found");
      return;
    }

    const analysis = combineToSessionAnalysis(session.analysisSnapshots);

    await updateStoreSession(session.id, { ...session, aggregatedAnalysis: analysis });

    setAggregatedAnalysis(analysis);
  }, [session]);

  const topDistortion = aggregatedAnalysis ? topN(aggregatedAnalysis.distortions, 1)[0] : undefined;
  const topTheme = aggregatedAnalysis ? topN(aggregatedAnalysis.themes, 1)[0] : undefined;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="size-5 text-inn-bg-accent" />
          <h2 className="text-xl font-bold">Session Analysis</h2>
          {aggregatedAnalysis && (
            <Badge variant="orange" className="uppercase">
              {aggregatedAnalysis.intensity}
            </Badge>
          )}
        </div>
        {!aggregatedAnalysis && (
          <Button variant={"outline"} onClick={handleGenerateAnalysis}>
            Generate
          </Button>
        )}
      </div>
      {aggregatedAnalysis && (
        <>
          <div className="space-y-6 text-sm">
            {/* Narrative */}
            <p>
              This session showed <strong>{aggregatedAnalysis.intensity} intensity</strong> with{" "}
              <strong>{aggregatedAnalysis.crisis.replace(/_/g, " ")} crisis signs</strong>. The most common struggles
              were around{" "}
              <span className="capitalize">
                {topN(aggregatedAnalysis.themes)
                  .map((t) => t.theme.replace(/_/g, " "))
                  .join(", ")}
              </span>
              .
            </p>

            {/* Themes */}
            <div>
              <h3 className="font-semibold mb-2">Key Themes</h3>
              <ul className="list-disc pl-5 gap-2">
                {topN(aggregatedAnalysis.themes).map((t, i) => (
                  <li key={i} className="mb-1 list-item">
                    <strong className=" capitalize">{t.theme.replace(/_/g, " ")}</strong>{" "}
                    <Badge variant="default">{t.frequency}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            {/* Distortions */}
            <div>
              <h3 className="font-semibold mb-2">Cognitive Distortions</h3>
              <ul className="list-disc pl-5">
                {topN(aggregatedAnalysis.distortions).map((d, i) => (
                  <li key={i} className="mb-1 list-item">
                    <Link href={`/learn/distortions/${d.type}`} className="underline text-inn-accent capitalize">
                      {d.type.replace(/_/g, " ").replace(/-/g, " ")}
                    </Link>{" "}
                    - <Badge>{d.severity}</Badge>, <Badge variant="info">{d.count} times</Badge>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Beliefs */}
            <div>
              <h3 className="font-semibold mb-2">Core Beliefs</h3>
              <ul className="list-disc pl-5 italic">
                {topN(aggregatedAnalysis.core_beliefs).map((b, i) => (
                  <li key={i} className="mb-1 list-item">
                    {b.belief}
                  </li>
                ))}
              </ul>
            </div>

            {/* Silent Rules */}
            <div>
              <h3 className="font-semibold mb-2">Silent Rules</h3>
              <ul className="list-disc pl-5">
                {topN(aggregatedAnalysis.silent_rules).map((r, i) => (
                  <li key={i} className="mb-1 list-item">
                    “{r.rule}” <Badge className="uppercase">{r.rigidity}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action */}
          <p className="text-sm mt-6">
            👉 Next step: Explore{" "}
            {topDistortion && (
              <Link href={`/learn/distortions/${topDistortion.type}`} className="underline text-inn-accent">
                reframing {topDistortion.type.replace(/_/g, " ")}
              </Link>
            )}
            {topTheme && (
              <>
                {" "}
                and{" "}
                <Link href={`/learn/themes/${topTheme.theme}`} className="underline text-inn-accent">
                  working through {topTheme.theme.replace(/_/g, " ")}
                </Link>
              </>
            )}
            .
          </p>
        </>
      )}
    </Card>
  );
};

export default SessionDetailsAnalysis;
