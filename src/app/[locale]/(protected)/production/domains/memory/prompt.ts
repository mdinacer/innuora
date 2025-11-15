import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

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
