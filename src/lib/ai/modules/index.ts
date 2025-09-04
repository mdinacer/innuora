import { SessionModule } from "@/lib/ai/session-modules";

export const MODULES_INSTRUCTIONS_MAP_ASYNC: Record<SessionModule, () => Promise<string>> = {
  crisis: () => import("./prompts.module.crisis").then((m) => m.default),
  validate: () => import("./prompts.module.validate").then((m) => m.default),
  resistance_pushback: () => import("./prompts.module.res_pushback").then((m) => m.default),
  resistance_overwhelm: () => import("./prompts.module.res_overwhelm").then((m) => m.default),
  psychoeducation: () => import("./prompts.module.psychoed").then((m) => m.default),
  cognitive: () => import("./prompts.module.cognitive").then((m) => m.default),
  pattern: () => import("./prompts.module.pattern").then((m) => m.default),
  overwhelm: () => import("./prompts.module.overwhelm").then((m) => m.default),
  first_time: () => import("./prompts.module.first_time").then((m) => m.default),
  guidance: () => import("./prompts.module.guidance").then((m) => m.default),
};
