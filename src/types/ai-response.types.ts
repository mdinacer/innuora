/**
 * AI Response Types
 *
 * Types for AI client responses and operations
 */

import { ModelTokenUsage } from "@/domains/shared-types/token-usage.types";

export type AiMessageResponse = {
  message: string;
  modelTokenUsage: ModelTokenUsage | null;
  consumedCredits: number;
  elapsedMs: number;
};
