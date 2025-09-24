"use client";

import React from "react";
import Link from "next/link";
import { SearchIcon, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import SessionForm from "@/components/sessions/session-form";

interface Props {
  className?: string;
}

const SessionsPageActions: React.FC<Props> = ({}) => {
  const { t } = useTranslation(["pages"], { keyPrefix: "sessions" });

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
      <SessionForm />

      <div className="flex items-center gap-3">
        {/* <!-- Insights Link --> */}
        <Link
          href="/insights"
          className="flex items-center gap-2 rounded-2xl border border-inn-border-light bg-inn-bg-card px-4 py-2 text-sm font-medium transition hover:shadow-subtle hover:border-inn-bg-accent/50"
        >
          <TrendingUp className="size-4" />
          Your Insights
        </Link>

        {/* <!-- Search --> */}
        <div className="relative">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-64 rounded-2xl border border-inn-border-light bg-inn-bg-input ltr:pl-10 rtl:pr-10 py-2 text-sm outline-none transition focus:border-inn-bg-accent focus:ring-2 focus:ring-inn-bg-accent focus:ring-opacity-20"
          />
          <SearchIcon className="size-4 absolute ltr:left-3 rtl:right-4  top-1/2 -translate-y-1/2 text-inn-text-secondary" />
        </div>

        {/* <!-- Filter --> */}
        {/* <button className="flex items-center gap-2 rounded-2xl border border-inn-border-light bg-inn-bg-card px-4 py-2 text-sm font-medium transition hover:shadow-subtle">
          <FilterIcon className="size-4" />
          Filter
        </button> */}
      </div>
    </div>
  );
};

export default SessionsPageActions;
