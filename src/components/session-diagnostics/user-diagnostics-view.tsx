"use client";

import React from "react";
import Markdown from "markdown-to-jsx";

import { Badge } from "@/components/ui/badge";
import { SessionDiagnosticsStd } from "@/domains/session-diagnostics/session-diagnostics.types";
import { cn } from "@/lib/utils";

// type UserDiagnosticsResponse = {
//   whats_happening: {
//     text: string; // markdown string, observed patterns
//     confidence: "high" | "medium" | "low";
//   }[];
//   hidden_rules: {
//     rule: string; // unspoken rule in plain language
//     description: string; // markdown explanation with **bold** and *italic*
//     rigidity: "flexible" | "moderate" | "rigid";
//     confidence: "high" | "medium" | "low";
//   }[];
//   why_heavy: {
//     title: string; // name of emotional loop
//     description: string; // markdown explanation of cycle
//     confidence: "high" | "medium" | "low";
//   }[];
//   meta_patterns: {
//     title: string; // cross-session theme
//     description: string; // markdown explanation
//     confidence: "high" | "medium" | "low";
//   }[];
//   leverage_points: {
//     title: string; // interruption opportunity
//     description: string; // markdown explanation
//     confidence: "high" | "medium" | "low";
//   }[];
//   where_to_start: {
//     title: string; // concrete micro-step
//     description: string; // markdown explanation
//     difficulty: "gentle" | "moderate" | "challenging";
//   }[];
//   relevant_resources: {
//     category: string; // controlled taxonomy (e.g. "self-compassion")
//     goal: string; // learning or practice outcome
//     difficulty: "beginner" | "intermediate" | "advanced";
//   }[];
// };

interface Props {
  className?: string;
  diagnostics: SessionDiagnosticsStd;
}

const UserDiagnosticsView: React.FC<Props> = ({ className, diagnostics }) => {
  return (
    <div className={cn("", className)}>
      {/* <!-- Welcome Section --> */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="floating-heart w-12 h-12 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Your inner world, reflected</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on our conversations, here are some gentle insights about the patterns in your thoughts and feelings.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-[0_4px_20px] shadow-lg border border-border">
          <p className="text-muted-foreground text-sm text-center italic">
            Remember: These are reflections, not judgments. Every insight is a step toward understanding yourself with
            more compassion.
          </p>
        </div>
      </section>

      {/* <!-- What's Happening Section --> */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-8 shadow-[0_4px_20px] shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">What's happening for you</h2>
          </div>

          <div className="space-y-6">
            {diagnostics.whats_happening.map((item, index) => (
              <div
                key={index}
                className="rounded-xl bg-muted p-5 flex flex-col gap-y-2 items-start border-l-4 border-primary"
              >
                <Badge
                  className="uppercase"
                  variant={item.confidence === "high" ? "success" : item.confidence === "medium" ? "warning" : "accent"}
                >
                  {item.confidence}
                </Badge>

                <div className="text-foreground first-letter:capitalize leading-relaxed">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{item.text}</Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <!-- Hidden Rules Section --> */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-8 shadow-[0_4px_20px] shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Hidden rules driving this pressure</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            These silent beliefs operate in the background, making rest feel unsafe and self-compassion feel like
            failure.
          </p>

          <div className="grid gap-4 md:grid-cols-1">
            {diagnostics.hidden_rules.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-accent/10  border-l-accent rounded-xl p-5 border-l-4 rigidity-rigid"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <h3 className="font-semibold text-foreground">{item.rule}</h3>
                </div>

                <div className="text-muted-foreground mb-2 first-letter:capitalize leading-relaxed">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{item.description}</Markdown>
                </div>

                <div className="flex gap-2">
                  <Badge
                    className="uppercase"
                    variant={
                      item.confidence === "high" ? "success" : item.confidence === "medium" ? "warning" : "accent"
                    }
                  >
                    {item.confidence} confidence
                  </Badge>
                  <span className="confidence-indicator confidence-high"> - </span>
                  <Badge variant="info" className="capitalize">
                    Rigidity: {item.rigidity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <!-- Why It Feels Heavy Section --> */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-8 shadow-[0_4px_20px] shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5h4V1zm0 15v-3l4 4h-4v3zm6.31-2.9l2.44-2.44L16.89 9.8l-2.44 2.44zm-12.62 0l2.44 2.44L5.69 16.4l-2.44-2.44z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Why it feels so heavy</h2>
          </div>

          <div className="space-y-6">
            {diagnostics.why_heavy.map((item, index) => (
              <div key={index} className="rounded-xl bg-muted p-6 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    {item.title.replace("–", " - ")}
                  </h3>
                  <Badge
                    className="uppercase"
                    variant={
                      item.confidence === "high" ? "success" : item.confidence === "medium" ? "warning" : "accent"
                    }
                  >
                    {item.confidence} confidence
                  </Badge>
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{item.description}</Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <!-- Leverage Points Section --> */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-emerald-500/10 border-l-4 border-l-emerald-500 to-transparent rounded-2xl p-8 shadow-[0_4px_20px] shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Your leverage points</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Small shifts in these areas can create meaningful change. You don't have to fix everything at once.
          </p>

          <div className="grid gap-6 md:grid-cols-1">
            {diagnostics.leverage_points.map((item, index) => (
              <div key={index} className="rounded-xl bg-card p-5 border border-emerald-500">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-foreground">
                    <Markdown
                      options={{
                        forceBlock: false,
                        disableParsingRawHTML: true,
                        overrides: { p: { component: "h3" } },
                      }}
                    >
                      {item.title}
                    </Markdown>
                  </div>
                  <Badge
                    className="uppercase"
                    variant={
                      item.confidence === "high" ? "success" : item.confidence === "medium" ? "warning" : "accent"
                    }
                  >
                    {item.confidence} confidence
                  </Badge>
                </div>
                <div className="text-base text-muted-foreground">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{item.description}</Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <!-- Where to Start Section --> */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-2xl p-8 shadow-[0_8px_30px] shadow-xl text-white bg-gradient-to-br from-primary to-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Where to start</h2>
          </div>

          <p className="mb-6 opacity-90">Small experiments, not big changes. Pick one thing that feels doable today.</p>

          <div className="grid gap-4 md:grid-cols-1">
            {diagnostics.where_to_start.map((item, index) => (
              <div key={index} className="bg-primary rounded-xl p-5 backdrop-blur-sm difficulty-gentle">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-6 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="font-semibold text-foreground">
                    <Markdown
                      options={{
                        forceBlock: false,
                        disableParsingRawHTML: true,
                        overrides: { p: { component: "h3" } },
                      }}
                    >
                      {item.title}
                    </Markdown>
                  </div>
                </div>
                <div className="text-sm opacity-90 mb-2">
                  <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{item.description}</Markdown>
                </div>

                <div>
                  <span className="text-xs px-2 py-1 bg-white/20 rounded-full capitalize">{item.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <!-- Relevant Resources Section --> */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-8 shadow-[0_4px_20px] shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Relevant resources</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            These approaches can support your journey toward greater self-understanding and compassion.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {diagnostics.relevant_resources.map((item, index) => (
              <div key={index} className="rounded-xl flex flex-col items-start bg-muted p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-foreground capitalize">{item.category}</h3>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3 first-letter:capitalize">
                    <strong>{item.goal}</strong>
                  </p>
                </div>
                <Badge
                  className="capitalize"
                  variant={
                    item.difficulty === "beginner"
                      ? "success"
                      : item.difficulty === "intermediate"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {item.difficulty}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <!-- Gentle Reminder --> */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-card rounded-2xl p-6 shadow-[0_4px_20px] shadow-lg border border-border text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-2">A gentle reminder</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Growth happens in small steps, not giant leaps. Be patient with yourself as you explore these patterns.
            You're already showing courage by looking inward.
          </p>
        </div>
      </section>
    </div>
  );
};

export default UserDiagnosticsView;
