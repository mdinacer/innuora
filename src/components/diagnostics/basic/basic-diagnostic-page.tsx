import {
  ActivityIcon,
  AlertCircleIcon,
  AnchorIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  EyeIcon,
  HeartIcon,
  LockIcon,
  LucideIcon,
  RepeatIcon,
  SmileIcon,
  SunDimIcon,
  UsersIcon,
  WindIcon,
  ZapIcon,
} from "lucide-react";
import Markdown from "markdown-to-jsx";

import { Badge } from "@/components/mir-ui/badge";
import { Session } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";
import { BasicDiagnostic } from "@/lib/zod/basic-diagnostic.schema";

interface Props {
  className?: string;
  session: Session;
  diagnostic: BasicDiagnostic;
}

export const categoryIcons: Record<string, LucideIcon> = {
  "cognitive-behavioral-therapy": BrainIcon,
  "anxiety-management": AlertCircleIcon,
  "depression-support": SunDimIcon,
  "stress-management": WindIcon,
  "relationship-patterns": UsersIcon,
  "self-compassion": HeartIcon,
  "mindfulness-techniques": EyeIcon,
  "mood-tracking": SmileIcon,
};

export const SectionIcons = {
  whats_happening: ActivityIcon, // reflects ongoing patterns and current states
  hidden_rules: LockIcon, // symbolizes internal constraints and rules
  why_heavy: AnchorIcon, // conveys weight, heaviness, or stuckness
  meta_patterns: RepeatIcon, // cyclical or recurring themes
  leverage_points: ZapIcon, // points of potential change or intervention
  where_to_start: ArrowRightIcon, // actionable starting micro-steps
  relevant_resources: BookOpenIcon, // guidance, learning, and references
} as const;

const badgeColors = {
  // Confidence Levels
  confidence: {
    high: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white",
    low: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
  },

  // Rigidity Levels
  rigidity: {
    flexible: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white",
    moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white",
    rigid: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
  },

  // Difficulty Levels
  difficulty: {
    gentle: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
    moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white",
    challenging: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
    beginner: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white",
    advanced: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
  },
};

const BasicDiagnosticPage: React.FC<Props> = ({ className, session, diagnostic }) => {
  return (
    <div className={cn("h-auto w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16", className)}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-inn-bg-accent/25 bg-inn-bg-soft px-3 py-1 text-xs font-semibold text-inn-bg-accent">
          Your Personal Insights - {session.messages.filter((message) => message.role === "user").length} Messages
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">Understanding Your Inner World</h1>
        <p className="text-lg text-inn-text-secondary max-w-3xl mx-auto">
          Here's what we've noticed in our conversations together. These insights are meant to help you see patterns and
          find gentle ways forward.
        </p>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* <!-- What's Happening --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.whats_happening className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">What's Happening Right Now</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.whats_happening.map((whatsHappening, index) => (
              <div key={index} className="p-4 rounded-xl bg-inn-bg-soft border-l-4 border-inn-bg-accent">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-base leading-relaxed">
                    <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>
                      {whatsHappening.text}
                    </Markdown>
                  </div>
                  <Badge
                    variant={"neutral"}
                    className={cn("uppercase", badgeColors.confidence[whatsHappening.confidence])}
                  >
                    {whatsHappening.confidence}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Hidden Rules --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.hidden_rules className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">Hidden Rules You Might Be Following</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.hidden_rules.map((hiddenRule, index) => (
              <div key={index} className="rounded-xl border border-inn-border-light bg-inn-bg-soft p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-base">{hiddenRule.rule}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <Badge className={cn("capitalize", badgeColors.rigidity[hiddenRule.rigidity])} variant="neutral">
                      {hiddenRule.rigidity}
                    </Badge>
                    <Badge
                      className={cn("capitalize", badgeColors.confidence[hiddenRule.confidence])}
                      variant="neutral"
                    >
                      {hiddenRule.confidence}
                    </Badge>
                  </div>
                </div>
                <div className="text-base text-inn-text-secondary leading-relaxed">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>
                    {hiddenRule.description}
                  </Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Why It Feels Heavy --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.why_heavy className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">Why It Feels Heavy</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.why_heavy.map((whyHeavy, index) => (
              <div key={index} className="rounded-xl bg-inn-bg-soft p-5 border-l-4 border-inn-bg-flame">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold">{whyHeavy.title}</h3>
                  <Badge variant={"neutral"} className={cn("capitalize", badgeColors.confidence[whyHeavy.confidence])}>
                    {whyHeavy.confidence}
                  </Badge>
                </div>
                <div className="text-base text-inn-text-secondary leading-relaxed">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>
                    {whyHeavy.description}
                  </Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- The Bigger Picture --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.meta_patterns className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">The Bigger Picture</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.meta_patterns.map((metaPattern, index) => (
              <div key={index} className="p-5 rounded-xl bg-inn-bg-soft border-l-4 border-inn-bg-accent">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Markdown
                    options={{
                      forceBlock: true,
                      disableParsingRawHTML: true,
                      overrides: {
                        strong: { props: { className: "font-bold" } },
                        em: { props: { className: "italic" } },
                      },
                    }}
                  >
                    {metaPattern.title}
                  </Markdown>
                  <Badge
                    className={cn("capitalize", badgeColors.confidence[metaPattern.confidence])}
                    variant={"neutral"}
                  >
                    {metaPattern.confidence}
                  </Badge>
                </div>
                <div className="text-base text-inn-text-secondary leading-relaxed">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>
                    {metaPattern.description}
                  </Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Where You Have Power --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.leverage_points className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">Where You Have Power</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.leverage_points.map((leveragePoint, index) => (
              <div key={index} className="p-5 rounded-xl border border-inn-border-light bg-inn-bg-soft">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Markdown
                    options={{
                      forceBlock: true,
                      disableParsingRawHTML: true,
                      overrides: {
                        strong: { props: { className: "font-bold" } },
                        em: { props: { className: "italic" } },
                      },
                    }}
                  >
                    {leveragePoint.title}
                  </Markdown>
                  <Badge
                    className={cn("capitalize", badgeColors.confidence[leveragePoint.confidence])}
                    variant="neutral"
                  >
                    {leveragePoint.confidence}
                  </Badge>
                </div>
                <Markdown
                  options={{
                    forceBlock: true,
                    disableParsingRawHTML: true,
                    overrides: {
                      strong: { props: { className: "font-bold" } },
                      em: { props: { className: "italic" } },
                      p: {
                        props: { className: "text-base text-inn-text-secondary leading-relaxed" },
                      },
                    },
                  }}
                >
                  {leveragePoint.description}
                </Markdown>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Gentle Next Steps --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.where_to_start className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">Gentle Next Steps</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.where_to_start.map((start, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-gradient-to-r from-inn-bg-accent/10 to-inn-bg-soft border border-inn-bg-accent/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn("capitalize", badgeColors.difficulty[start.difficulty])} variant="neutral">
                    {start.difficulty}
                  </Badge>
                  <Markdown
                    options={{
                      forceBlock: true,
                      disableParsingRawHTML: true,
                      overrides: {
                        strong: { props: { className: "font-bold" } },
                        em: { props: { className: "italic" } },
                      },
                    }}
                  >
                    {start.title}
                  </Markdown>
                </div>
                <Markdown
                  options={{
                    forceBlock: true,
                    disableParsingRawHTML: true,
                    overrides: {
                      strong: { props: { className: "font-bold" } },
                      em: { props: { className: "italic" } },
                      p: {
                        props: { className: "text-base text-inn-text-secondary leading-relaxed" },
                      },
                    },
                  }}
                >
                  {start.description}
                </Markdown>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Resources --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.relevant_resources className="text-inn-bg-accent size-6 shrink-0" />
            <h2 className="text-xl font-bold">Resources That Might Help</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {diagnostic.relevant_resources.map((resource, index) => {
              const Icon = categoryIcons[resource.category];
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-inn-border-light bg-inn-bg-soft hover:border-inn-bg-accent transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-inn-bg-accent/20 flex items-center justify-center mb-3">
                    <Icon className="size-5 text-inn-bg-accent shrink-0" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 capitalize">{resource.category.replace("-", " ")}</h3>
                  <p className="text-base text-inn-text-secondary mb-2">{resource.goal}</p>
                  <Badge className={cn("capitalize", badgeColors.difficulty[resource.difficulty])} variant="neutral">
                    {resource.difficulty}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* <!-- Disclaimer --> */}
        <div className="rounded-3xl p-6 text-center mt-8 text-white shadow-md bg-gradient-to-br from-red-500 via-red-700 to-red-700">
          <p className="text-sm opacity-90 max-w-2xl mx-auto">
            ⚠️ <strong>Disclaimer:</strong> This analysis is for informational purposes only. It is not a medical,
            legal, or scientific diagnosis and should not replace professional evaluation or treatment. Please consult a
            licensed professional for guidance when needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicDiagnosticPage;
