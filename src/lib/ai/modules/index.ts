import { SessionModule } from "@/lib/ai/session-modules";

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
};
