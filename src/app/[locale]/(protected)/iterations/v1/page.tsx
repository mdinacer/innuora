"use client";

import { useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { Container } from "@/components/chat-ui";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { EMOTIONAL_READING_INSTRUCTIONS } from "./emotional-reading";
import { REFLECTIVE_EXPRESSION_INSTRUCTIONS } from "./reflective-expression";
import { RELATIONAL_STANCE_INSTRUCTIONS } from "./relational-stance";
import { useMockStore } from "./store";
import {
  EmotionalReadingResult,
  ReflectiveExpressionMeta,
  ReflectiveExpressionResponse,
  RelationalStance,
  RelationalTrace,
} from "./types";

const generateRelationalTrace = (emotionalReading: EmotionalReadingResult, relationalStance: RelationalStance) => {
  return {
    last_theme:
      emotionalReading.primary_emotion.includes("numb") || emotionalReading.driver.includes("disconnection")
        ? "emotional disconnection and numbness"
        : emotionalReading.primary_emotion,

    tone_shift:
      emotionalReading.rhythm.includes("tense") || emotionalReading.rhythm.includes("clipped")
        ? "maintain steady containment, avoid mirroring intensity"
        : relationalStance.warmth_level >= 4
          ? "sustain warmth, open slightly"
          : relationalStance.warmth_level === 3
            ? "maintain steady containment, slightly increase warmth"
            : "maintain calm neutrality",

    unresolved_thread: emotionalReading.driver.includes("control")
      ? "fear of losing control or safety through stillness"
      : emotionalReading.driver.includes("guilt")
        ? "conflict between worth and rest"
        : relationalStance.goal_for_next_layer || "emotional continuity pending",
  } as RelationalTrace;
};

export default function IterationV1Route() {
  const [testingResults, setTestingResults] = useState<any[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const messages = useMockStore((state) => state.messages);

  const getContext = () => {
    const state = useMockStore.getState();
    const lastRound = [...state.messages].slice(-2);
    const previousUserMessage = lastRound.find((m) => m.role === "user")?.content;
    const previousReflection = lastRound.find((m) => m.role === "assistant")?.content;
    const previousEmotionalReading = [...state.emotionalReadings].at(-1);
    const previousReflectionMeta = [...state.reflections].at(-1)?.meta;
    const previousRelationalTrace = [...state.relationalTraces].at(-1);

    return {
      previousUserMessage,
      previousReflection,
      previousEmotionalReading,
      previousReflectionMeta,
      previousRelationalTrace,
    };
  };

  const handleEmotionalReading = async (
    userInput: string,
    prevRound: { prevUserMessage?: string; prevReflection?: string },
    prevReading?: EmotionalReadingResult,
    relationalTrace?: RelationalTrace
  ) => {
    try {
      const { prevReflection, prevUserMessage } = prevRound;
      const payload = [
        ...(prevUserMessage ? [`Previous user message: ${prevUserMessage}`] : []),
        ...(prevReflection ? [`Previous assistant message: ${prevReflection}`] : []),
        ...(prevReading ? [`Previous emotional reading: ${prevReading}`] : []),
        ...(relationalTrace ? [`Relational trace: ${JSON.stringify(relationalTrace)}`] : []),
      ];

      const payloadContent = payload.length > 0 ? payload.join("\n") : "";

      const prompts: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: EMOTIONAL_READING_INSTRUCTIONS.replace("{{INPUTS}}", payloadContent).replace(
            "{{current_user_message}}",
            userInput.trim()
          ),
        },
      ];

      const aiResults = await processAiPromptsWithRetry(prompts);

      if (aiResults.error) {
        throw new Error("AI processing failed");
      }
      if (!aiResults.data) {
        throw new Error("AI processing failed");
      }

      const emotionalReading = parseJsonObject(aiResults.data.message) as EmotionalReadingResult;

      return { data: emotionalReading, tokenUsage: aiResults.data.modelTokenUsage };
    } catch (error) {
      console.error(error);
    }
  };
  const handleRelationalStance = async (emotionalReading: EmotionalReadingResult) => {
    try {
      const prompts: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: RELATIONAL_STANCE_INSTRUCTIONS.replace(
            "{{EMOTIONAL_READING}}",
            JSON.stringify(emotionalReading, null, 2)
          ),
        },
      ];

      const aiResults = await processAiPromptsWithRetry(prompts);

      if (aiResults.error) {
        throw new Error("AI processing failed");
      }
      if (!aiResults.data) {
        throw new Error("AI processing failed");
      }

      const relationalStance = parseJsonObject(aiResults.data.message) as RelationalStance;

      return { data: relationalStance, tokenUsage: aiResults.data.modelTokenUsage };
    } catch (error) {
      console.error(error);
    }
  };
  const handleReflectiveExpression = async (
    userInput: string,
    emotionalReading: EmotionalReadingResult,
    relationalStance: RelationalStance,
    prevReflectionMeta?: ReflectiveExpressionMeta
  ) => {
    try {
      const prompts: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: REFLECTIVE_EXPRESSION_INSTRUCTIONS.replace("{{USER_MESSAGE}}", userInput)
            .replace("{{EMOTIONAL_READING}}", JSON.stringify(emotionalReading, null, 2))
            .replace("{{RELATIONAL_STANCE}}", JSON.stringify(relationalStance, null, 2))
            .replace("{{PREVIOUS_REFLECTION_META}}", prevReflectionMeta ? JSON.stringify(prevReflectionMeta) : ""),
        },
      ];

      const aiResults = await processAiPromptsWithRetry(prompts);

      if (aiResults.error) {
        throw new Error("AI processing failed");
      }
      if (!aiResults.data) {
        throw new Error("AI processing failed");
      }

      const reflectiveExpression = parseJsonObject(aiResults.data.message) as ReflectiveExpressionResponse;

      return { data: reflectiveExpression, tokenUsage: aiResults.data.modelTokenUsage, prompts };
    } catch (error) {
      console.error(error);
    }
  };

  const processUserInput = async (userInput: string) => {
    setIsProcessing(true);
    if (!userInput.trim().length) {
      setIsProcessing(false);
      throw new Error("Please enter a message");
    }
    try {
      const state = useMockStore.getState();

      const {
        previousUserMessage,
        previousReflection,
        previousEmotionalReading,
        previousReflectionMeta,
        previousRelationalTrace,
      } = getContext();

      const userMessage: OpenChatMessage = {
        id: generateMessageId(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      };

      state.addMessage(userMessage);

      const emotionalReadingResult = await handleEmotionalReading(
        userInput,
        {
          prevUserMessage: previousUserMessage,
          prevReflection: previousReflection,
        },
        previousEmotionalReading,
        previousRelationalTrace
      );

      if (!emotionalReadingResult) {
        throw new Error("Emotional reading failed");
      }

      state.addEmotionalReading(emotionalReadingResult.data);

      const relationalStanceResult = await handleRelationalStance(emotionalReadingResult.data);

      if (!relationalStanceResult) {
        throw new Error("Relational stance failed");
      }

      const { data: relationalStance } = relationalStanceResult;

      const reflectiveExpressionResult = await handleReflectiveExpression(
        userInput,
        emotionalReadingResult.data,
        relationalStanceResult.data,
        previousReflectionMeta
      );

      if (!reflectiveExpressionResult) {
        throw new Error("Reflective expression failed");
      }

      const { data: emotionalReading } = emotionalReadingResult;

      // Build relational trace for the next round
      const relationalTrace: RelationalTrace = generateRelationalTrace(emotionalReading, relationalStance);

      state.addRelationalTrace(relationalTrace);

      state.addReflection(userMessage.id, reflectiveExpressionResult.data);

      state.addMessage({
        id: generateMessageId(),
        role: "assistant",
        content: reflectiveExpressionResult.data.reflection,
        timestamp: Date.now(),
      });

      if (reflectiveExpressionResult.data.psychoeducational_thread?.content) {
        state.addMessage({
          id: generateMessageId(),
          role: "assistant",
          content: `**PSYCHO-EDUCATION:**\n${reflectiveExpressionResult.data.psychoeducational_thread.content}`,
          timestamp: Date.now(),
        });
      }

      setTestingResults((prev) => [
        ...prev,
        {
          userMessage: userInput,
          emotionalReading: emotionalReadingResult.data,
          relationalStance: relationalStanceResult.data,
          reflectiveExpression: reflectiveExpressionResult.data,
          //reflectionPrompts: reflectiveExpression.prompts,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchProcess = async () => {
    // Take three first messages
    const messagesToAnalyze = therapeuticDialogue.filter((msg) => msg.role === "user"); //.slice(0, 3);
    // Adjustable delay (in milliseconds)
    const delayBetweenRounds = 300; // 4 seconds to simulate human pacing
    try {
      for (const message of messagesToAnalyze) {
        await processUserInput(message.content);
        // Simulate user reading + writing delay
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRounds));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <main className=" min-h-screen overflow-y-auto w-screen bg-inn-bg-primary">
      <CodeView data={{ messages, testingResults }} className="absolute top-6 left-6 z-40" />
      <Button disabled={isProcessing} onClick={handleBatchProcess} className="absolute bottom-6 right-6">
        {isProcessing ? "Processing..." : "Process"}
      </Button>
      <Container
        title={"Test Session"}
        messages={messages}
        isLoading={isProcessing}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={processUserInput}
      />
    </main>
  );
}

const therapeuticDialogue = [
  {
    role: "user",
    content:
      "I think I’m just… tired. But not the kind of tired that sleep fixes. It’s like everything I do feels transactional. Even rest feels like another task.",
  },
  {
    role: "assistant",
    content:
      "Yeah, that kind of exhaustion runs deeper. It’s not physical — it’s when your brain keeps running even after you shut the laptop.",
  },
  {
    role: "user",
    content: "Exactly. And if I’m not doing something, I get this wave of guilt. Like I’m wasting time.",
  },
  {
    role: "assistant",
    content: "That’s the “should” voice — it sneaks in and turns rest into failure. It’s not truth, it’s conditioning.",
  },
  {
    role: "user",
    content: "So what, I’m just… brainwashed by ambition?",
  },
  {
    role: "assistant",
    content:
      "Kind of. It’s like you trained your brain to only feel safe when you’re productive. You can’t unlearn that overnight, but you can start catching it.",
  },
  {
    role: "user",
    content: "Catching it?",
  },
  {
    role: "assistant",
    content:
      "Yeah, like noticing the thought instead of obeying it. When you hear, “I should be doing more,” just pause and ask, “Says who?” Sometimes it’s not even your voice — it’s an old rule you never questioned.",
  },
  {
    role: "user",
    content:
      "Funny. I’d never talk to my team like that. If one of them said they were exhausted, I’d tell them to take the day off.",
  },
  {
    role: "assistant",
    content: "And yet here you are, convincing yourself you don’t deserve the same break. Classic double standard.",
  },
  {
    role: "user",
    content: "You’re too good at this. It’s annoying.",
  },
  {
    role: "assistant",
    content:
      "Trust me, I’ve lived it. The whole “I’ll rest when it’s done” era nearly broke me. Spoiler: it’s never done.",
  },
  {
    role: "user",
    content: "God, that’s true. There’s always another project, another thing to fix.",
  },
  {
    role: "assistant",
    content: "Exactly. So the real flex? Learning to stop without earning it.",
  },
  {
    role: "user",
    content: "That sounds impossible.",
  },
  {
    role: "assistant",
    content: "It’s uncomfortable, not impossible. Big difference.",
  },
];
