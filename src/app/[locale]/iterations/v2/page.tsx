"use client";

import { useEffect, useRef, useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { TEST_MESSAGE_AR_EN } from "@/data/test-messages";
import { ChatMessage } from "@/domains/shared-types";
import { cn } from "@/lib/utils";
import { parseJsonObjectWithValidation } from "@/lib/utils/parse-json";
import { CONTINUITY_PROMPT } from "./continuity/continuity.prompt";
import { ContinuityAnalysis, ContinuityAnalysisSchema } from "./continuity/continuity.types";
import { REFLECTION_PROMPT } from "./reflection/reflection.prompt";
import { Metadata, Reflection, ReflectionSchema } from "./reflection/reflection.types";
import { buildReflectionDirective } from "./reflection/reflection.utils";
import { useSessionStore } from "./store";

const TEST_MESSAGES_AR = [
  "لا أعرف من أين أبدأ… أشعر بأنني مُتعبة من الداخل دون سبب واضح.",
  "في الأيام الأخيرة، صرت أستيقظ وفي صدري ثقل… كأن شيئًا ينتظرني وأنا لا أعرف ما هو.",
  "أحاول أن أُكمل يومي بشكل طبيعي، لكن داخلي غير مستقر… كأنني أمثّل فقط.",
  "حتى الأشخاص القريبون مني لا يلاحظون شيئًا… وهذا يجعلني أشعر وكأنني غير مرئية.",
  "أحيانًا أفكر أن المشكلة ليست فيما يحدث حولي، بل في داخلي أنا.",
  "أحاول أن أشرح لنفسي ما الذي يزعجني، لكن أفكاري كلها متداخلة ومشوشة.",
  "كلما حاولت أن أرتاح قليلًا، أشعر بذنب غريب… كأنني أضيّع وقتي.",
  "وفي نفس الوقت… أنا مرهقة فعلاً، لكنني لا أسمح لنفسي أن أتوقف.",
  "أتعامل مع نفسي بقسوة… ولا أعرف كيف أتوقف عن جلد ذاتي.",
  "هناك لحظات أشعر فيها وكأنني سأبكي بدون سبب، ثم أقول لنفسي: ‘مبالغة، تجاهلي’.",
  "الشيء الذي يخيفني فعلاً… أنني بدأت أعتاد هذا الشعور الثقيلة وكأنه طبيعي.",
  "أحيانًا أشعر أنني أعيش على وضع البقاء فقط، وليس حياة حقيقية.",
  "أكره أن أبدو ضعيفة أمام أحد، لذلك أكتم كل شيء بداخلي.",
  "لكن الصراحة… تعبت من الكتمان.",
  "لا أعرف ما الذي أحتاجه بالضبط… لكنني أعلم أنني لا أستطيع الاستمرار بهذا الشكل.",
];
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

  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<
    { message: string; reflection: string; metadata: Metadata; continuity?: ContinuityAnalysis; [key: string]: any }[]
  >([]);

  const messages = useSessionStore((state) => state.messages);

  const handleContinuityAnalysis = async (userInput: string) => {
    const params = [
      CONTINUITY_PROMPT.messageParam,
      {
        role: "assistant",
        content: `
      You will receive structured conversation history for analysis.

HISTORY (oldest → newest):

${JSON.stringify(
  data.map((d) => ({
    user: d.message,
    reflection: d.reflection,
    metadata: d.metadata,
  })),
  null,
  2
)}

NEW_MESSAGE:
${userInput.trim()}

Your task: produce continuity_analysis according to the JSON schema.
      `,
      },
    ] as ChatCompletionMessageParam[];

    const results = await processAiPromptsWithRetry(params, CONTINUITY_PROMPT.options);

    if (results.error) {
      throw results.error;
    }
    if (!results.data) {
      throw new Error("No data returned");
    }
    const parsedResults = parseJsonObjectWithValidation(results.data.message, {
      schema: ContinuityAnalysisSchema,
    });

    return parsedResults;
  };

  const processReflection = async (message: string, messages: ChatMessage[], continuity: ContinuityAnalysis) => {
    const storeState = useSessionStore.getState();
    const prevMessages = messages.slice(-6);

    const metadata = storeState.metadata;
    const updatedDirective = buildReflectionDirective(continuity, metadata);

    const directive = metadata
      ? {
          role: "system",
          content: `
Directive for this reflection:
- depth: ${updatedDirective.depth}
- topic: "${updatedDirective.topic}"
- move: ${updatedDirective.move}
- allow_question: ${updatedDirective.allow_question}

Apply these rules when generating the reflection.
`.trim(),
        }
      : null;

    const params = [
      REFLECTION_PROMPT.messageParam,
      ...(directive ? [directive] : []),
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

    console.log(results.data);

    const parsedData = parseJsonObjectWithValidation<Reflection>(results.data.message, {
      schema: ReflectionSchema,
    });

    return { response: parsedData, params };
  };

  const handleUserInput = async (message: string) => {
    setProcessing(true);
    const storeState = useSessionStore.getState();
    const prevMessages = [...storeState.messages];

    try {
      storeState.addMessage({ role: "user", content: message.trim() });

      const continuityAnalysisResults = await handleContinuityAnalysis(message);

      const { response } = await processReflection(message, prevMessages, continuityAnalysisResults);

      // const { response, params } = await processReflection(message, prevMessages);

      const reflectionContent = `${response.reflection} ${response.question ? `\n\n${response.question}` : ""}`;

      storeState.addMessage({ role: "assistant", content: reflectionContent });

      storeState.setMetadata(response.metadata);

      const results = {
        message,
        reflection: response.reflection,
        metadata: response.metadata,
        continuity: continuityAnalysisResults,
      };
      setData((prev) => [...prev, results]);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  const handleBatchMessages = async () => {
    const messagesToTest = TEST_MESSAGE_AR_EN.map((message) => message.ar);
    for (const message of messagesToTest) {
      await handleUserInput(message);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className=" h-screen w-screen relative flex items-center flex-col gap-12 justify-center">
      <div className=" absolute p-6 top-0 left-0">
        <CodeView data={{ messages }} />
      </div>
      <Button disabled={processing} onClick={handleBatchMessages}>
        Test
      </Button>
      <div ref={containerRef} className="max-w-xl w-full overflow-y-auto flex flex-col gap-8 max-h-[50vh]">
        {messages.map((message, index) => (
          <div
            dir="rtl"
            className={cn(
              "p-4 rounded-lg max-w-[75%] rtl:font-arabic-sans rtl:text-lg whitespace-pre-wrap",
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
