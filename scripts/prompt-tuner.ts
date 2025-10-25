import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

import { HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS } from "@/app/[locale]/(protected)/iterations/v2/prompts";
import {
  ConversationTurn,
  EngineConfig,
  HolisticEngineInput,
  HolisticEngineOutput,
  RelationalTraceApp,
} from "@/app/[locale]/(protected)/iterations/v2/types";
import {
  buildHolisticEnginePrompt,
  clampWarmth,
  enforcePsychoeduCooldown,
  updateTraceFromOutput,
} from "@/app/[locale]/(protected)/iterations/v2/utils";
import { parseJsonObject } from "@/lib/utils/parse-json";

type AssistantLine = {
  user: string;
  reflection: string;
  meta: HolisticEngineOutput["meta"] | null;
};

type EvaluationResult = {
  score: number;
  feedback: string;
  adjustments: string;
};

type VoiceBlockSuggestion = {
  voice_block: string;
  rationale: string;
};

const SAMPLE_DIALOGUE: AssistantLine[] = [
  {
    user: "I think I’m just… tired. But not the kind of tired that sleep fixes. It’s like everything I do feels transactional. Even rest feels like another task.",
    reflection:
      "Yeah, that kind of exhaustion runs deeper. It’s not physical — it’s when your brain keeps running even after you shut the laptop.",
    meta: null,
  },
  {
    user: "Exactly. And if I’m not doing something, I get this wave of guilt. Like I’m wasting time.",
    reflection:
      "That’s the “should” voice — it sneaks in and turns rest into failure. It’s not truth, it’s conditioning.",
    meta: null,
  },
  {
    user: "So what, I’m just… brainwashed by ambition?",
    reflection:
      "Kind of. It’s like you trained your brain to only feel safe when you’re productive. You can’t unlearn that overnight, but you can start catching it.",
    meta: null,
  },
  {
    user: "Catching it?",
    reflection:
      "Yeah, like noticing the thought instead of obeying it. When you hear, “I should be doing more,” just pause and ask, “Says who?” Sometimes it’s not even your voice — it’s an old rule you never questioned.",
    meta: null,
  },
  {
    user: "Funny. I’d never talk to my team like that. If one of them said they were exhausted, I’d tell them to take the day off.",
    reflection: "And yet here you are, convincing yourself you don’t deserve the same break. Classic double standard.",
    meta: null,
  },
  {
    user: "You’re too good at this. It’s annoying.",
    reflection:
      "Trust me, I’ve lived it. The whole “I’ll rest when it’s done” era nearly broke me. Spoiler: it’s never done.",
    meta: null,
  },
  {
    user: "God, that’s true. There’s always another project, another thing to fix.",
    reflection: "Exactly. So the real flex? Learning to stop without earning it.",
    meta: null,
  },
  {
    user: "That sounds impossible.",
    reflection: "It’s uncomfortable, not impossible. Big difference.",
    meta: null,
  },
];

const TARGET_SCORE = 92;
const MAX_ITERATIONS = 6;
const VOICE_START = "Sarah-Leila voice constraints (friend realism)";
const VOICE_END = "Lived-recognition line (optional)";

const CONFIG: EngineConfig = {
  warmth_clamp_delta: 1,
  psychoedu_cooldown_turns: 4,
  micro_breath_cooldown: 2,
};

const apiKey = process.env.OPEN_ROUTER_API_KEY;
if (!apiKey) {
  throw new Error("OPEN_ROUTER_API_KEY not set in environment.");
}

const openai = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

function splitInstructions(instructions: string) {
  const startIdx = instructions.indexOf(VOICE_START);
  const endIdx = instructions.indexOf(VOICE_END);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error("Unable to locate voice constraint block in instructions.");
  }

  const prefix = instructions.slice(0, startIdx + VOICE_START.length);
  const voiceBlock = instructions.slice(startIdx + VOICE_START.length, endIdx).trim();
  const suffix = instructions.slice(endIdx);

  return { prefix, voiceBlock, suffix };
}

function buildInstructions(prefix: string, voiceBlock: string, suffix: string) {
  const trimmedBlock = voiceBlock.trim();
  const normalizedSuffix = suffix.startsWith("\n") ? suffix : `\n${suffix}`;
  return `${prefix}\n${trimmedBlock}\n${normalizedSuffix}`;
}

async function simulateConversation(instructions: string): Promise<AssistantLine[]> {
  const dialogue: AssistantLine[] = [];

  const messages: ConversationTurn[] = [];
  let relationalTrace: RelationalTraceApp = {};

  for (const turn of SAMPLE_DIALOGUE) {
    messages.push({ role: "user", content: turn.user });

    const engineInput: HolisticEngineInput = {
      conversation_window: messages.slice(-6),
      current_user_message: turn.user,
      relational_trace: {
        last_theme: relationalTrace.last_theme,
        tone_shift: relationalTrace.tone_shift,
        unresolved_thread: relationalTrace.unresolved_thread,
        last_warmth_level: relationalTrace.last_warmth_level,
        psychoeducation_last_turn: relationalTrace.psychoeducation_last_turn,
      },
      config: CONFIG,
    };

    const prompt = buildHolisticEnginePrompt(instructions, engineInput);
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL_NAME || "gpt-4.1-mini",
      messages: [prompt],
      max_completion_tokens: 700,
      temperature: 0.6,
      top_p: 0.9,
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error("Model returned empty response during simulation.");
    }

    let output = parseJsonObject<HolisticEngineOutput>(raw);
    const clamped = clampWarmth(output.meta.warmth_level, relationalTrace.last_warmth_level, CONFIG.warmth_clamp_delta);
    output.meta.warmth_level = clamped;
    output.next_relational_trace.last_warmth_level = clamped;
    output = enforcePsychoeduCooldown(output, relationalTrace);
    relationalTrace = updateTraceFromOutput(relationalTrace, output, CONFIG);

    messages.push({ role: "assistant", content: output.reflection });
    dialogue.push({ user: turn.user, reflection: output.reflection, meta: output.meta });
  }

  return dialogue;
}

function formatAssistantLines(lines: AssistantLine[]) {
  return lines
    .map(
      (line, idx) =>
        `Turn ${idx + 1}:\n  user: ${line.user}\n  assistant: ${line.reflection}\n  stance: ${
          line.meta?.stance ?? "n/a"
        }; warmth: ${line.meta?.warmth_level ?? "n/a"}; tone: ${line.meta?.tone_intent ?? "n/a"}`
    )
    .join("\n\n");
}

async function evaluateConversation(candidate: AssistantLine[]): Promise<EvaluationResult> {
  const messages = [
    {
      role: "system" as const,
      content:
        'You are a style evaluator. Compare sample vs candidate assistant replies. Output strict JSON: {"score": number (0-100), "feedback": "string", "adjustments": "string"}. Higher scores mean closer to sample\'s emotional realism, warmth, pacing, and conversational flow. Highlight verb tense, sentence length, and tone issues.',
    },
    {
      role: "user" as const,
      content: `Sample assistant lines:\n${formatAssistantLines(SAMPLE_DIALOGUE)}\n\nCandidate assistant lines:\n${formatAssistantLines(
        candidate
      )}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_NAME || "gpt-4.1-mini",
    messages,
    temperature: 0.2,
    max_completion_tokens: 600,
  });

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Evaluation model returned empty response.");
  }

  const parsed = parseJsonObject<EvaluationResult>(raw);
  return parsed;
}

async function suggestVoiceBlock(
  currentBlock: string,
  evaluation: EvaluationResult,
  candidate: AssistantLine[]
): Promise<VoiceBlockSuggestion> {
  const messages = [
    {
      role: "system" as const,
      content: `You revise the "Sarah-Leila voice constraints (friend realism)" bullet block ONLY. Keep heading and bullet formatting. Each bullet must start with "- ". Do not add or remove other sections. Return JSON: {"voice_block":"<updated bullet list>", "rationale":"<short explanation>"}.`,
    },
    {
      role: "user" as const,
      content: `Current bullet block:\n${currentBlock.trim()}\n\nEvaluation:\nscore: ${evaluation.score}\nfeedback: ${evaluation.feedback}\nadjustments: ${evaluation.adjustments}\n\nCandidate assistant lines:\n${formatAssistantLines(
        candidate
      )}\n\nSample assistant lines (for reference):\n${formatAssistantLines(SAMPLE_DIALOGUE)}\n\nFocus on keeping language plain, present-tense, 2 short sentences max, and preserving warmth without metaphors.`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_NAME || "gpt-4.1-mini",
    messages,
    temperature: 0.4,
    max_completion_tokens: 500,
  });

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Voice block suggestion returned empty response.");
  }

  const parsed = parseJsonObject<VoiceBlockSuggestion>(raw);
  return parsed;
}

async function main() {
  const applyChanges = process.argv.includes("--apply");
  const { prefix, voiceBlock: initialBlock, suffix } = splitInstructions(HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS);

  let voiceBlock = initialBlock;
  let bestScore = -Infinity;
  let bestDialogue: AssistantLine[] = [];
  let bestVoiceBlock = voiceBlock;

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    const instructions = buildInstructions(prefix, voiceBlock, suffix);
    console.log(`\n=== Iteration ${iteration} ===`);

    const dialogue = await simulateConversation(instructions);
    const evaluation = await evaluateConversation(dialogue);

    console.log(`Score: ${evaluation.score}`);
    console.log(`Feedback: ${evaluation.feedback}`);
    console.log(`Adjustments: ${evaluation.adjustments}`);

    if (evaluation.score > bestScore) {
      bestScore = evaluation.score;
      bestDialogue = dialogue;
      bestVoiceBlock = voiceBlock;
    }

    if (evaluation.score >= TARGET_SCORE) {
      console.log("Target score reached. Stopping tuning.");
      break;
    }

    if (iteration === MAX_ITERATIONS) {
      console.log("Max iterations reached.");
      break;
    }

    const suggestion = await suggestVoiceBlock(voiceBlock, evaluation, dialogue);
    console.log("Voice block rationale:", suggestion.rationale);

    const cleanedBlock = suggestion.voice_block
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();

    if (!cleanedBlock.startsWith("- ")) {
      console.warn("Suggested voice block does not start with bullet formatting. Retaining previous block.");
      continue;
    }

    if (cleanedBlock === voiceBlock.trim()) {
      console.log("Voice block unchanged. Ending loop to prevent infinite cycle.");
      break;
    }

    voiceBlock = `\n${cleanedBlock}\n`;
  }

  console.log("\n=== Best Result ===");
  console.log(`Score: ${bestScore}`);
  console.log("Dialogue preview:\n");
  console.log(formatAssistantLines(bestDialogue));

  const finalInstructions = buildInstructions(prefix, bestVoiceBlock, suffix);
  console.log("\n=== Final Voice Block ===");
  console.log(bestVoiceBlock.trim());

  console.log("\n=== Final Instructions Snippet ===");
  console.log(finalInstructions);

  if (applyChanges) {
    const promptsPath = path.resolve(process.cwd(), "src/app/[locale]/(protected)/iterations/v2/prompts.ts");
    const raw = await fs.readFile(promptsPath, "utf8");
    const startIdx = raw.indexOf(VOICE_START);
    const endIdx = raw.indexOf(VOICE_END);
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      throw new Error("Unable to update prompts.ts — voice block markers not found.");
    }
    const before = raw.slice(0, startIdx + VOICE_START.length);
    const after = raw.slice(endIdx);
    const updated = `${before}\n${bestVoiceBlock.trim()}\n\n${after}`;
    await fs.writeFile(promptsPath, updated);
    console.log(`\nApplied tuned voice block to ${promptsPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
