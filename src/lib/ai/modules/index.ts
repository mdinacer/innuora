import { SessionModule } from "@/lib/ai/session-modules";
import { LanguagePrompt, PersonaPrompt, SecurityProtocolPrompt, TonePrompt } from "../prompts";
import { MIRAEL_PERSONA_PROMPT_INSTRUCTIONS } from "../prompts/prompt.persona";
import STATE_ANALYSIS_PROMPT from "../prompts/prompt.state-analysis";

export const MODULES_INSTRUCTIONS_MAP_ASYNC: Record<SessionModule, () => Promise<string>> = {
  crisis: () => import("@/lib/ai/modules/prompts.module.crisis").then((m) => m.default),
  validate: () => import("@/lib/ai/modules/prompts.module.validate").then((m) => m.default),
  resistance_pushback: () => import("@/lib/ai/modules/prompts.module.res_pushback").then((m) => m.default),
  resistance_overwhelm: () => import("@/lib/ai/modules/prompts.module.res_overwhelm").then((m) => m.default),
  psychoeducation: () => import("@/lib/ai/modules/prompts.module.psychoed").then((m) => m.default),
  cognitive: () => import("@/lib/ai/modules/prompts.module.cognitive").then((m) => m.default),
  pattern: () => import("@/lib/ai/modules/prompts.module.pattern").then((m) => m.default),
  overwhelm: () => import("@/lib/ai/modules/prompts.module.overwhelm").then((m) => m.default),
  first_time: () => import("@/lib/ai/modules/prompts.module.first_time").then((m) => m.default),
  guidance: () => import("@/lib/ai/modules/prompts.module.guidance").then((m) => m.default),
  behavioral: () => import("@/lib/ai/modules/prompts.module.behavioral").then((m) => m.default),
  core_beliefs: () => import("@/lib/ai/modules/prompts.module.beliefs").then((m) => m.default),
  reframing: () => import("@/lib/ai/modules/prompts.module.reframing").then((m) => m.default),
  shoulds: () => import("@/lib/ai/modules/prompts.module.shoulds").then((m) => m.default),
};

export async function getAllModules() {
  const keys = Object.keys(MODULES_INSTRUCTIONS_MAP_ASYNC) as SessionModule[];

  const result = await keys.reduce<Promise<Record<SessionModule, string>>>(
    async (accP, key) => {
      const acc = await accP;
      acc[key] = await MODULES_INSTRUCTIONS_MAP_ASYNC[key]();
      return acc;
    },
    Promise.resolve({} as Record<SessionModule, string>)
  );

  return result;
}

export async function getAllPrompts() {
  const modulesPrompts = await getAllModules();
  const prompts = {
    securityProtocol: SecurityProtocolPrompt,
    personaPrompt: PersonaPrompt.content as string,
    personaInstructions: MIRAEL_PERSONA_PROMPT_INSTRUCTIONS,
    tonePrompts: TonePrompt,
    stateAnalysisPrompt: STATE_ANALYSIS_PROMPT.content as string,
    languagePrompts: {
      en: LanguagePrompt.en.content as string,
      ar: LanguagePrompt.ar.content as string,
      fr: LanguagePrompt.fr.content as string,
    },
    module: {
      ...modulesPrompts,
    },
    userContextPrompt: `
      You are provided with context from the user’s previous messages.
      When analyzing the current message:
      - Use prior primary and secondary modules as context for trends and emotional patterns.
      - Note recurring themes across previous analyses.
      - Adjust intensity based on continuity or escalation of emotional load.
      - Avoid overriding a module unless the emotional context clearly changes.
      - Include cognitive distortions if detected, even if they were not present before.
      - Aim for a nuanced, emotionally attuned analysis that respects the user’s ongoing state.
    `,
  };

  return prompts;
}
