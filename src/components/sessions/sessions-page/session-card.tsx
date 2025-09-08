"use client";

import React from "react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { format } from "date-fns";
import { ChevronRightIcon, EllipsisVerticalIcon, PencilIcon, TextIcon, TrashIcon } from "lucide-react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";

interface Props {
  session: Session;
}

function getDistinctThemes(analyses: StateAnalysis[]) {
  if (!Array.isArray(analyses)) return [];

  const themeSet = new Set<string>();

  analyses.forEach((analysis) => {
    if (analysis && Array.isArray(analysis.themes)) {
      analysis.themes.forEach((theme) => {
        if (theme) {
          // normalize (replace underscores, lowercased, trimmed)
          const normalized = theme.replace(/_/g, " ").trim().toLowerCase();
          themeSet.add(normalized);
        }
      });
    }
  });

  // Return as array with capitalized first letters
  return Array.from<string>(themeSet).map((theme) => theme.charAt(0).toUpperCase() + theme.slice(1));
}

const SessionCard: React.FC<Props> = ({ session }) => {
  const primaryAnalysis = session.analysis?.[0];
  const hasMultipleAnalyses = session.analysis.length > 1;
  const themeSet = getDistinctThemes(session.analysis);

  return (
    <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-card cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-mir-bg-soft border border-mir-bg-accent/25 flex items-center justify-center">
          <TextIcon className="size-5 text-mir-bg-accent" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            8 min
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--bg-accent)] transition flex-1">
          {session.title}
        </h3>

        {session.aiSuggestedTitle ? (
          <div className="ml-2 flex-shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--bg-accent)"
              strokeWidth="2"
              className="opacity-70"
            >
              <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
        ) : (
          ""
        )}
      </div>

      {session.subtitle && <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{session.subtitle}</p>}

      <div className="flex flex-wrap gap-1 mb-4">
        {themeSet.map((theme, index) => (
          <span
            key={index}
            className="inline-flex capitalize items-center px-2 py-1 rounded-lg bg-mir-bg-soft text-xs text-[var(--text-secondary)] border border-[rgba(255,107,90,0.15)]"
          >
            {/* {JSON.stringify(theme.replace(/_/g, " "))} */}
            {theme.replace(/_/g, " ")}
          </span>
        ))}

        {primaryAnalysis.themes.length > 3 && (
          <span className="text-xs text-[var(--text-secondary)] px-2 py-1">+{primaryAnalysis.themes.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasMultipleAnalyses ? (
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-1 rounded-full">
              {session.analysis.length} insights
            </span>
          ) : (
            ""
          )}
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--bg-accent)] hover:text-[var(--text-primary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
    // <div className="rounded-2xl flex flex-col border border-mir-bg-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-md cursor-pointer group">
    //   <div className="w-full flex items-center justify-between">
    //     <span className="text-xs text-mir-text-secondary">{format(session.createdAt, "PPP")}</span>

    //     <button>
    //       <EllipsisVerticalIcon className="size-5" />
    //     </button>
    //   </div>
    //   <Separator />
    //   <div className="flex items-start gap-4 justify-end mb-4">
    //     <button className="flex items-center  gap-2 text-xs text-mir-text-secondary hover:text-mir-bg-accent transition-all">
    //       <PencilIcon className="size-5" />
    //     </button>
    //     <button className="flex items-center  gap-2 text-xs text-mir-text-secondary hover:text-mir-bg-accent transition-all">
    //       <TrashIcon className="size-5" />
    //     </button>
    //   </div>

    //   <div className="flex items-center gap-2 mb-2">
    //     <TextIcon className="size-5 text-mir-bg-accent" />
    //     <h3 className="font-semibold capitalize text-mir-text-primary  group-hover:text-mir-bg-accent transition">
    //       {session.title}
    //     </h3>
    //   </div>
    //   <p className="text-sm text-mir-text-secondary mb-4 line-clamp-2">{session.subtitle}</p>

    //   <div className="flex items-center justify-between">
    //     <span className="text-xs text-mir-text-secondary">{format(session.createdAt, "PPP")}</span>
    //     <button className="opacity-0 group-hover:opacity-100 transition-opacity text-mir-bg-accent hover:text-mir-text-primary">
    //       <ChevronRightIcon className="size-4 rtl:rotate-180" />
    //     </button>
    //   </div>
    // </div>
  );
};

export default SessionCard;
