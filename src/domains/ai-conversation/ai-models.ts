import { AiModel } from "@/types/ai-model.types";

// PAID MODELS
export const GPT_4_1_MINI_MODEL: AiModel = {
  model: "gpt-4.1-mini",
  apiPath: "openai/gpt-4.1-mini",
  context: 1_047_576,
  pricing: { prompt: 0.0004, completion: 0.0016 },
  vendor: "openai",
  mode: "paid",
};

export const GPT_3_5_TURBO_MODEL: AiModel = {
  model: "gpt-3.5-turbo",
  apiPath: "openai/gpt-3.5-turbo",
  context: 16_385,
  pricing: { prompt: 0.0005, completion: 0.0015 },
  vendor: "openai",
  mode: "paid",
};

export const GPT_4O_MODEL: AiModel = {
  model: "gpt-4o",
  apiPath: "openai/gpt-4o",
  context: 128_000,
  pricing: { prompt: 0.0025, completion: 0.01 },
  vendor: "openai",
  mode: "paid",
};

export const PAID_AI_MODELS: AiModel[] = [GPT_4_1_MINI_MODEL, GPT_3_5_TURBO_MODEL, GPT_4O_MODEL];

// FREE MODELS
export const MISTRAL_SMALL_MODEL: AiModel = {
  model: "mistral-small-3.2",
  apiPath: "mistralai/mistral-small-3.2-24b-instruct:free",
  context: 96_000,
  vendor: "mistralai",
  mode: "free",
};

export const QWEN3_14B_MODEL: AiModel = {
  model: "qwen3-14b",
  apiPath: "qwen/qwen3-14b:free",
  context: 40_960,
  vendor: "qwen",
  mode: "free",
};

export const DEEPSEEK_R1T2_MODEL: AiModel = {
  model: "deepseek-r1t2",
  apiPath: "tngtech/deepseek-r1t2-chimera:free",
  context: 163_840,
  vendor: "tngtech",
  mode: "free",
};

export const DEEPSEEK_CHAT_V3_MODEL: AiModel = {
  model: "deepseek-chat-v3-0324",
  apiPath: "deepseek/deepseek-chat-v3-0324:free",
  context: 32_768,
  vendor: "deepseek", // Needs enum update or cast
  mode: "free",
};

export const FREE_AI_MODELS: AiModel[] = [
  DEEPSEEK_CHAT_V3_MODEL,
  QWEN3_14B_MODEL,
  MISTRAL_SMALL_MODEL,
  DEEPSEEK_R1T2_MODEL,
];

// AGGREGATE EXPORT (optional)
export const ALL_AI_MODELS: AiModel[] = [...PAID_AI_MODELS, ...FREE_AI_MODELS];

export const MODELS_CODES = {
  M1: "M1", // GPT-4.1 Mini
  M2: "M2", // GPT-3.5 Turbo
  M3: "M3", // GPT-4O
} as const;

export type ModelCode = keyof typeof MODELS_CODES;

export const MODELS_CODES_MAP = {
  M1: GPT_4_1_MINI_MODEL,
  M2: GPT_4O_MODEL,
  M3: GPT_3_5_TURBO_MODEL,
};
