import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// ENUM CONSTANTS (single source of truth)
// ─────────────────────────────────────────────────────────────

export const TEMPORAL_SCOPES = ["ongoing", "past", "future", "uncertain"] as const;

export const EMOTIONAL_VALENCES = ["neutral", "positive", "negative", "mixed"] as const;

export const FACTUAL_MEMORY_CATEGORIES = [
  "person",
  "work",
  "family",
  "health",
  "education",
  "location",
  "event",
  "habit",
  "preference",
  "belief",
  "goal",
  "other",
] as const;

// ─────────────────────────────────────────────────────────────
// Type Aliases
// ─────────────────────────────────────────────────────────────

export type TemporalScope = (typeof TEMPORAL_SCOPES)[number];
export type EmotionalValence = (typeof EMOTIONAL_VALENCES)[number];
export type FactualMemoryCategory = (typeof FACTUAL_MEMORY_CATEGORIES)[number];

// ─────────────────────────────────────────────────────────────
// ZOD ENUM SCHEMAS
// ─────────────────────────────────────────────────────────────

export const TemporalScopeSchema = z.enum(TEMPORAL_SCOPES);
export const EmotionalValenceSchema = z.enum(EMOTIONAL_VALENCES);
export const FactualMemoryCategorySchema = z.enum(FACTUAL_MEMORY_CATEGORIES);

// ─────────────────────────────────────────────────────────────
// MemoryCue
// ─────────────────────────────────────────────────────────────

export const MemoryCueSchema = z.object({
  entities: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  people: z.array(z.string()).optional(),
  concepts: z.array(z.string()).optional(),
  temporal: z.array(z.string()).optional(),
});

export type MemoryCue = z.infer<typeof MemoryCueSchema>;

// ─────────────────────────────────────────────────────────────
// FactualMemoryAnchors
// ─────────────────────────────────────────────────────────────

export const FactualMemoryAnchorsSchema = z.object({
  entities: z.array(z.string()), // required
  themes: z.array(z.string()).optional(),
  people: z.array(z.string()).optional(),
  aliases: z.record(z.string(), z.array(z.string())).optional(),
});

export type FactualMemoryAnchors = z.infer<typeof FactualMemoryAnchorsSchema>;

// ─────────────────────────────────────────────────────────────
// FactualMemory
// ─────────────────────────────────────────────────────────────

export const FactualMemorySchema = z.object({
  category: FactualMemoryCategorySchema,
  summary: z.string(),
  anchors: FactualMemoryAnchorsSchema,
  temporal_scope: TemporalScopeSchema,
  emotional_valence: EmotionalValenceSchema,
});

export type FactualMemory = z.infer<typeof FactualMemorySchema>;

// ─────────────────────────────────────────────────────────────
// MemoryAnalysis (per message)
// ─────────────────────────────────────────────────────────────

export const MemoryAnalysisSchema = z
  .object({
    extracted_memories: z.array(FactualMemorySchema),
    memory_cues: z.array(MemoryCueSchema),
  })
  .strict();

export type MemoryAnalysis = z.infer<typeof MemoryAnalysisSchema>;

// ─────────────────────────────────────────────────────────────
// MemoryIndex (derived index)
// ─────────────────────────────────────────────────────────────

export const MemoryIndexSchema = z.object({
  entities: z.array(z.string()),
  people: z.array(z.string()),
  themes: z.array(z.string()),
  temporal: z.array(z.string()),
});

export type MemoryIndex = z.infer<typeof MemoryIndexSchema>;
