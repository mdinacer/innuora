import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

// export const MEMORY_ANALYSIS_INSTRUCTIONS = `
// Analyze the user message for **factual memory operations**.

// Identify:
// 1. "extracted_memories" → new long-term factual entries
// 2. "memory_cues" → references to existing factual anchors

// ────────────────────────────────────────
// ## DECISION LOGIC

// **Rule 1 — Extract first-time factual mentions.**
// If a message contains a new, explicit, or clearly factual statement, include it in "extracted_memories".
// Do NOT also create a cue for the same content.

// Examples:
// - "My boss schedules meetings at 8am." → EXTRACT
// - "I'm not a morning person." → EXTRACT
// - "My sister lives in Madrid." → EXTRACT

// **Rule 2 — Cue when referring to known facts.**
// If the message revisits an existing anchor (person, place, theme, or temporal pattern), create a cue instead.
// Do not extract it again.

// Examples:
// - "Those 8am meetings are getting easier." → CUE
// - "My sister sounded happy this weekend." → CUE

// **Rule 3 — When uncertain, prefer containment.**
// If a statement is low-impact or ambiguous, treat it as a cue or ignore it.
// Extract only when information is clearly factual and enduring.

// ────────────────────────────────────────
// ## FACTUAL MEMORY EXTRACTION

// Extract only **stable, recurring, or identity-linked** facts.

// Include facts related to:
// - Work, study, or career context
// - Family or close relationships
// - Health routines or recurring conditions
// - Lasting goals or beliefs (not temporary intentions)
// - Consistent preferences or dislikes
// - Locations, homes, or transitions
// - Recurring lifestyle or behavior patterns

// Do NOT extract:
// - Emotional or mental states (“I feel anxious today”)
// - Temporary conditions (“I barely slept last night”)
// - Reflections or insights (“I realized I overwork myself”)
// - Hypotheticals or guesses (“Maybe I’ll start therapy soon”)
// - Statements with no identifiable subject, person, or theme

// Each extracted memory must be factual, concise, and phrased as a declarative sentence.

// ────────────────────────────────────────
// ## MEMORY CUES

// Create "memory_cues" when the message revisits or implies **known anchors**.
// Valid cues share at least one overlapping anchor (people, entities, themes, or temporal markers) with existing factual memory.

// Only create a cue if the reference is **contextual**, not just lexical.
// Example:
// - "I talked to my sister again today." → cue ✅
// - "My coworker has a sister too." → no cue ❌

// ────────────────────────────────────────
// ## NORMALIZATION RULES

// Normalize all anchors:
// - Lowercase
// - Accent-free
// - Words separated by underscores
// - Limit token length to 30 characters

// Anchor schema:
// - **people** → personal names or relations ("claire", "mother", "boss")
// - **entities** → jobs, organizations, or physical places ("marketing_team", "therapy_office")
// - **themes** → recurring ideas or topics ("perfectionism", "boundaries", "rest")
// - **temporal** → time or routine markers ("8_am", "after_work", "weekend")

// For family terms, normalize:
// - mom/mum/mother → "mother"
// - dad/father → "father"
// - younger brother → people:["brother"], themes:["family","younger"]

// ────────────────────────────────────────
// ## COMPACTION & DEDUPLICATION

// When multiple similar memories exist:
// - Keep the most recent or clearest version.
// - Merge entries differing only in tense or phrasing.
// - Discard trivial or obsolete ones during future compaction.

// ────────────────────────────────────────
// ## KEY PRINCIPLE

// Extract only **factual continuity**, not transient emotion.
// Cues point to already-known anchors.
// When uncertain, prefer silence over noise.

// {{ANCHORS}}
// `.trim();
export const MEMORY_ANALYSIS_INSTRUCTIONS = `
Analyze the user message for factual memory operations.

Identify:
1. "extracted_memories" → new factual entries.
2. "memory_cues" → references to existing anchors.

Rules:
1. Extract only stable, identity-linked, or recurring facts. 
   - Include work, study, family, health routines, lasting goals or beliefs, preferences, locations, or recurring behaviors.
   - Exclude emotional states, temporary conditions, reflections, hypotheticals, or sentences without identifiable subjects.
   - Each extracted memory must be concise, factual, and declarative.

2. Create cues when the message refers to known anchors (people, entities, themes, or temporal markers).
   - A cue requires contextual reference, not just word overlap.
   - Do not create both extraction and cue for the same content.
   - If a message mixes old and new information, output both.

3. When uncertain, prefer cue or skip. Extract only if clearly factual and enduring.

Normalization:
- Lowercase, accent-free, underscore-separated tokens (max 30 chars).
- Anchors: people, entities, themes, temporal.
- Examples: 
  people: "claire", "mother", "boss"
  entities: "marketing_team", "therapy_office"
  themes: "perfectionism", "boundaries", "rest"
  temporal: "8_am", "after_work", "weekend"
- Normalize family terms:
  mother/mum/mom → "mother"
  father/dad → "father"
  younger brother → people:["brother"], themes:["family","younger"]

Compaction:
- Keep the most recent or clearest version.
- Merge entries differing only in tense or phrasing.
- Drop trivial or obsolete items in compaction.

Key principle:
Extract enduring facts. Use cues for previously known anchors. When uncertain, prefer silence over noise.

{{ANCHORS}}
`.trim();

const MEMORY_ANALYSIS_MESSAGE_PARAM: ChatCompletionMessageParam = {
  role: "system",
  content: MEMORY_ANALYSIS_INSTRUCTIONS,
};

const MEMORY_ANALYSIS_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "MemoryAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        extracted_memories: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              category: {
                type: "string",
                enum: [
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
                ],
              },
              summary: { type: "string" },
              anchors: {
                type: "object",
                additionalProperties: false,
                properties: {
                  entities: {
                    type: "array",
                    items: { type: "string", pattern: "^[a-z0-9_]+$" },
                  },
                  themes: {
                    type: "array",
                    items: { type: "string", pattern: "^[a-z0-9_]+$" },
                  },
                  people: {
                    type: "array",
                    items: { type: "string", pattern: "^[a-z0-9_]+$" },
                  },
                  aliases: {
                    type: "object",
                    additionalProperties: {
                      type: "array",
                      items: { type: "string", pattern: "^[a-z0-9_]+$" },
                    },
                  },
                },
                required: ["entities"],
              },
              temporal_scope: {
                type: "string",
                enum: ["ongoing", "past", "future", "uncertain"],
              },
              emotional_valence: {
                type: "string",
                enum: ["neutral", "positive", "negative", "mixed"],
              },
            },
            required: ["category", "summary", "anchors", "temporal_scope", "emotional_valence"],
          },
        },

        memory_cues: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              entities: {
                type: "array",
                items: { type: "string", pattern: "^[a-z0-9_]+$" },
              },
              themes: {
                type: "array",
                items: { type: "string", pattern: "^[a-z0-9_]+$" },
              },
              people: {
                type: "array",
                items: { type: "string", pattern: "^[a-z0-9_]+$" },
              },
              concepts: {
                type: "array",
                items: { type: "string", pattern: "^[a-z0-9_]+$" },
              },
              temporal: {
                type: "array",
                items: { type: "string", pattern: "^[a-z0-9_]+$" },
              },
            },
          },
        },
      },
      required: ["extracted_memories", "memory_cues"],
    },
  },
};

const MEMORY_ANALYSIS_OPTIONS: RequestOptions = {
  model: "background",
  temperature: 0.1,
  top_p: 0.9,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_completion_tokens: 320,
  response_format: MEMORY_ANALYSIS_SCHEMA,
};
export const MEMORY_ANALYSIS_PROMPT = {
  instructions: MEMORY_ANALYSIS_INSTRUCTIONS,
  messageParam: MEMORY_ANALYSIS_MESSAGE_PARAM,
  options: MEMORY_ANALYSIS_OPTIONS,
};
