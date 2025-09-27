import { z } from "zod";

/**
 * Schema for AI chat completion message parameters
 */
export const ChatCompletionMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1, "Content cannot be empty").max(100000, "Content too long"),
  name: z.string().optional(),
});

/**
 * Schema for AI request options
 */
export const AiRequestOptionsSchema = z.object({
  stream: z.boolean().optional().default(false),
  max_tokens: z.number().int().min(1).max(4000).optional().default(700),
  temperature: z.number().min(0).max(2).optional().default(0.6),
  top_p: z.number().min(0).max(1).optional().default(0.9),
});

/**
 * Schema for AI model configuration
 */
export const AiModelSchema = z.object({
  code: z.string().min(1, "Model code is required"),
  path: z.string().min(1, "Model path is required"),
  provider: z.enum(["openai", "openrouter"]),
  name: z.string().min(1, "Model name is required"),
});

/**
 * Schema for SendPromptsToAi function
 */
export const SendPromptsToAiSchema = z.object({
  model: AiModelSchema,
  prompts: z.array(ChatCompletionMessageSchema).min(1, "At least one prompt is required"),
  options: AiRequestOptionsSchema.optional(),
  userId: z.string().uuid("Invalid user ID format").optional(),
});

/**
 * Schema for token usage tracking
 */
export const TokenUsageSchema = z.object({
  prompt_tokens: z.number().int().min(0),
  completion_tokens: z.number().int().min(0),
  total_tokens: z.number().int().min(0),
});

export type ChatCompletionMessageSchemaType = z.infer<typeof ChatCompletionMessageSchema>;
export type AiRequestOptionsSchemaType = z.infer<typeof AiRequestOptionsSchema>;
export type AiModelSchemaType = z.infer<typeof AiModelSchema>;
export type SendPromptsToAiSchemaType = z.infer<typeof SendPromptsToAiSchema>;
export type TokenUsageSchemaType = z.infer<typeof TokenUsageSchema>;
