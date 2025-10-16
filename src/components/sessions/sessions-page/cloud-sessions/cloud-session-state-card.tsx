"use client";

import React, { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { ClockIcon, CoinsIcon, FilePenLineIcon, FilePlusIcon, Loader2Icon, MessageSquareIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/mir-ui/badge";
import { cn } from "@/lib/utils";
import { SessionLoadingState, SessionState } from "./cloud-session-sync-state";

interface Props {
  className?: string;
  sessionData: SessionState;
  loadingState: SessionLoadingState;
  disabled?: boolean;
  onClick: () => Promise<void>;
}

const getCardStyles = (state: "new" | "updated") => ({
  icon: state === "new" ? FilePlusIcon : FilePenLineIcon,
  badgeVariant: state === "new" ? "success" : "info",
  iconStyle: state === "new" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
  iconContainerStyle:
    state === "new"
      ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
      : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800",
});

const CloudSessionStateCard: React.FC<Props> = ({ className, sessionData, loadingState, disabled, onClick }) => {
  const { t } = useTranslation("pages", { keyPrefix: "cloud_updates.card" });

  const { badge, actions, meta } = useMemo(
    () => ({
      badge: t(`badge.${sessionData.state}`),

      actions: {
        base: sessionData.state === "new" ? t("actions.download") : t("actions.update"),
        loading: sessionData.state === "new" ? t("actions.downloading") : t("actions.updating"),
      },

      meta: {
        messages: (count: number) => t("meta.messages", { count }),
        credits: (count: number) => t("meta.credits", { count }),
      },
    }),
    [sessionData.state, t]
  );

  const loading = loadingState?.loading;

  const handleOnClick = useCallback(async () => {
    await onClick();
  }, [onClick]);

  const {
    icon: Icon,
    badgeVariant,
    iconStyle,
    iconContainerStyle,
  } = useMemo(() => getCardStyles(sessionData.state), [sessionData.state]);

  if (loadingState?.completed) return null;
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-y-4 sm:gap-y-0 items-center justify-between p-4 bg-inn-bg-card border border-inn-border-light rounded-xl shadow-[0_2px_8px] shadow-black/5 hover:shadow-[0_4px_20px] hover:shadow-black/10 transition animate-slide-in-up",
        className
      )}
    >
      <div className="flex sm:items-center gap-4">
        {/* <!-- New Session Icon --> */}
        <div
          className={cn("sm:size-10 size-8 shrink-0 rounded-full flex items-center justify-center", iconContainerStyle)}
        >
          <Icon className={cn("size-4 sm:size-5 shrink-0", iconStyle)} />
        </div>

        {/* <!-- Session Info --> */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">{sessionData.title}</h3>
            <Badge variant={badgeVariant as "success" | "info"}>{badge}</Badge>
          </div>

          {/* <!-- Session Meta --> */}
          <div className="flex items-center gap-4 mt-2 text-xs text-inn-text-secondary">
            <div className="flex items-center gap-1">
              <ClockIcon className="size-3 shrink-0" />
              <span>{format(sessionData.timestamp, "PP")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquareIcon className="size-3 shrink-0" />
              <span>{meta.messages(sessionData.metadata.messageCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <CoinsIcon className="size-3 shrink-0" />
              <span>{meta.credits(sessionData.metadata.creditsUsed)}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={loading || disabled}
        onClick={handleOnClick}
        className={cn(
          "inline-flex items-center justify-center gap-x-2",
          "px-4 py-2 bg-inn-bg-accent min-w-34 w-full sm:w-auto text-white rounded-xl font-medium transition hover:opacity-90 active:scale-95",
          "disabled:pointer-events-none disabled:opacity-50 disabled:scale-100"
        )}
      >
        {loading && <Loader2Icon className="animate-spin size-4 shrink-0" />}
        {loading ? actions.loading : actions.base}
      </button>
    </div>
  );
};

const isEqual = (prevProps: Props, nextProps: Props) =>
  prevProps.disabled === nextProps.disabled &&
  prevProps.loadingState?.loading === nextProps.loadingState?.loading &&
  prevProps.loadingState?.completed === nextProps.loadingState?.completed &&
  prevProps.loadingState?.error === nextProps.loadingState?.error &&
  prevProps.sessionData.id === nextProps.sessionData.id;

export default React.memo(CloudSessionStateCard, isEqual);
