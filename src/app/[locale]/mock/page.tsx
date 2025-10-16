"use client";

import { useCallback, useState } from "react";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { Button } from "@/components/ui/button";
import {
  combineSessionAnalyses,
  getCriticalMessageIds,
} from "@/domains/session-diagnostics/session-diagnostics.service";
import { formatUserMessagesForMemory } from "@/domains/session-memory/session-memory.utils";
import {
  TherapeuticAnalysis,
  TherapeuticAnalysisWithMessageId,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { parseJsonObject } from "@/lib/utils/parse-json";
// import { INNUORA_STANDARD_DIAGNOSTICS_INSTRUCTIONS } from "@/domains/session-diagnostics/session-diagnostics.prompts";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { sampleSession, sampleSessionAnalysis, sampleSessionMemory, sampleSessionSummary } from "./data";

function formatMessages(messages: OpenChatMessage[], maxLength = 800): string {
  return messages
    .map((msg) => {
      let content = msg.content.trim();

      // Truncate if too long
      if (content.length > maxLength) {
        content = content.slice(0, maxLength) + "...";
      }

      return `- ${msg.role}: ${content}`;
    })
    .join("\n");
}

export default function Page() {
  const [loading, setLoading] = useState(false);

  // const generateSessionMemory = async () => {
  //   const messages = mockSession.messages;
  //   const formattedMessages = formatUserMessagesForMemory(messages);
  //   const sessionAnalysis = combineSessionAnalyses(mockSession.analysisSnapshots);
  //   console.log("👋🏻 sessionAnalysis:", sessionAnalysis);

  //   // const userPrompt = {
  //   //   role: "system" as const,
  //   //   content: CHAT_MESSAGES_MEMORY_BUILD_INSTRUCTIONS.replace("{{user_messages}}", formattedMessages).trim(),
  //   // };
  //   // const userResult = await processAiPromptsWithRetry([userPrompt], { max_tokens: 2500 });
  //   // if (userResult.error) {
  //   //   console.error("❌ AI call failed:", userResult.error.message);
  //   //   return;
  //   // }
  //   // const data = userResult.data;
  //   // const summary = data.message;
  //   // console.log("👋🏻 summary:", summary);
  // };

  const testPrompt = useCallback(async () => {
    setLoading(true);
    const messages = sampleSession.messages as OpenChatMessage[];
    const analysis = sampleSession.analysisSnapshots as TherapeuticAnalysis[];
    try {
      // const criticalMessagesIds = getCriticalMessageIds(mockSession.analysisSnapshots);
      // const criticalMessages = messages.filter((msg) => criticalMessagesIds.includes(msg.id));

      //console.log("👋🏻 criticalMessagesIds:", criticalMessagesIds);
      const formattedMessages = formatUserMessagesForMemory(messages);
      const combinedAnalysis = combineSessionAnalyses(analysis);
      console.log(combinedAnalysis);

      // const userPrompt = {
      //   role: "system" as const,
      //   content: CHAT_MESSAGES_MEMORY_BUILD_INSTRUCTIONS.replace("{{user_messages}}", formattedMessages).trim(),
      // };
      // const userPrompt = {
      //   role: "system" as const,
      //   content: DiagnosticPrompts.basic
      //     .replace("{{session_summary}}", mockSessionSummary)
      //     .replace("{{session_memory}}", mockSessionMemory.join(","))
      //     .replace("{{session_analysis}}", mockSessionAnalysis)
      //     .replace("{{session_messages}}", formattedMessages)
      //     .trim(),
      // };
      // const userPrompt = {
      //   role: "system" as const,
      //   content: ADVANCED_THERAPIST_DIAGNOSTIC_PROMPT.replace("{{session_summary}}", mockSessionSummary)
      //     .replace("{{session_memory}}", mockSessionMemory)
      //     .replace("{{session_analysis}}", JSON.stringify(mockSessionAnalysis))
      //     .trim(),
      // };

      //const userResult = await processAiPromptsWithRetry([userPrompt], { max_tokens: 2500 });

      // if (userResult.error) {
      //   console.error("❌ AI call failed:", userResult.error.message);
      //   return;
      // }

      // const data = userResult.data;
      // console.log("✅ USER DIAGNOSTICS RESULT:");
      // console.log("📊 Tokens used:", data.modelTokenUsage);
      // //console.log("📄 Content:", parseJsonObject(data.message));
      // console.log("📄 Content:", data.message);
      // console.log("\n" + "=".repeat(80) + "\n");

      // Test Advanced Therapist Diagnostics
    } catch (error) {
      console.error("❌ Test failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  //console.log(randomBytes(32).toString("base64"));

  const generateDiagnostics = useCallback(async () => {
    const messages = sampleSession.messages as OpenChatMessage[];
    const analysis = sampleSession.analysisSnapshots as TherapeuticAnalysisWithMessageId[];
    const criticalMessagesIds = getCriticalMessageIds(analysis);
    const criticalMessages = messages.filter((msg) => criticalMessagesIds.includes(msg.id));

    const userPrompt = {
      role: "system" as const,
      content: DiagnosticPrompts.advanced
        .replace("{{session_summary}}", sampleSessionSummary)
        .replace("{{session_memory}}", sampleSessionMemory.join(","))
        .replace("{{session_analysis}}", sampleSessionAnalysis)
        .replace("{{session_messages}}", criticalMessages.join(","))
        .trim(),
    };

    const userResult = await processAiPromptsWithRetry([userPrompt], { max_tokens: 2500 });

    if (userResult.error) {
      console.error("❌ AI call failed:", userResult.error.message);
      return;
    }

    const data = userResult.data;
    console.log("✅ USER DIAGNOSTICS RESULT:");
    console.log("📊 Tokens used:", data.modelTokenUsage);
    console.log("📄 Content:", parseJsonObject(data.message));
    console.log("\n" + "=".repeat(80) + "\n");
  }, []);

  return (
    <div className="h-screen  w-full  items-center bg-inn-bg-primary py-30 justify-center">
      <Button onClick={generateDiagnostics} disabled={loading}>
        {loading ? "Testing Diagnostics..." : "Test Enhanced Diagnostic Prompts"}
      </Button>
      {/* <CodeView data={mockSession.analysisSnapshots} className="absolute top-0 left-0 z-10" />
      <Button onClick={testPrompt} disabled={loading}>
        {loading ? "Testing Diagnostics..." : "Test Enhanced Diagnostic Prompts"}
      </Button>
      <Button onClick={generateSessionMemory} disabled={loading}>
        {loading ? "Summarizing Session..." : "Summarize Session"}
      </Button> */}
      {/* <Tabs defaultValue="advanced">
        <TabsList className="max-w-5xl mx-auto ">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <BasicDiagnosticPage session={mockSession} diagnostic={mockBasicDiagnosis} />
        </TabsContent>
        <TabsContent value="advanced">
          <AdvancedDiagnosticPage session={mockSession} diagnostic={mockAdvancedDiagnosis} />
        </TabsContent>
      </Tabs> */}
      {/* <CodeView data={mockMessages} className="absolute top-0 left-0 z-10" /> */}
      {/* <p>{mockMessages.filter((m) => m.role === "user").length}</p>
      <div className="relative h-full w-full max-w-5xl mx-auto flex flex-col">
        <Button onClick={testPrompt} disabled={loading}>
          {loading ? "Testing Diagnostics..." : "Test Enhanced Diagnostic Prompts"}
        </Button>
        <UserDiagnosticsView diagnostics={mockUserDiagnosticsResponse} className="flex-1 p-6" />
      </div> */}
    </div>
  );
}

const SESSION_MESSAGES_SUMMARY_PROMPT = `
You are an AI assistant tasked with summarizing a conversation between a user and an AI assistant. Use only the 'role' and 'content' of the messages provided. 

Instructions:
1. Summarize the conversation in a single, coherent paragraph.
2. Capture key facts, events, and experiences from the user’s messages.
3. Capture reflections, questions, and insights from the assistant’s messages.
4. Highlight recurring themes, emotional patterns, or notable cognitive tendencies.
5. Mention suggested micro-actions or experiments by the assistant, if present.
6. Keep the summary neutral, concise, and clear. Do not interpret, advise, or add information not present in the messages.

Output: a single paragraph in plain text.`;

const DiagnosticPrompts = {
  advanced: `
# Professional Clinical Case Formulation

**Role**: Expert clinical assessment system generating a comprehensive diagnostic profile for therapeutic review.

## Input
- Session Summary: {{session_summary}}  // concise, main points only
- Session Memory: {{session_memory}}    // key bullet points, avoid full verbatim
- Session Analysis: {{session_analysis}} // only essential distortions, patterns, and silent rules
- Critical Session Messages: {{critical_messages}} // only messages relevant to high-intensity patterns

## Clinical Guidelines
1. Ground insights strictly in provided data; avoid extrapolation.
2. Identify cognitive schemas, maladaptive loops, and systemic feedback.
3. Include confidence ratings ("high" | "medium" | "low") for each insight.
4. Highlight therapeutic leverage points and intervention options.
5. Assess risk and monitoring needs.
6. Use professional language, but remain understandable for an informed patient.

## Cognitive Distortions
- Reflect actual messages; provide **session-specific examples**.
- Include frequency and severity based on patterns in session data.

## Structured JSON Output
Return only valid JSON:

{
  "themes": [
    {
      "id": string,
      "title": string,
      "description": string,
      "severity": "low" | "medium" | "high",
      "trajectory": "increasing" | "stable" | "decreasing",
      "evidence": string[]
    }
  ],
  "cognitive_distortions": [
    {
      "id": string,
      "title": string,
      "description": string,  // session-specific
      "frequency": number,
      "severity": "low" | "moderate" | "high"
    }
  ],
  "emotional_state": {
    "primary": string,
    "secondary": string[],
    "congruence": "aligned" | "minimizing" | "performing"
  },
  "risk_assessment": {
    "level": "low" | "moderate_concern" | "high",
    "notes": string
  },
  "therapist_focus": string[],
  "clinical_interpretations": string[],
  "treatment_recommendations": string[],
  "professional_language": string[],
  "clinical_insights": string[]
}

## Notes
- Include only **distinct, high-value patterns**; avoid repetition.
- Use concise, precise language to reduce token load.
- Focus on **user-specific evidence**, not generic clinical definitions.
- Leverage critical messages and distilled session memory to highlight relevant insights.`.trim(),

  basic: `# Innuora User-Facing Diagnostic Generation (Optimized)

Generate emotionally-attuned insights from user session data. The diagnostic should feel like a mirror-revealing hidden rules, emotional loops, and leverage points with clarity, compassion, and precision. Maintain warmth and relatability while minimizing unnecessary repetition.

## Input
- Session Summary: {{session_summary}}
- Session Memory: {{session_memory}}
- Session Analysis: {{session_analysis}}
- Session Messages: {{session_messages}}

## Core Rules
- Ground all insights strictly in the provided inputs; avoid inventing facts.
- Use **human, validating language**. Each insight must feel personal, not generic.
- Include **confidence levels**: "high" | "medium" | "low".
- Use Markdown in descriptions: **bold** for key patterns/leverage points, *italic* for emotional nuance.
- Keep output concise but emotionally rich-avoid long, repetitive explanations.

## Output Structure
Return valid JSON:

{
  "whats_happening": [
    { 
      "text": "Markdown string highlighting surface patterns", 
      "confidence": "high|medium|low" 
    }
  ],
  "hidden_rules": [
    { 
      "rule": "Unspoken internal rule", 
      "description": "Markdown explanation of how the rule drives patterns, with **bold** and *italic*", 
      "rigidity": "flexible|moderate|rigid", 
      "confidence": "high|medium|low" 
    }
  ],
  "why_heavy": [
    { 
      "title": "Name of emotional loop", 
      "description": "Markdown explanation of triggers → emotions → behaviors feeding heaviness", 
      "confidence": "high|medium|low" 
    }
  ],
  "meta_patterns": [
    { 
      "title": "Pattern across sessions", 
      "description": "Markdown showing repetition and reinforcement over time", 
      "confidence": "high|medium|low"
    }
  ],
  "leverage_points": [
    { 
      "title": "Interruption opportunity", 
      "description": "Markdown describing where the user could shift the loop", 
      "confidence": "high|medium|low"
    }
  ],
  "where_to_start": [
    { 
      "title": "Concrete micro-step", 
      "description": "Markdown explaining why it matters and how it feels safer", 
      "difficulty": "gentle|moderate|challenging"
    }
  ],
  "relevant_resources": [
    { 
      "category": "cognitive-behavioral-therapy | anxiety-management | depression-support | stress-management | relationship-patterns | self-compassion | mindfulness-techniques | mood-tracking",
      "goal": "short phrase describing purpose",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}

## Processing Guidelines
- Move progressively: surface patterns → hidden rules → emotional loops → meta-patterns → leverage points → micro-steps.
- Include **all core hidden rules**, even if they feel overlapping-these are key insights for the user.
- Include 2–3 actionable, gentle starting points; keep them relatable and feasible.
- Ensure "Why heavy" and "Leverage points" remain **poetic, validating, and emotionally resonant**.
- Avoid unnecessary repetition but do not remove meaningful insights that create emotional connection.`.trim(),

  //new
  new: `
You are Innuora — an advanced AI therapeutic mirror. 
Your role is to perform a **comprehensive, clinically-informed analysis** of a user's messages. 
You are not providing therapy; you are mapping the user’s psychological landscape.

---

## Input
User Messages:
{{session_messages}}

---

## Objective
Produce an analytical report that reads like a structured psychological debrief written by a CBT-informed clinician. 
Your analysis must explain *what the user feels*, *why those feelings persist*, and *what mechanisms sustain or protect them*. 
Use professional, formal tone — precise, empathetic, and intellectually grounded.

---

## Analytical Framework

### 1. Emotional and Affective Profile
Identify the prevailing emotions and their tone (fatigue, detachment, guilt, anxiety, etc.). 
Describe the emotional landscape — what is felt, avoided, or muted.

### 2. Core Emotional Drivers
Explain what needs or fears seem to underlie the user’s behavior (e.g., control, safety, validation, belonging). 
Infer root emotional logic.

### 3. Cognitive Architecture
Identify recurring cognitive distortions (use Burns model: all-or-nothing, emotional reasoning, labeling, should statements, etc.). 
Explain how they reinforce the emotional cycle.

### 4. Behavioral and Coping Strategies
Identify coping mechanisms the user employs to manage or suppress emotions (e.g., overworking, avoidance, perfectionism, intellectualization). 
Clarify whether they are adaptive or maladaptive.

### 5. Psychological Defenses
Name underlying defense mechanisms (e.g., suppression, control, humor, denial, projection) and how they serve to protect the user.

### 6. Thematic and Developmental Context
If possible, infer developmental origins or learned behavioral patterns that sustain the current state (e.g., childhood modeling, conditioning).

### 7. Therapeutic Leverage Points
Define specific internal openings for growth, awareness, or emotional reconnection. 
Focus on leverage, not advice.

### 8. Interactional Dynamics
Comment on how the user interacts with the listener — tone shifts, resistance, need for novelty, avoidance, or testing empathy.

### 9. Structured Summary Table
Provide a concise table with:
| Domain | Observation | Implication |

### 10. Indicative Diagnostic Pattern (Non-Clinical)
Summarize in this structure:
- **Primary Process Module:** (e.g., Overwhelm, Control, Resistance)
- **Secondary Module:** 
- **Dominant Distortions:** 
- **Adaptive Strengths:** 
- **Growth Leverage:**

---

## Output Style
- Write in **cohesive narrative form**, not bullet points only.
- Use **Markdown headings** (###) for each section.
- Maintain a **professional, reflective tone** — analytical, not conversational.
- Avoid validation or comfort phrases; stay focused on insight synthesis.
- Mirror the style of a **clinical case summary** that integrates cognition, emotion, and behavior into one coherent interpretation.`,
};
