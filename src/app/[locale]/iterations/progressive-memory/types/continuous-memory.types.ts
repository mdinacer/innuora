/**
 * Progressive Continuous Memory Types
 * Built gradually over sessions to enable deep understanding
 */

export interface LifeContext {
  relationships: {
    partner?: string;
    children?: string;
    family?: string;
    work?: string;
  };
  responsibilities: string[];
  constraints: string[];
}

export interface EmotionalPatterns {
  recurringFeelings: string[];
  emotionalTriggers: string[];
  emotionalCoping: string;
}

export interface RelationalPattern {
  pattern: string;
  herRole: string;
  theirRole: string;
  underlyingDynamic: string;
}

export interface RelationalPatterns {
  withPartner?: RelationalPattern;
  withMother?: string;
  withKids?: string;
  withOthers?: string;
}

export interface BehavioralPatterns {
  whatSheDoesRepeatedly: string[];
  consequencesOfPattern: string[];
  whatSheAvoidsOrFears: string[];
}

export interface CoreStruggles {
  primaryThemes: string[];
  surfaceVsDeeper: {
    surface: string;
    deeper: string;
  };
  repeatingCycle: string;
}

export interface UnderlyingBeliefs {
  aboutSelf: string[];
  aboutOthers: string[];
  aboutRelationships: string[];
  whereLearnedThis?: string;
}

export interface ProtectivePatterns {
  coreProtection: string;
  secondaryProtections: string[];
  whatTheyProtectAgainst: string;
}

export interface Progression {
  newAwareness: string[];
  shifts: string[];
  resistance: string[];
  currentFocus: string;
}

export interface RecentContext {
  lastThreeSessionTopics: string[];
  activeStruggles: string[];
  emotionalState: string;
}

/**
 * Complete Continuous Memory Structure
 * Builds progressively:
 * - Sessions 1-2: Life Context
 * - Sessions 1-3: Emotional Patterns
 * - Sessions 2-5: Relational & Behavioral Patterns
 * - Sessions 3-6: Core Struggles
 * - Sessions 5-10: Underlying Beliefs & Protective Patterns
 * - Ongoing: Progression & Recent Context
 */
export interface ContinuousMemory {
  // Layer 1: Life Context (Session 1-2)
  lifeContext: LifeContext;

  // Layer 2: Emotional Landscape (Session 1-3)
  emotionalPatterns: EmotionalPatterns;

  // Layer 3: Relational Dynamics (Session 2-5)
  relationalPatterns: RelationalPatterns;

  // Layer 4: Behavioral Patterns (Session 2-5)
  behavioralPatterns: BehavioralPatterns;

  // Layer 5: Core Struggles (Session 3-6)
  coreStruggles: CoreStruggles;

  // Layer 6: Underlying Beliefs (Session 5-10, inferred gradually)
  underlyingBeliefs: UnderlyingBeliefs;

  // Layer 7: Protective Patterns (Session 6-10)
  protectivePatterns: ProtectivePatterns;

  // Layer 8: What's Changing (Ongoing)
  progression: Progression;

  // Layer 9: Recent Sessions (Rolling window)
  recentContext: RecentContext;

  // Metadata
  sessionCount: number;
  lastUpdated: string;
  version: string;
}

/**
 * Message type for conversation
 */
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/**
 * Memory extraction output from GPT-4o-mini
 */
export interface MemoryExtraction {
  lifeContextUpdates?: Partial<LifeContext>;
  emotionalPatternsUpdates?: Partial<EmotionalPatterns>;
  relationalPatternsUpdates?: Partial<RelationalPatterns>;
  behavioralPatternsUpdates?: Partial<BehavioralPatterns>;
  coreStrugglesUpdates?: Partial<CoreStruggles>;
  underlyingBeliefsUpdates?: Partial<UnderlyingBeliefs>;
  protectivePatternsUpdates?: Partial<ProtectivePatterns>;
  progressionUpdates?: Partial<Progression>;
  recentContextUpdates?: Partial<RecentContext>;
  reasoning: string; // Why these updates were made
}

/**
 * Initialize empty memory structure
 */
export function createEmptyMemory(): ContinuousMemory {
  return {
    lifeContext: {
      relationships: {},
      responsibilities: [],
      constraints: [],
    },
    emotionalPatterns: {
      recurringFeelings: [],
      emotionalTriggers: [],
      emotionalCoping: "",
    },
    relationalPatterns: {},
    behavioralPatterns: {
      whatSheDoesRepeatedly: [],
      consequencesOfPattern: [],
      whatSheAvoidsOrFears: [],
    },
    coreStruggles: {
      primaryThemes: [],
      surfaceVsDeeper: {
        surface: "",
        deeper: "",
      },
      repeatingCycle: "",
    },
    underlyingBeliefs: {
      aboutSelf: [],
      aboutOthers: [],
      aboutRelationships: [],
    },
    protectivePatterns: {
      coreProtection: "",
      secondaryProtections: [],
      whatTheyProtectAgainst: "",
    },
    progression: {
      newAwareness: [],
      shifts: [],
      resistance: [],
      currentFocus: "",
    },
    recentContext: {
      lastThreeSessionTopics: [],
      activeStruggles: [],
      emotionalState: "",
    },
    sessionCount: 0,
    lastUpdated: new Date().toISOString(),
    version: "1.0",
  };
}
