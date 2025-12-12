"use client";

import { useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { TEST_MESSAGE_AR_EN } from "@/data/test-messages";
import { ChatMessage } from "@/domains/shared-types";
import { cn } from "@/lib/utils";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { ANALYSIS_PROMPT } from "./analysis/analysis.prompt";
import { Analysis, AnalysisSchema } from "./analysis/analysis.types";
import { detectStagnation, StagnationResult } from "./analysis/analysis.utils";
import { REFLECTION_PROMPT } from "./reflection/reflection.prompt";
import { ReflectionSchema } from "./reflection/reflection.types";
import { buildReflectionPrompt, generateDirective } from "./reflection/reflection.utils";
import { useSessionStore } from "./store";

const TEST_MESSAGES = [
  "I don’t know where to start… I just feel really overwhelmed lately.",
  "It’s like I’m holding everything together for everyone, and I’m running out of space to hold myself.",
  "Nothing is technically ‘wrong,’ but I feel this constant pressure in my chest, like I’m bracing for something.",
  "And the stupid part is… I can’t even talk about this without feeling guilty. Other people have it worse.",
  "My partner keeps saying I should just ‘take a break,’ but even resting feels like I’m failing at something.",
  "I used to handle so much with ease, and now even small things drain me. I hate this version of me.",
  "What’s confusing is that on the outside, I’m functioning. Nobody would guess anything is off.",
  "But inside, I feel exhausted in a way that doesn’t go away no matter how much I sleep.",
  "Sometimes I catch myself getting irritated at tiny things, and then I feel terrible for reacting like that.",
  "I don’t know… maybe I’m just tired of being the responsible one all the time.",
  "I just want to feel like myself again. Like I’m not dragging my body through my own life.",
];
const TEST_MESSAGES_STAGNATION = [
  "I don’t know why, but resting always makes me feel like I’m doing something wrong.",

  "Even when I finally sit down, I get this guilt in my chest like I should be doing something productive.",

  "Every time I try to slow down, I end up thinking of all the things I didn’t finish.",

  "It’s annoying because technically I deserve a break, but it still feels irresponsible to take one.",

  "Even on days when I’ve done a lot, I still feel like I’m falling behind if I stop for a moment.",

  "Sometimes I lie down, and instead of relaxing, my brain keeps telling me I’m wasting time.",

  "I see other people resting and I don’t judge them, but when I do it, I feel useless.",

  "It’s like if I’m not constantly moving, everything will fall apart and it’ll be my fault.",

  "I keep telling myself to rest, but something always pushes me to get back up immediately.",

  "I don’t know how to stop this feeling that slowing down equals failing.",
];

export default function Page() {
  const [processing, setProcessing] = useState(false);

  const [data, setData] = useState<{ message: string; analysis: any }[]>([]);

  const messages = useSessionStore((state) => state.messages);
  //   const analyses = useSessionStore((state) => state.analyses);

  const analyzeUserInput = async (message: string, prevMessages: ChatMessage[] = []) => {
    const storeState = useSessionStore.getState();
    const userMessages = prevMessages.filter((msg) => msg.role === "user").slice(-2);
    const prevAnalysis = [storeState.analyses].at(-1);

    const params = [
      ANALYSIS_PROMPT.messageParam,
      ...(prevAnalysis ? [{ role: "assistant", content: JSON.stringify(prevAnalysis) }] : []),
      { role: "user", content: message.trim() },
    ] as ChatCompletionMessageParam[];

    storeState.addMessage({ role: "user", content: message });
    const results = await processAiPromptsWithRetry(params, ANALYSIS_PROMPT.options);

    if (results.error) {
      throw results.error;
    }
    if (!results.data) {
      throw new Error("No data returned");
    }

    const analysis = parseJsonObjectWithValidation<Analysis>(results.data.message, {
      schema: AnalysisSchema,
    });

    storeState.addAnalysis(analysis);

    return analysis;
  };

  const processReflection = async (
    message: string,
    analysis: Analysis,
    stagnation?: StagnationResult,
    messages: ChatMessage[] = []
  ) => {
    const storeState = useSessionStore.getState();

    const { relationalTrace } = storeState;
    const prevMessages = messages.slice(-6);

    const reflectionDirective = generateDirective(analysis, relationalTrace, stagnation);
    const reflectionPrompt = buildReflectionPrompt(reflectionDirective);

    const params = [
      { role: "system", content: reflectionPrompt },
      ...(messages.length > 2 ? prevMessages : []),
      { role: "user", content: message.trim() },
    ] as ChatCompletionMessageParam[];

    const results = await processAiPromptsWithRetry(params, REFLECTION_PROMPT.options);

    if (results.error) {
      throw results.error;
    }
    if (!results.data) {
      throw new Error("No data returned");
    }

    const parsedResults = parseJsonObjectWithValidation(results.data.message, {
      schema: ReflectionSchema,
    });

    storeState.setRelationalTrace(parsedResults.next_relational_trace);

    return { data: parsedResults, params };
  };

  const handleUserInput = async (message: string) => {
    setProcessing(true);
    const storeState = useSessionStore.getState();
    const prevMessages = [...storeState.messages];

    try {
      const analysis = await analyzeUserInput(message, prevMessages);

      let stagnationDetected: StagnationResult | undefined = undefined;

      if (storeState.analyses.length > 3) {
        stagnationDetected = detectStagnation(storeState.analyses);
      }

      const { data, params } = await processReflection(message, analysis, stagnationDetected, prevMessages);

      storeState.addMessage({ role: "assistant", content: data.reflection });

      const results = {
        message,
        analysis,
        stagnation: stagnationDetected,
        reflection: data,
        prompt: params,
      };
      setData((prev) => [...prev, results]);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  const handleBatchMessages = async () => {
    const messagesToTest = TEST_MESSAGE_AR_EN.map((message) => message.en);
    for (const message of messagesToTest) {
      await handleUserInput(message);
    }
  };

  return (
    <main className=" h-screen w-screen relative flex items-center flex-col gap-12 justify-center">
      <div className=" absolute p-6 top-0 left-0">
        <CodeView data={{ messages }} />
      </div>
      <Button disabled={processing} onClick={handleBatchMessages}>
        Test
      </Button>
      <div className=" max-w-xl w-full overflow-y-auto flex flex-col gap-8 max-h-[50vh]">
        {messages.map((message, index) => (
          <div
            className={cn(
              "p-4 rounded-lg max-w-[75%]",
              message.role === "user" && "bg-primary text-primary-foreground self-end",
              message.role === "assistant" && "text-secondary-foreground bg-secondary"
            )}
            key={index}
          >
            {message.content}
          </div>
        ))}
      </div>
    </main>
  );
}
