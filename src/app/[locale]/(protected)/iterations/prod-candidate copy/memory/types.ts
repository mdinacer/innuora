export type TemporalScope = "ongoing" | "past" | "future" | "uncertain";

export type EmotionalValence = "neutral" | "positive" | "negative" | "mixed";

export type FactualMemoryCategory =
  | "person"
  | "work"
  | "family"
  | "health"
  | "education"
  | "location"
  | "event"
  | "habit"
  | "preference"
  | "belief"
  | "goal"
  | "other";

export interface MemoryCue {
  entities?: string[];
  themes?: string[];
  people?: string[];
  concepts?: string[]; // abstract or contextual recall terms
  temporal?: string[]; // time markers like "morning", "8am", "summer"
}

export interface FactualMemoryAnchors {
  entities: string[]; // always required
  themes?: string[];
  people?: string[];
  aliases?: Record<string, string[]>; // e.g. { mother: ["mom", "mum"] }
}

export interface FactualMemory {
  category: FactualMemoryCategory;
  summary: string; // concise factual description
  anchors: FactualMemoryAnchors;
  temporal_scope: TemporalScope;
  emotional_valence: EmotionalValence;
}

export interface MemoryAnalysis {
  extracted_memories: FactualMemory[]; // multiple per message
  memory_cues: MemoryCue[];
}

export interface MemoryIndex {
  entities: string[];
  people: string[];
  themes: string[];
  temporal: string[];
}
