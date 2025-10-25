import { ChatCompletionMessageParam } from "openai/resources";

import { EngineConfig, HolisticEngineInput, HolisticEngineOutput, RelationalTraceApp } from "./types";

// ------------------------------------
// Helpers: clamp, cooldowns, gating
// ------------------------------------
export function clampWarmth(candidate: number, lastWarmth?: number, delta: number = 1) {
  if (typeof lastWarmth !== "number") {
    return Math.max(1, Math.min(5, candidate));
  }
  const diff = Math.abs(candidate - lastWarmth);
  if (diff <= delta) return Math.max(1, Math.min(5, candidate));
  const direction = candidate > lastWarmth ? 1 : -1;
  return Math.max(1, Math.min(5, lastWarmth + direction * delta));
}

export function updateTraceFromOutput(
  trace: RelationalTraceApp = {},
  out: HolisticEngineOutput,
  cfg: EngineConfig = {}
): RelationalTraceApp {
  const psychoLen = cfg.psychoedu_cooldown_turns ?? 4;
  const breathLen = cfg.micro_breath_cooldown ?? 2;

  // decrement existing cooldowns
  const dec = (n?: number) => Math.max(0, (n ?? 0) - 1);

  const next: RelationalTraceApp = {
    ...trace,
    last_theme: out.next_relational_trace.last_theme,
    tone_shift: out.next_relational_trace.tone_shift,
    unresolved_thread: out.next_relational_trace.unresolved_thread,
    last_warmth_level: out.next_relational_trace.last_warmth_level,
    psychoeducation_last_turn: out.psychoeducational_thread.type !== "none",
    psychoedu_cooldown_remaining: dec(trace.psychoedu_cooldown_remaining),
    micro_breath_cooldown_remaining: dec(trace.micro_breath_cooldown_remaining),
  };

  // reset cooldowns when used
  if (out.psychoeducational_thread.type !== "none") {
    next.psychoedu_cooldown_remaining = psychoLen;
  }
  if (out.meta.used_micro_breath) {
    next.micro_breath_cooldown_remaining = breathLen;
  }
  return next;
}

// If you want to hard-enforce capsule cooldown app-side:
export function enforcePsychoeduCooldown(
  out: HolisticEngineOutput,
  trace: RelationalTraceApp = {}
): HolisticEngineOutput {
  const blocked = trace.psychoeducation_last_turn || (trace.psychoedu_cooldown_remaining ?? 0) > 0;

  if (!blocked) return out;
  return {
    ...out,
    psychoeducational_thread: { type: "none", content: "" },
    meta: { ...out.meta, accuracy: Math.min(out.meta.accuracy, 95) },
    next_relational_trace: {
      ...out.next_relational_trace,
      psychoeducation_last_turn: false,
    },
  };
}

// ------------------------------------
// Prompt builder
// ------------------------------------
export function buildHolisticEnginePrompt(
  instructions: string,
  input: HolisticEngineInput
): ChatCompletionMessageParam {
  // One system message with instructions + embedded JSON inputs.
  // You can also choose to split into system + user messages if preferred.
  const payload = JSON.stringify(input, null, 2);
  return {
    role: "system",
    content: `${instructions}

────────────────────────────────────
Engine Inputs (JSON):
${payload}
`,
  } as ChatCompletionMessageParam;
}
