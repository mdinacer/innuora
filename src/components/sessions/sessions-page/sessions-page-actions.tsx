"use client";

import React from "react";
import { FilterIcon, SearchIcon } from "lucide-react";

import SessionForm from "../session-form";

interface Props {
  className?: string;
}

const SessionsPageActions: React.FC<Props> = ({}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
      <SessionForm />

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

export default SessionsPageActions;
