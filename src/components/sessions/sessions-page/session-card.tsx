import React from "react";
import Link from "next/link";
import { TextIcon } from "lucide-react";

import { SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";

type SessionCardProps = {
  session: SessionOverview;
};

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-card cursor-pointer group"
    >
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

        {session.autoUpdateTitle && (
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
        )}
      </div>

      {session.subtitle && <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{session.subtitle}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {session.metadata.messageCount ? (
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-1 rounded-full">
              {session.metadata.messageCount} message{session.metadata.messageCount > 1 ? "s" : ""}
            </span>
          ) : null}

          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--bg-accent)] hover:text-[var(--text-primary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </Link>
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
