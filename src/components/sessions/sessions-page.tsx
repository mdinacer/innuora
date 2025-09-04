"use client";

import React from "react";
import { format } from "date-fns";
import { ChevronRightIcon, ClockIcon, FileTextIcon, FilterIcon, PenIcon, PlusIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SessionCardData = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  duration: string;
};

const PageHeader = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">Your Sessions</h1>
      <p className="text-lg text-mir-text-secondary">
        Review your past reflections and continue your journey of self-discovery
      </p>
    </div>
  );
};
const ActionBar = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg">
          <PlusIcon className="size-4" />
          New Session
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* <!-- Search --> */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-64 rounded-2xl border border-mir-border-light bg-mir-bg-input pl-10 pr-4 py-2 text-sm outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
          />
          <SearchIcon className="size-4 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-mir-text-secondary" />
        </div>

        {/* <!-- Filter --> */}
        <button className="flex items-center gap-2 rounded-2xl border border-mir-border-light bg-mir-bg-card px-4 py-2 text-sm font-medium transition hover:shadow-subtle">
          <FilterIcon className="size-4" />
          Filter
        </button>
      </div>
    </div>
  );
};

const SessionCard = ({ session }: { session: SessionCardData }) => {
  return (
    <div className="rounded-2xl border border-mir-bg-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-md cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-mir-bg-soft border border-mir-bg-accent/25 flex items-center justify-center">
          <PenIcon className="size-5 text-mir-bg-accent" />
        </div>
        <div className="flex items-center gap-2 text-xs text-mir-text-secondary">
          <ClockIcon className="size-3" />
          {session.duration}
        </div>
      </div>

      <h3 className="font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--bg-accent)] transition">
        {session.title}
      </h3>
      <p className="text-sm text-mir-text-secondary mb-4 line-clamp-2">{session.subtitle}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-mir-text-secondary">{format(session.createdAt, "MMM d")}</span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--bg-accent)] hover:text-[var(--text-primary)]">
          <ChevronRightIcon className="size-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
const SessionsGrid = ({ sessions = [] }: { sessions: SessionCardData[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="sessionsGrid">
      {/* <!-- Session cards will be populated by JavaScript --> */}
      {sessions.map((session, index) => (
        <SessionCard key={index} session={session} />
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div id="emptyState" className="text-center py-16 ">
      <div className="w-20 h-20 mx-auto rounded-full bg-mir-bg-soft border border-mib-bg-accent/25 flex items-center justify-center mb-6">
        <FileTextIcon className="size-8 text-mir-bg-accent" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
      <p className="text-mir-text-secondary mb-6 max-w-md mx-auto">
        Start your first reflection session to begin your journey of emotional clarity and self-discovery.
      </p>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px]">
        <PlusIcon className="size-4" />
        Start Reflecting
      </button>
    </div>
  );
};

interface SessionsPageProps {
  className?: string;
  sessions: SessionCardData[];
}

const SessionsPage: React.FC<SessionsPageProps> = ({ className, sessions = [] }) => {
  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12", className)}>
      <PageHeader />

      {sessions.length > 0 ? (
        <>
          <ActionBar />
          <SessionsGrid sessions={sessions} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default SessionsPage;
