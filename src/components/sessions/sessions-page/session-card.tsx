import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronRightIcon,
  CloudIcon,
  InfoIcon,
  MessageSquareTextIcon,
  MonitorSmartphoneIcon,
  TextIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { SessionChangeState, useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";
import { AppLocales } from "@/lib/i18n";
import { fnsLocalesMap } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type SessionCardProps = {
  session: SessionOverview;
};

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "sessions.card" });
  //const getSessionObfuscatedId = useEncryptedSessionStore((state) => state.getSessionObfuscatedId);

  const isOnCloud = useEncryptedSessionStore((state) => state.onlineSessionIds.includes(session.id));
  const updatesData = useEncryptedSessionStore((state) => state.changesMap[session.id]) as
    | SessionChangeState
    | undefined;

  const fnsLocale = fnsLocalesMap[language as AppLocales];

  // const obfuscatedId = useMemo(() => {
  //   return getSessionObfuscatedId(session.id);
  // }, [getSessionObfuscatedId, session.id]);

  const {
    cloud,
    local,
    messages,
    hasUpdates,
    continue: continueText,
  } = {
    cloud: t("cloud"),
    local: t("local"),
    messages: t("messages"),
    hasUpdates: t("hasUpdates"),
    continue: t("continue"),
  };

  return (
    <div
      role="group"
      aria-labelledby={`session-title-${session.id}`}
      className={cn(
        "w-full group",
        "bg-mir-bg-card border border-mir-border-light/30 rounded-3xl overflow-hidden",
        "flex flex-col",
        "sm:backdrop-blur-xs sm:backdrop-saturate-200 sm:bg-mir-bg-card/30",
        "hover:border-mir-bg-accent/30 hover:-translate-y-0.5",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-mir-bg-accent"
      )}
    >
      {updatesData && (
        <div role="status" aria-live="polite" className="sr-only">
          {hasUpdates}
        </div>
      )}

      {/* Header with session type */}
      <div className="min-h-1/5 p-6 pb-0 w-full flex items-start justify-between">
        <div className="bg-gradient-to-br from-mir-bg-accent to-[#ff8a7a] size-12 flex items-center justify-center shrink-0 rounded-2xl">
          <TextIcon className="size-6 shrink-0" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-x-4">
          <div
            className={cn(
              "inline-flex items-center h-[30px] w-[34px] sm:w-auto border gap-x-2 text-sm px-2 py-1 rounded-lg",
              isOnCloud
                ? "border-mir-bg-accent/20 bg-mir-bg-soft text-mir-bg-accent"
                : "bg-mir-bg-input border-mir-border-light"
            )}
            aria-label={isOnCloud ? cloud : local} // screen reader text
          >
            {isOnCloud ? (
              <CloudIcon className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <MonitorSmartphoneIcon className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span className="rtl:mt-0.5 sr-only sm:not-sr-only">{isOnCloud ? cloud : local}</span>
          </div>

          <div
            className="inline-flex items-center border gap-x-2 text-sm px-2 py-1 rounded-lg bg-mir-bg-input border-mir-border-light text-mir-text-secondary"
            aria-label={`${session.metadata.messageCount} ${messages}`}
          >
            <MessageSquareTextIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="rtl:mt-0.5 sr-only sm:not-sr-only">{messages} </span>
            <span className="tabular-nums font-sans font-semibold">{session.metadata.messageCount}</span>
          </div>

          <Link
            href={`/sessions/${session.id}/details`}
            className="inline-flex aspect-square items-center border border-transparent gap-x-2 text-sm p-1 rounded-lg hover:bg-mir-bg-input hover:border-mir-border-light text-mir-text-secondary hover:text-mir-bg-accent"
            aria-label={`${continueText} details`}
          >
            <InfoIcon className="size-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Session title and subtitle */}
      <div className="flex-1 px-6 py-6 flex flex-col gap-2">
        <h3
          id={`session-title-${session.id}`}
          className="font-bold text-mir-text-primary group-hover:text-mir-bg-accent transition-colors duration-300 leading-tight"
        >
          {session.title}
        </h3>
        <p
          className={cn(
            "text-mir-text-secondary leading-relaxed text-base rtl:text-base line-clamp-2",
            "group-hover:text-opacity-80 transition-all duration-300"
          )}
        >
          {session.subtitle}
        </p>
      </div>

      {/* Bottom actions */}
      <div className="min-h-1/5 p-6 pt-4 border-t border-mir-border-light/30 flex items-center justify-between">
        <Link
          href={`/sessions/${session.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mir-bg-accent text-white font-medium text-sm hover:shadow-[0_4px_20px] hover:shadow-black/10 hover:scale-105 transition-all"
          aria-label={`${continueText} to session`}
        >
          <ChevronRightIcon className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
          <span className="rtl:mt-0.5">{continueText}</span>
        </Link>

        <div>
          <div
            className="text-xs rtl:text-base rtl:font-arabic-body text-mir-text-secondary font-medium"
            aria-label={`Last updated ${formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true, locale: fnsLocale })}`}
          >
            {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true, locale: fnsLocale })}
          </div>
        </div>
      </div>
    </div>
    // <Link
    //   href={`/sessions/${session.obfuscatedId}`}
    //   className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-card cursor-pointer group"
    // >
    //   <div className="flex items-start justify-between mb-4">
    //     <div className="w-10 h-10 rounded-full bg-mir-bg-soft border border-mir-bg-accent/25 flex items-center justify-center">
    //       <TextIcon className="size-5 text-mir-bg-accent" />
    //     </div>
    //     <div className="flex flex-col items-end gap-1">
    //       <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
    //         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //           <circle cx="12" cy="12" r="10"></circle>
    //           <polyline points="12 6 12 12 16 14"></polyline>
    //         </svg>
    //         8 min
    //       </div>
    //     </div>
    //   </div>

    //   <div className="flex items-start justify-between mb-2">
    //     <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--bg-accent)] transition flex-1">
    //       {session.title}
    //     </h3>

    //     {true && (
    //       <div className="ml-2 flex-shrink-0">
    //         <svg
    //           width="14"
    //           height="14"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           stroke="red"
    //           strokeWidth="2"
    //           className="opacity-70"
    //         >
    //           <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
    //         </svg>
    //       </div>
    //     )}
    //   </div>

    //   {session.subtitle && <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{session.subtitle}</p>}

    //   <div className="flex items-center justify-between">
    //     <div className="flex items-center gap-2">
    //       {session.metadata.messageCount ? (
    //         <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-1 rounded-full">
    //           {session.metadata.messageCount} message{session.metadata.messageCount > 1 ? "s" : ""}
    //         </span>
    //       ) : null}

    //       {isOnCloud && (
    //         <div className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
    //           <CloudIcon /> On Cloud
    //         </div>
    //       )}
    //     </div>
    //     <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--bg-accent)] hover:text-[var(--text-primary)]">
    //       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //         <polyline points="9 18 15 12 9 6"></polyline>
    //       </svg>
    //     </button>
    //   </div>
    // </Link>
  );
};

export default SessionCard;
// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import { TextIcon } from "lucide-react";

// import { Session, SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";

// interface Props {
//   session: SessionOverview;
// }

// const SessionCard: React.FC<Props> = ({ session }) => {
//   const { aggregatedAnalysis: sessionAnalysis } = session;
//   const router = useRouter();

//   return (
//     <div
//       onClick={() => router.push(`/sessions/${session.id}`)}
//       className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-card cursor-pointer group"
//     >
//       <div className="flex items-start justify-between mb-4">
//         <div className="w-10 h-10 rounded-full bg-mir-bg-soft border border-mir-bg-accent/25 flex items-center justify-center">
//           <TextIcon className="size-5 text-mir-bg-accent" />
//         </div>
//         <div className="flex flex-col items-end gap-1">
//           <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <circle cx="12" cy="12" r="10"></circle>
//               <polyline points="12 6 12 12 16 14"></polyline>
//             </svg>
//             8 min
//           </div>
//         </div>
//       </div>
//       <div className="flex items-start justify-between mb-2">
//         <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--bg-accent)] transition flex-1">
//           {session.title}
//         </h3>

//         {session.autoUpdateTitle ? (
//           <div className="ml-2 flex-shrink-0">
//             <svg
//               width="14"
//               height="14"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="var(--bg-accent)"
//               strokeWidth="2"
//               className="opacity-70"
//             >
//               <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
//             </svg>
//           </div>
//         ) : (
//           ""
//         )}
//       </div>

//       {session.subtitle && <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{session.subtitle}</p>}

//       <div className="flex flex-wrap gap-1 mb-4">
//         {sessionAnalysis?.themes.map((theme, index) => (
//           <span
//             key={index}
//             className="inline-flex capitalize items-center px-2 py-1 rounded-lg bg-mir-bg-soft text-xs text-[var(--text-secondary)] border border-[rgba(255,107,90,0.15)]"
//           >
//             {/* {JSON.stringify(theme.replace(/_/g, " "))} */}
//             {theme.replace(/_/g, " ")}
//           </span>
//         ))}

//         {sessionAnalysis?.themes && sessionAnalysis.themes.length > 3 && (
//           <span className="text-xs text-[var(--text-secondary)] px-2 py-1">+{sessionAnalysis.themes.length - 3}</span>
//         )}
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           {session.messages.length ? (
//             <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-1 rounded-full">
//               {session.messages.length} message
//             </span>
//           ) : (
//             ""
//           )}
//           <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--bg-accent)] hover:text-[var(--text-primary)]">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <polyline points="9 18 15 12 9 6"></polyline>
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SessionCard;
