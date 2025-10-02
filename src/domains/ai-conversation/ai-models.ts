/**
 * AI Model Configuration
 * All configuration is now environment-based for easy production updates
 * GPT-4.1 Mini - OpenAI's most cost-effective model with 1M context window
 */

import { ChatModel } from "openai/resources";

// Model identification
export const AI_MODEL = (process.env.AI_MODEL_NAME || "gpt-4.1-mini") as ChatModel;
export const AI_MODEL_VENDOR = "openai";

// Pricing (per 1K tokens) - Update via environment variables when provider pricing changes
export const AI_MODEL_INPUT_PRICE_PER_1K = parseFloat(process.env.AI_MODEL_PRICE_INPUT_PER_1K || "0.0004") as number; // $0.40 per 1M
export const AI_MODEL_OUTPUT_PRICE_PER_1K = parseFloat(process.env.AI_MODEL_PRICE_OUTPUT_PER_1K || "0.0016") as number; // $1.60 per 1M
export const AI_MODEL_MAX_OUTPUT = parseFloat(process.env.AI_MODEL_MAX_OUTPUT || "2048") as number; // $1.60 per 1M
