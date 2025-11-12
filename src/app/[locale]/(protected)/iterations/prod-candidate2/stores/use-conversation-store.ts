import { create } from "zustand";

import { OpenChatMessage } from "@/types/open-chat-message.types";
import { DEFAULT_REFLECTION_DIRECTIVE, ReflectionDirective } from "../directive/types";
import { FactualMemory } from "../memory/types";
import { RelationalTraceApp, SAFE_FALLBACK_TRACE } from "../reflection/types";
import { SessionWellness } from "../wellness/types";

// const MOCK_DIRECTIVES: ReflectionDirective[] = [
//   {
//     intent: "contain",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "low",
//     crisis: "none",
//     cognitive_patterns: ["rumination"],
//     emotional_themes: ["pressure"],
//     distortions_detected: [],
//     implicit_needs: ["relief", "stability"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         entities: ["aurora labs"],
//         themes: ["project", "pressure"],
//         people: [],
//       },
//     ],
//     rationale:
//       "User refers back to a previously mentioned project and ongoing pressure; maintain steady, calming containment without introducing new exploration or psychoeducation to support stability.",
//   },
//   {
//     intent: "anchor",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["adaptation"],
//     emotional_themes: ["relief"],
//     distortions_detected: [],
//     implicit_needs: ["stability", "control"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["meeting", "schedule"],
//         people: ["boss"],
//       },
//     ],
//     rationale:
//       "User refers to previously mentioned recurring meetings with boss and notes improvement in handling them, indicating adaptation and relief. Maintain steady, calm stance to anchor progress and support stability.",
//   },
//   {
//     intent: "contain",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "low",
//     crisis: "none",
//     cognitive_patterns: [],
//     emotional_themes: ["adjustment", "family"],
//     distortions_detected: [],
//     implicit_needs: ["stability", "support"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["adjustment"],
//         people: ["brother"],
//         entities: ["berlin"],
//       },
//     ],
//     rationale:
//       "User references previous discussion about brother's adjustment in Berlin; maintain steady, calm containment to support stability and avoid premature exploration.",
//   },
//   {
//     intent: "validate",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["reflection", "acceptance"],
//     emotional_themes: ["rest", "truth"],
//     distortions_detected: [],
//     implicit_needs: ["validation", "stability"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["rest"],
//         people: ["mom"],
//       },
//     ],
//     rationale:
//       "User reflects on a previously mentioned concept (mom's words about rest) with increased acceptance; maintain steady, calm validation to support stability and reinforce positive reflection without introducing new topics or psychoeducation.",
//   },
//   {
//     intent: "validate",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "low",
//     crisis: "none",
//     cognitive_patterns: ["acknowledgment"],
//     emotional_themes: ["relief", "renewal"],
//     distortions_detected: [],
//     implicit_needs: ["support", "stability"],
//     update_memory: true,
//     recall_memory: false,
//     memory_cues: [],
//     rationale:
//       "User reports a significant event of returning to therapy with positive emotional impact, indicating relief and renewal. Maintain steady, calm validation to reinforce stability and support without introducing exploration or psychoeducation yet.",
//   },
//   {
//     intent: "validate",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["recognition of calming effect"],
//     emotional_themes: ["calmness", "relief"],
//     distortions_detected: [],
//     implicit_needs: ["stability", "calm"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["calmness"],
//         entities: ["run"],
//       },
//     ],
//     rationale:
//       "User references a previous mention of running and its calming effect, indicating a need for stability and calm. Maintain a steady, validating, and calm stance to support this.",
//   },
//   {
//     intent: "contain",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["rumination"],
//     emotional_themes: ["confinement", "discomfort"],
//     distortions_detected: [],
//     implicit_needs: ["space", "comfort"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["living space", "time"],
//       },
//     ],
//     rationale:
//       "User references prior statement about spending too much time inside and feeling cramped in the apartment, indicating recall of previous context. Maintain steady, calm containment to support stability and avoid exploration until stability is verified.",
//   },
//   {
//     intent: "anchor",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: [],
//     emotional_themes: ["quiet", "slowing"],
//     distortions_detected: [],
//     implicit_needs: ["stability", "containment"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["winter", "slowing"],
//         entities: ["paris"],
//       },
//     ],
//     rationale:
//       "User references previous mention of winter and city slowing down, indicating recall of past context. Maintain steady, calm, and anchoring stance to support stability and containment as per prior relational trace.",
//   },
//   {
//     intent: "contain",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["automatic thoughts"],
//     emotional_themes: ["persistence", "challenge"],
//     distortions_detected: [],
//     implicit_needs: ["stability", "acceptance"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["mindset", "work"],
//       },
//     ],
//     rationale:
//       "User references previously discussed 'old college mindset' affecting work, indicating recall of prior context. Maintain steady, calm, and containing stance to support stability and acceptance without introducing exploration or psychoeducation yet.",
//   },
//   {
//     intent: "validate",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["self-criticism", "comparison"],
//     emotional_themes: ["patience", "self-expectation"],
//     distortions_detected: [],
//     implicit_needs: ["self-compassion", "acceptance"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["tutoring", "patience"],
//         entities: [],
//         people: [],
//       },
//     ],
//     rationale:
//       "User reflects on a recurring pattern related to patience and self-treatment, referencing past tutoring experience. The response should validate this insight with a calm, steady tone to maintain stability and containment without introducing exploration or psychoeducation at this time.",
//   },
//   {
//     intent: "anchor",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: false,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["grounding"],
//     emotional_themes: ["stability"],
//     distortions_detected: [],
//     implicit_needs: ["containment", "stability"],
//     update_memory: false,
//     recall_memory: true,
//     memory_cues: [
//       {
//         themes: ["grounding", "stability"],
//         entities: ["tea", "journaling"],
//       },
//     ],
//     rationale:
//       "User references a previous experience of journaling with tea as grounding after a chaotic week. Maintain steady, calm, and anchoring stance to reinforce stability and containment without introducing exploration or psychoeducation at this time.",
//   },
//   {
//     intent: "validate",
//     stance: "steady",
//     tone: "calm",
//     allow_psychoeducation: false,
//     allow_curiosity: true,
//     risk_level: "none",
//     crisis: "none",
//     cognitive_patterns: ["self reflection", "personal growth"],
//     emotional_themes: ["change", "growth"],
//     distortions_detected: [],
//     implicit_needs: ["recognition", "stability"],
//     update_memory: true,
//     recall_memory: false,
//     memory_cues: [],
//     rationale:
//       "User reflects on personal growth after a major life change; maintain steady and calm stance to validate and gently encourage further exploration without pushing, as stability is key now.",
//   },
// ];
// const MOCK_FACTUAL_MEMORY: MemoryAnalysis[] = [
//   {
//     extracted_memories: [
//       {
//         category: "work",
//         summary: "I work as a ux designer at aurora labs.",
//         anchors: {
//           entities: ["aurora_labs", "ux_designer"],
//           themes: ["work"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "family",
//         summary: "The user's sister lives in Madrid.",
//         anchors: {
//           people: ["sister"],
//           entities: ["madrid"],
//           themes: ["family", "location"],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//       {
//         category: "family",
//         summary: "The user talks with their sister almost every weekend.",
//         anchors: {
//           people: ["sister"],
//           themes: ["family", "communication", "habit"],
//           entities: [],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "health",
//         summary: "The user has been attending therapy sessions every thursday evening for about a year.",
//         anchors: {
//           entities: ["therapy"],
//           themes: ["health", "habit"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "location",
//         summary: "User lives in a small apartment near the city center",
//         anchors: {
//           entities: ["apartment", "city_center"],
//           themes: ["housing", "location"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "goal",
//         summary: "User aims to eat healthier by cooking more and ordering less takeout.",
//         anchors: {
//           entities: ["cooking", "takeout"],
//           themes: ["health", "nutrition"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "future",
//         emotional_valence: "positive",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "habit",
//         summary: "My boss tends to schedule meetings early in the morning around 8 am.",
//         anchors: {
//           people: ["boss"],
//           entities: ["meeting"],
//           themes: ["work", "schedule"],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [
//       {
//         people: ["boss"],
//         entities: ["meeting"],
//         themes: ["work", "schedule"],
//         concepts: ["early_meeting"],
//         temporal: ["8_am"],
//       },
//     ],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "preference",
//         summary: "The user loves quiet cafés, especially in rainy weather.",
//         anchors: {
//           entities: ["cafe"],
//           themes: ["preference", "weather"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "positive",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "health",
//         summary: "User stopped drinking coffee due to its negative effect on anxiety.",
//         anchors: {
//           entities: ["coffee", "anxiety"],
//           themes: ["health", "habit"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "past",
//         emotional_valence: "negative",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "education",
//         summary: "The user studied computer engineering at the University of Lyon.",
//         anchors: {
//           entities: ["computer_engineering", "university_of_lyon"],
//           themes: ["education", "study"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "past",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "family",
//         summary: "User has parents who live about two hours away.",
//         anchors: {
//           people: ["parents"],
//           entities: ["parent"],
//           themes: ["family"],
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "neutral",
//       },
//       {
//         category: "goal",
//         summary: "User plans to visit their parents in June.",
//         anchors: {
//           entities: ["visit", "parent"],
//           themes: ["family", "travel"],
//         },
//         temporal_scope: "future",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "work",
//         summary: "The user has recurring 8am meetings with their boss.",
//         anchors: {
//           entities: ["meeting", "boss"],
//           themes: ["work", "routine"],
//           people: ["boss"],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "positive",
//       },
//     ],
//     memory_cues: [
//       {
//         entities: ["boss"],
//         themes: ["work", "routine"],
//         people: ["boss"],
//         concepts: ["meeting"],
//         temporal: ["8_am"],
//       },
//     ],
//   },
//   {
//     extracted_memories: [],
//     memory_cues: [
//       {
//         people: ["sister"],
//         entities: ["madrid"],
//         themes: ["family", "location"],
//         concepts: [],
//         temporal: ["weekend"],
//       },
//     ],
//   },
//   {
//     extracted_memories: [],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "location",
//         summary: "The user moved to a city center.",
//         anchors: {
//           entities: ["city_center"],
//           themes: ["location", "move"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "past",
//         emotional_valence: "neutral",
//       },
//     ],
//     memory_cues: [],
//   },
//   {
//     extracted_memories: [
//       {
//         category: "habit",
//         summary: "Cooking at home is a grounding activity.",
//         anchors: {
//           entities: ["cooking", "home"],
//           themes: ["habit", "wellbeing"],
//           people: [],
//           aliases: {},
//         },
//         temporal_scope: "ongoing",
//         emotional_valence: "positive",
//       },
//     ],
//     memory_cues: [],
//   },
// ];

export type CrisisLevel = "none" | "low" | "moderate" | "high" | "immediate";
export type CrisisState = "none" | "detected" | "confirmed";

interface ConversationStoreState {
  directives: ReflectionDirective[];
  lastDirective: ReflectionDirective;
  messages: OpenChatMessage[];
  relationalTrace: RelationalTraceApp;
  factualMemory: FactualMemory[];
  lastWellnessCheck: SessionWellness | null;
  wellnessChecks: SessionWellness[];

  addFacts: (facts: FactualMemory[]) => void;
  addWellnessCheck: (check: SessionWellness) => void;
  clearFactualMemory: () => void;
  setFactualMemory: (memory: FactualMemory[] | ((state: FactualMemory[]) => FactualMemory[])) => void;

  addDirective: (directive: ReflectionDirective) => void;
  addMessage: (message: OpenChatMessage) => void;
  setRelationalTrace: (trace: RelationalTraceApp) => void;

  reset: () => void;
}

const initialState: Pick<
  ConversationStoreState,
  | "messages"
  | "relationalTrace"
  | "directives"
  | "lastDirective"
  | "factualMemory"
  | "lastWellnessCheck"
  | "wellnessChecks"
> = {
  messages: [],
  relationalTrace: SAFE_FALLBACK_TRACE,
  directives: [],
  lastDirective: DEFAULT_REFLECTION_DIRECTIVE,
  factualMemory: [], //MOCK_FACTUAL_MEMORY.flatMap(({ extracted_memories }) => extracted_memories), // [],
  lastWellnessCheck: {
    phase: "closure",
    closure_state: "ready_to_end",
    rationale: "User expresses gratitude and readiness to pause, indicating session completion.",
    tone_recommendation: "closure",
  },
  wellnessChecks: [],
};

export const useConversationStore = create<ConversationStoreState>((set) => ({
  ...initialState,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  addDirective: (directive) =>
    set((state) => ({
      directives: [...state.directives, directive],
      lastDirective: directive,
    })),
  setRelationalTrace: (trace) => set({ relationalTrace: trace }),
  reset: () => set(initialState),

  addFacts: (facts) => set((state) => ({ factualMemory: [...state.factualMemory, ...facts] })),
  clearFactualMemory: () => set({ factualMemory: [] }),
  setFactualMemory: (memory) => {
    if (typeof memory === "function") {
      set((state) => ({ factualMemory: memory(state.factualMemory) }));
    } else {
      set({ factualMemory: memory });
    }
  },

  addWellnessCheck: (check) =>
    set((state) => ({ wellnessChecks: [...state.wellnessChecks, check], lastWellnessCheck: check })),
}));
