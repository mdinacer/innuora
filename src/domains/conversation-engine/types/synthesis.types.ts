/**
 * Context Synthesis Types
 * Hash-based caching for session focus directives
 */

export interface ContextLifecycle {
  directive: string | null;
  hash: string | null;
  generatedAt: number | null;
  usageCount: number;
}

export const initialContextLifecycle: ContextLifecycle = {
  directive: null,
  hash: null,
  generatedAt: null,
  usageCount: 0,
};
