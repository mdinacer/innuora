"use client";

import React from "react";
import Link from "next/link";
import {
  ActivityIcon,
  CheckIcon,
  ChevronRightIcon,
  EyeIcon,
  FileTextIcon,
  HeartPulseIcon,
  LucideIcon,
  ShieldIcon,
  StethoscopeIcon,
  TargetIcon,
  UserCheckIcon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Session } from "@/domains/open-chat/open-chat.types";
import { TherapeuticAnalysisWithMessageId } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { cn } from "@/lib/utils";
import { AdvancedDiagnostic } from "@/lib/zod/advanced-diagnostic.schema";
import DiagnosticDistortionCard from "./advanced-diagnostic-distortion-card";
import DiagnosticThemeCard from "./advanced-diagnostic-theme-card";

const badgeColors = {
  severity: {
    high: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white",
    moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white",
    low: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
  },
  trajectory: {
    stable: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white",
    increasing: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white",
    decreasing: "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-white",
  },
  frequency: {
    1: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
    2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white",
    3: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
  },
  risk_level: {
    low: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
    moderate_concern: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white",
    high: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
    immediate_danger: "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-white",
  },
  congruence: {
    aligned: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white",
    misaligned: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white",
  },
};

const SectionIcons: Record<string, LucideIcon> = {
  themes: ActivityIcon, // ongoing emotional/behavioral patterns
  cognitive_distortions: ZapIcon, // mental distortions, energy of the mind
  emotional_state: HeartPulseIcon, // feelings, emotions, and congruence
  risk_assessment: ShieldIcon, // protective / safety considerations
  therapist_focus: TargetIcon, // focus points for intervention
  clinical_interpretations: FileTextIcon, // professional insight / summary
  treatment_recommendations: StethoscopeIcon, // therapy / action recommendations
  professional_language: UserCheckIcon, // formal clinical observations
  clinical_insights: EyeIcon, // insights into patterns, cognitive shifts
};

const getMessagesIdByDistortion = (distortion: string, analysis: TherapeuticAnalysisWithMessageId[]) => {
  return analysis.filter((item) => item.distortions.some((d) => d.type === distortion)).map((item) => item.messageId);
};

interface Props {
  className?: string;
  session: Session;
  diagnostic: AdvancedDiagnostic;
}

const AdvancedDiagnosticPage: React.FC<Props> = ({ className, diagnostic, session }) => {
  const getDistortionMessages = (distortion: string) => {
    const messagesIds = getMessagesIdByDistortion(distortion, []);
    if (messagesIds.length === 0) return [];
    return session.messages.filter((message) => messagesIds.includes(message.id)).map((message) => message.content);
  };
  return (
    <div className={cn("h-auto w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16", className)}>
      {/* <!-- Hero Section --> */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-primary/25 bg-muted px-3 py-1 text-xs font-semibold text-primary">
          Advanced Diagnostic Report - {session.messages.filter((message) => message.role === "user").length} Messages
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">Session Advanced Insights</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Innuora compiles session interactions to identify recurring emotional and behavioral patterns, cognitive
          distortions, and relevant themes, providing structured insights to support clinical assessment and treatment
          planning.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* <!-- Emotional State --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <SectionIcons.emotional_state className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Current Emotional State</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="text-sm text-muted-foreground mb-1">Primary Emotion</div>
              <div className="text-2xl font-bold capitalize">{diagnostic.emotional_state.primary}</div>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <div className="text-sm text-muted-foreground mb-2">Secondary Emotions</div>
              <div className="flex flex-wrap gap-2">
                {diagnostic.emotional_state.secondary.map((emotion) => (
                  <span
                    className="capitalize bg-primary/15 text-primary inline-flex items-center py-1 px-2.5 text-xs font-semibold rounded-lg"
                    key={emotion}
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-muted border border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Emotional Congruence</div>
            <div className="text-sm first-letter:uppercase">{`${diagnostic.emotional_state.congruence} - emotions match reported experiences`}</div>
          </div>
        </div>

        {/* <!-- Risk Assessment --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <SectionIcons.risk_assessment className="text-accent size-6 shrink-0" />

            <h2 className="text-xl font-bold">Risk Assessment</h2>
            <Badge
              variant={"neutral"}
              className={cn("capitalize ml-auto", badgeColors.risk_level[diagnostic.risk_assessment.level])}
            >
              {diagnostic.risk_assessment.level.replace("_", " ")}
            </Badge>
          </div>

          <div className="rounded-xl bg-muted p-4 border-l-4 border-accent">
            <p className="text-sm">{diagnostic.risk_assessment.notes} </p>
          </div>
        </div>

        {/* <!-- All Themes --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.themes className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Identified Themes ({`${diagnostic.themes.length} Total`})</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.themes.map((theme) => (
              <DiagnosticThemeCard
                key={theme.id}
                theme={theme}
                severityClassName={badgeColors.severity[theme.severity]}
                trajectoryClassName={badgeColors.trajectory[theme.trajectory]}
              />
            ))}
          </div>
        </div>

        {/* <!-- All Cognitive Distortions --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.cognitive_distortions className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">
              Cognitive Distortions ({`${diagnostic.cognitive_distortions.length} Total`})
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {diagnostic.cognitive_distortions.map((distortion) => {
              const messages = getDistortionMessages(distortion.id);
              return (
                <DiagnosticDistortionCard
                  severityClassName={badgeColors.severity[distortion.severity]}
                  key={distortion.id}
                  distortion={distortion}
                  messages={messages}
                />
              );
            })}
          </div>
        </div>

        {/* <!-- Therapist Focus --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.therapist_focus className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Therapist Focus Areas</h2>
          </div>

          <div className="grid gap-3">
            {diagnostic.therapist_focus.map((focus, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div className="text-base">{focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Clinical Interpretations --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.clinical_interpretations className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Clinical Interpretations</h2>
          </div>

          <div className="space-y-3">
            {diagnostic.clinical_interpretations.map((interpretation, index) => (
              <div key={index} className="p-4 rounded-xl bg-muted border-l-4 border-primary">
                <p className="text-sm">{interpretation} </p>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Treatment Recommendations --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.treatment_recommendations className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Treatment Recommendations</h2>
          </div>

          <div className="space-y-3">
            {diagnostic.treatment_recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <CheckIcon className="size-4 text-primary shrink-0 mt-1" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Professional Language --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.professional_language className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Professional Language & Terminology</h2>
          </div>

          <div className="space-y-3">
            {diagnostic.professional_language.map((term, index) => (
              <div key={index} className="flex items-center gap-3 w-full p-3 rounded-lg border border-border">
                <ChevronRightIcon className="size-4 text-primary shrink-0" />
                <p className="text-sm">{term}</p>
              </div>
            ))}
          </div>
        </div>

        {/* <!-- Clinical Insights --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <SectionIcons.clinical_insights className="text-primary size-6 shrink-0" />
            <h2 className="text-xl font-bold">Clinical Insights</h2>
          </div>

          <div className="space-y-4">
            {diagnostic.clinical_insights.map((insight, index) => (
              <div key={index} className="p-4 rounded-xl bg-muted">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                  <p className="text-sm">{insight}</p>
                </div>
              </div>
            ))}
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

        {/* <!-- CTA --> */}
        {false && (
          <div className="rounded-3xl p-8 text-center text-white shadow-floating bg-gradient-to-br from-[#00bcd4] to-[#26c6da]">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Start Your Journey to Self-Understanding</h2>
            <p className="text-base opacity-90 max-w-2xl mx-auto mb-6">
              Join Innuora and discover insights about your emotional patterns, cognitive habits, and personal growth
              opportunities-all from natural conversations.
            </p>
            <Link
              href="#"
              className="inline-flex rounded-2xl bg-white px-8 py-3 font-semibold text-primary transition hover:translate-y-[-2px] shadow-lg"
            >
              Request Early Access
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDiagnosticPage;
