# Session Diagnostics Flow Documentation

## Overview

Innuora's Session Diagnostics system provides sophisticated psychological assessment and therapeutic insights by analyzing completed chat sessions. It generates comprehensive diagnostic profiles including core beliefs, cognitive distortions, behavioral patterns, and therapeutic opportunities - all backed by AI-powered clinical formulation techniques.

## Architecture Overview

### Core Components

```
src/domains/session-diagnostics/
├── session-diagnostics.types.ts      # Type definitions
├── session-diagnostics.service.ts    # Core service logic
├── session-diagnostics.prompts.ts    # AI prompts for analysis
├── session-diagnostics.core.ts       # Data parsing and validation
└── index.ts                          # Domain exports
```

### Server Actions

```
src/app/actions/session-diagnostics-actions.ts
└── generateSessionDiagnosticsAction   # Main diagnostic generation
```

## Diagnostic Data Model

### Session Diagnostics Structure

```typescript
export interface SessionDiagnostics {
  // Core psychological structures
  core_beliefs: Array<{
    belief: string;
    confidence: ConfidenceLevel;
  }>;

  // Unconscious rules and paradoxes
  silent_rules_and_double_binds: Array<{
    rule: string;
    confidence: ConfidenceLevel;
  }>;

  // Cognitive distortion patterns
  dominant_distortions: Array<{
    distortion: string;
    confidence: ConfidenceLevel;
    examples: string[];
  }>;

  // Behavioral loops and triggers
  emotional_behavioral_patterns: Array<{
    trigger: string;
    emotions: string[];
    behaviors: string[];
    loop: string; // Description of the feedback loop
    confidence: ConfidenceLevel;
  }>;

  // Intervention opportunities
  hidden_leverage_points: Array<{
    insight: string;
    confidence: ConfidenceLevel;
  }>;

  // Therapeutic recommendations
  therapeutic_opportunities: string[];
}

export type ConfidenceLevel = "high" | "medium" | "low";
```

### Metadata Structure

```typescript
export interface SessionDiagnosticsMetadata {
  generatedAt: Date; // When diagnostics were generated
  tokensUsed: number; // Total AI tokens consumed
  modelUsed: string; // AI model used for generation
  sessionMessageCount: number; // Number of messages analyzed
  version: string; // Prompt version for reproducibility
}

export interface SessionDiagnosticsWithMetadata {
  diagnostics: SessionDiagnostics;
  metadata: SessionDiagnosticsMetadata;
}
```

## Diagnostic Generation Process

### 1. Data Preparation Phase

```typescript
// src/app/actions/session-diagnostics-actions.ts
export async function generateSessionDiagnosticsAction(
  session: Session,
  modelCode: ModelCode = "M1",
  userId?: string
): Promise<SessionDiagnosticsWithMetadata> {
  // 1. Prepare session analysis data
  let sessionAnalysisText: string;
  if (session.aggregatedAnalysis) {
    // Use existing comprehensive analysis
    sessionAnalysisText = JSON.stringify(session.aggregatedAnalysis);
  } else {
    // Generate from individual analysis snapshots
    if (session.analysisSnapshots.length === 0) {
      throw new Error("No analysis data available - session needs therapeutic analysis");
    }
    const aggregatedAnalysis = combineToSessionAnalysis(session.analysisSnapshots);
    sessionAnalysisText = JSON.stringify(aggregatedAnalysis);
  }

  // 2. Generate session summary from chat messages
  const chatMessages = session.messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");

  // 3. Prepare session memory context
  const sessionMemory = session.memoryStore || "No memory available for this session.";

  return { diagnostics, metadata };
}
```

### 2. Session Summary Generation

#### Summary Generation Prompt

```typescript
export const SESSION_SUMMARY_PROMPT = `
# Session Summary Instructions

**Role**: Neutral summarizer. Your task is to condense the chat into a clear, factual narrative.

## Rules
1. Focus on **what was discussed**, not why or how.
2. Capture:
   - Main topics and themes.
   - Key events, facts, or decisions mentioned.
   - Emotional tone shifts (only if explicitly stated by the user).
3. Do **not** analyze, interpret, or provide insights.
4. Keep it concise (5–7 sentences max).
5. Write in third person, past tense.

## Input
Chat Messages:
{{chat_messages}}

## Output
A single plain-text paragraph summary.
`;
```

#### Summary Generation Process

```typescript
// Generate factual session summary
const summaryPrompt = SESSION_SUMMARY_PROMPT.replace("{{chat_messages}}", chatMessages);
const summaryPrompts = [{ role: "user" as const, content: summaryPrompt }];

const summaryResponse = await SendPromptsToAi(summaryPrompts, model, {}, userId);
const sessionSummary = summaryResponse.message.trim();
```

**Example Summary Output**:

> "The user discussed feeling overwhelmed at work and struggling with perfectionist tendencies. They mentioned a recent conflict with their manager and expressed anxiety about upcoming deadlines. The conversation explored their relationship with their parents and how childhood experiences might relate to current stress patterns. The user expressed interest in learning coping strategies for managing anxiety."

### 3. Advanced Diagnostic Generation

#### Diagnostic Generation Prompt

```typescript
export const SESSION_DIAGNOSTICS_PROMPT = `
# Advanced Diagnostic Generation

**Role**: You are an expert clinical case formulation system. Your task is to generate a sophisticated diagnostic profile of the user based on their session data. Output must be structured JSON.

## Input
- Session Summary: {{session_summary}}
- Session Memory: {{session_memory}}
- Session Analysis: {{session_analysis}}

## Rules
1. **Ground strictly in data**: Do not invent facts. Base conclusions only on the provided inputs.
2. **Infer patterns, not events**: Your role is to synthesize beliefs, rules, distortions, and loops - not to restate raw data.
3. **Confidence levels**: Add "confidence": "high" | "medium" | "low" for all key findings.
4. **Loops and double binds**: Explicitly detect feedback loops (thought → emotion → behavior → outcome → thought) and paradoxical rules (double binds).
5. **Hidden leverage points**: Identify subtle intervention points that could unlock progress. Keep them concrete and actionable.
6. **Therapeutic opportunities**: Suggest 2–4 potential openings for change (in behavioral, cognitive, or relational domains). Use plain, concise language.
7. **Clarity and professionalism**: Output should impress a therapist as sophisticated, but still be clear enough that an intelligent user could follow.
`;
```

#### Diagnostic Generation Process

```typescript
// Generate comprehensive diagnostics
const diagnosticsPrompt = SESSION_DIAGNOSTICS_PROMPT.replace("{{session_summary}}", sessionSummary)
  .replace("{{session_memory}}", sessionMemory)
  .replace("{{session_analysis}}", sessionAnalysisText);

const diagnosticsPrompts = [{ role: "user" as const, content: diagnosticsPrompt }];
const diagnosticsResponse = await SendPromptsToAi(diagnosticsPrompts, model, {}, userId);

// Parse and validate structured diagnostic output
const diagnostics = parseSessionDiagnostics(diagnosticsResponse.message);
```

### 4. Data Parsing & Validation

#### JSON Response Parsing

````typescript
// src/domains/session-diagnostics/session-diagnostics.core.ts
export function parseSessionDiagnostics(response: string): SessionDiagnostics {
  try {
    // Extract JSON from AI response (may contain markdown formatting)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
      response.match(/```\s*([\s\S]*?)\s*```/) || [null, response];

    const jsonString = jsonMatch[1] || response;
    const parsed = JSON.parse(jsonString.trim());

    // Validate required fields
    const required = [
      "core_beliefs",
      "silent_rules_and_double_binds",
      "dominant_distortions",
      "emotional_behavioral_patterns",
      "hidden_leverage_points",
      "therapeutic_opportunities",
    ];

    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate confidence levels
    const validConfidenceLevels = ["high", "medium", "low"];
    const validateConfidence = (items: any[]) => {
      items.forEach((item) => {
        if (item.confidence && !validConfidenceLevels.includes(item.confidence)) {
          throw new Error(`Invalid confidence level: ${item.confidence}`);
        }
      });
    };

    validateConfidence(parsed.core_beliefs);
    validateConfidence(parsed.silent_rules_and_double_binds);
    validateConfidence(parsed.dominant_distortions);
    validateConfidence(parsed.emotional_behavioral_patterns);
    validateConfidence(parsed.hidden_leverage_points);

    return parsed as SessionDiagnostics;
  } catch (error) {
    throw new Error(`Failed to parse session diagnostics: ${error.message}`);
  }
}
````

## Diagnostic Categories Deep Dive

### 1. Core Beliefs Analysis

**Purpose**: Identify fundamental beliefs about self, others, and the world that drive behavior

**Example Output**:

```json
{
  "core_beliefs": [
    {
      "belief": "I must be perfect to be worthy of love and acceptance",
      "confidence": "high"
    },
    {
      "belief": "Other people's needs are more important than my own",
      "confidence": "medium"
    },
    {
      "belief": "If I show weakness, people will abandon me",
      "confidence": "medium"
    }
  ]
}
```

**Therapeutic Value**:

- Identifies schema-level interventions
- Guides core beliefs restructuring work
- Informs self-compassion interventions

### 2. Silent Rules & Double Binds

**Purpose**: Uncover unconscious rules and paradoxical beliefs that create psychological traps

**Example Output**:

```json
{
  "silent_rules_and_double_binds": [
    {
      "rule": "I must always be strong, but I also need support (creates isolation when struggling)",
      "confidence": "high"
    },
    {
      "rule": "I should trust my instincts, but I can't trust my own judgment",
      "confidence": "medium"
    },
    {
      "rule": "I need to be independent, but I fear being alone",
      "confidence": "medium"
    }
  ]
}
```

**Therapeutic Value**:

- Identifies contradictory belief systems
- Guides resolution of internal conflicts
- Highlights areas for values clarification

### 3. Dominant Distortions

**Purpose**: Catalog prevalent cognitive distortions with specific examples

**Example Output**:

```json
{
  "dominant_distortions": [
    {
      "distortion": "All-or-nothing thinking",
      "confidence": "high",
      "examples": [
        "Either I'm completely successful or I'm a total failure",
        "If I make one mistake, the entire project is ruined"
      ]
    },
    {
      "distortion": "Mind reading",
      "confidence": "medium",
      "examples": ["My manager thinks I'm incompetent (without evidence)", "Everyone can see that I'm struggling"]
    }
  ]
}
```

**Therapeutic Value**:

- Targets specific cognitive restructuring
- Provides concrete examples for CBT work
- Tracks distortion patterns over time

### 4. Emotional-Behavioral Patterns

**Purpose**: Map trigger → emotion → behavior → outcome loops

**Example Output**:

```json
{
  "emotional_behavioral_patterns": [
    {
      "trigger": "Receiving feedback or criticism",
      "emotions": ["shame", "anxiety", "inadequacy"],
      "behaviors": ["withdrawal", "rumination", "self-criticism"],
      "loop": "Criticism triggers shame → withdrawal → missed opportunities for growth → reinforces belief of inadequacy → increased sensitivity to criticism",
      "confidence": "high"
    }
  ]
}
```

**Therapeutic Value**:

- Identifies behavioral intervention points
- Maps emotional regulation targets
- Guides behavioral activation strategies

### 5. Hidden Leverage Points

**Purpose**: Identify subtle but powerful intervention opportunities

**Example Output**:

```json
{
  "hidden_leverage_points": [
    {
      "insight": "User's desire to help others could be redirected toward self-compassion",
      "confidence": "high"
    },
    {
      "insight": "Strong analytical skills could be applied to thought challenging",
      "confidence": "medium"
    },
    {
      "insight": "Past success in sports shows capacity for gradual skill building",
      "confidence": "medium"
    }
  ]
}
```

**Therapeutic Value**:

- Identifies existing strengths to leverage
- Suggests novel intervention approaches
- Highlights readiness for specific interventions

### 6. Therapeutic Opportunities

**Purpose**: Concrete next steps and intervention recommendations

**Example Output**:

```json
{
  "therapeutic_opportunities": [
    "Practice self-compassion exercises to counter perfectionist self-criticism",
    "Develop assertiveness skills to balance others' needs with personal needs",
    "Implement graded exposure to reduce avoidance of challenging situations",
    "Explore family-of-origin patterns that reinforce current relationship dynamics"
  ]
}
```

**Therapeutic Value**:

- Provides actionable treatment planning
- Suggests evidence-based interventions
- Guides session focus and homework assignments

## Integration with Session Analysis

### Analysis Aggregation Process

```typescript
// src/domains/session-diagnostics/session-diagnostics.service.ts
export function combineSessionAnalyses(analyses: Array<TherapeuticAnalysis>): string {
  if (analyses.length === 0) {
    return "No therapeutic analyses available for this session.";
  }

  // Aggregate patterns across all analyses
  const aggregatedDistortions = analyses.flatMap((a) => a.distortions);
  const aggregatedThemes = analyses.flatMap((a) => a.themes);
  const aggregatedBeliefs = analyses.flatMap((a) => a.core_beliefs);
  const aggregatedRules = analyses.flatMap((a) => a.silent_rules);
  const aggregatedPatterns = analyses.flatMap((a) => a.behavioral_patterns);

  // Get intensity and crisis patterns
  const intensities = analyses.map((a) => a.intensity);
  const crisisLevels = analyses.map((a) => a.crisis);
  const readinessLevels = analyses.map((a) => a.therapeutic_readiness);

  return `
Session Analysis Summary:
- Total analyses: ${analyses.length}
- Emotional intensity patterns: ${intensities.join(", ")}
- Crisis levels observed: ${crisisLevels.join(", ")}
- Therapeutic readiness: ${readinessLevels.join(", ")}

Distortions identified: ${aggregatedDistortions.map((d) => `${d.type} (${d.severity})`).join(", ")}
Recurring themes: ${aggregatedThemes.map((t) => `${t.theme} (${t.frequency})`).join(", ")}
Core beliefs emerged: ${aggregatedBeliefs.map((b) => b.belief).join("; ")}
Silent rules detected: ${aggregatedRules.map((r) => `${r.rule} (${r.rigidity})`).join("; ")}
Behavioral patterns: ${aggregatedPatterns.map((p) => `${p.type} (${p.severity})`).join(", ")}
  `.trim();
}
```

## Data Security & Privacy

### Encryption Requirements

```typescript
// Session diagnostics are highly sensitive and require encryption
export interface EncryptedSessionDiagnostics {
  encryptedDiagnostics: string; // Encrypted diagnostic data
  metadata: SessionDiagnosticsMetadata; // Public metadata (unencrypted)
  encryptionVersion: string; // Encryption scheme version
}

// Encryption process
const encryptDiagnostics = async (diagnostics: SessionDiagnostics, userEncryptionKey: CryptoKey): Promise<string> => {
  const diagnosticsJson = JSON.stringify(diagnostics);
  return await encryptData(diagnosticsJson, userEncryptionKey);
};
```

### Data Retention Policy

```typescript
// Diagnostic data retention management
export const DIAGNOSTICS_RETENTION_POLICY = {
  // Encrypted diagnostics stored indefinitely (user-controlled)
  encryptedData: "indefinite",

  // Metadata retained for analytics (anonymized)
  metadata: "2_years",

  // Generation logs for debugging
  generationLogs: "30_days",

  // User deletion request processing
  userDeletion: "immediate",
};
```

## Performance Considerations

### Token Usage Optimization

```typescript
// Optimized prompting to reduce AI costs
export const DIAGNOSTIC_OPTIMIZATION = {
  // Use smaller model for summary generation
  summaryModel: "M1", // GPT-4.1 Mini for cost efficiency

  // Use premium model for complex diagnostics
  diagnosticsModel: "M2", // GPT-4O for clinical sophistication

  // Prompt length optimization
  maxSessionSummaryLength: 1000, // chars
  maxAnalysisContextLength: 2000, // chars

  // Caching strategy
  cacheSessionSummaries: true,
  cacheSessionAnalyses: true,
};
```

### Generation Caching

```typescript
// Cache expensive operations
const getDiagnosticsFromCache = async (sessionId: string): Promise<SessionDiagnosticsWithMetadata | null> => {
  const cacheKey = `diagnostics:${sessionId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
};

const cacheDiagnostics = async (sessionId: string, diagnostics: SessionDiagnosticsWithMetadata): Promise<void> => {
  const cacheKey = `diagnostics:${sessionId}`;
  const ttl = 24 * 60 * 60; // 24 hours

  await redis.setex(cacheKey, ttl, JSON.stringify(diagnostics));
};
```

## Error Handling & Fallbacks

### Graceful Degradation

```typescript
// Robust error handling for diagnostic generation
export const generateDiagnosticsWithFallback = async (
  session: Session,
  modelCode: ModelCode = "M1"
): Promise<SessionDiagnosticsWithMetadata | null> => {
  try {
    // Primary generation attempt
    return await generateSessionDiagnosticsAction(session, modelCode);
  } catch (error) {
    logger.logWarning("Primary diagnostics generation failed", {
      operation: "session_diagnostics_primary_failed",
      sessionId: session.id,
      error: error.message,
    });

    try {
      // Fallback to simpler model
      return await generateSessionDiagnosticsAction(session, "M3");
    } catch (fallbackError) {
      logger.logError("Diagnostics generation completely failed", {
        operation: "session_diagnostics_complete_failure",
        sessionId: session.id,
        primaryError: error.message,
        fallbackError: fallbackError.message,
      });

      // Return minimal diagnostic structure
      return generateMinimalDiagnostics(session);
    }
  }
};

const generateMinimalDiagnostics = (session: Session): SessionDiagnosticsWithMetadata => {
  return {
    diagnostics: {
      core_beliefs: [{ belief: "Analysis unavailable", confidence: "low" }],
      silent_rules_and_double_binds: [],
      dominant_distortions: [],
      emotional_behavioral_patterns: [],
      hidden_leverage_points: [],
      therapeutic_opportunities: ["Complete a full session for detailed insights"],
    },
    metadata: {
      generatedAt: new Date(),
      tokensUsed: 0,
      modelUsed: "fallback",
      sessionMessageCount: session.messages.length,
      version: "minimal",
    },
  };
};
```

## Usage Patterns & Best Practices

### When to Generate Diagnostics

```typescript
// Optimal timing for diagnostic generation
export const DIAGNOSTIC_GENERATION_CRITERIA = {
  // Minimum session requirements
  minMessageCount: 10, // At least 10 messages for meaningful analysis
  minAnalysisSnapshots: 3, // At least 3 therapeutic analyses
  minSessionDuration: 15 * 60 * 1000, // 15 minutes minimum

  // Quality indicators
  hasUserPersonalSharing: true, // User shared personal information
  hasEmotionalContent: true, // Emotional themes detected
  hasTherapeuticInteraction: true, // Meaningful therapeutic exchange

  // Timing optimization
  preferredGenerationTime: "session_end", // Generate at session conclusion
  backgroundGeneration: true, // Generate asynchronously
  userTriggeredGeneration: false, // Don't wait for user request
};
```

### Diagnostic Presentation

```typescript
// User-friendly diagnostic presentation
export const formatDiagnosticsForUser = (diagnostics: SessionDiagnostics): DiagnosticSummary => {
  return {
    insights: {
      title: "Key Insights from Your Session",
      corePatterns: diagnostics.core_beliefs.filter((b) => b.confidence === "high").map((b) => b.belief),

      behavioralLoops: diagnostics.emotional_behavioral_patterns
        .filter((p) => p.confidence === "high")
        .map((p) => ({
          trigger: p.trigger,
          pattern: p.loop,
          breakingPoint: getBreakingPointSuggestion(p),
        })),
    },

    opportunities: {
      title: "Opportunities for Growth",
      leveragePoints: diagnostics.hidden_leverage_points.filter((l) => l.confidence === "high").map((l) => l.insight),

      nextSteps: diagnostics.therapeutic_opportunities.slice(0, 3),
    },

    confidence: calculateOverallConfidence(diagnostics),
  };
};
```

## Analytics & Monitoring

### Diagnostic Quality Metrics

```typescript
// Track diagnostic generation quality
export const trackDiagnosticMetrics = (sessionId: string, diagnostics: SessionDiagnosticsWithMetadata) => {
  const metrics = {
    // Content quality
    beliefCount: diagnostics.diagnostics.core_beliefs.length,
    distortionCount: diagnostics.diagnostics.dominant_distortions.length,
    patternCount: diagnostics.diagnostics.emotional_behavioral_patterns.length,

    // Confidence distribution
    highConfidenceItems: countItemsByConfidence(diagnostics.diagnostics, "high"),
    mediumConfidenceItems: countItemsByConfidence(diagnostics.diagnostics, "medium"),
    lowConfidenceItems: countItemsByConfidence(diagnostics.diagnostics, "low"),

    // Generation metrics
    tokensUsed: diagnostics.metadata.tokensUsed,
    modelUsed: diagnostics.metadata.modelUsed,
    sessionSize: diagnostics.metadata.sessionMessageCount,

    // Timing
    generationTime: Date.now() - diagnostics.metadata.generatedAt.getTime(),
  };

  analytics.track("session_diagnostics_generated", {
    sessionId,
    ...metrics,
    timestamp: new Date(),
  });
};
```

## Testing Strategy

### Unit Testing

```typescript
// Test diagnostic parsing and validation
describe("Session Diagnostics Core", () => {
  it("should parse valid diagnostic JSON", () => {
    const validResponse = `{
      "core_beliefs": [{"belief": "Test belief", "confidence": "high"}],
      "silent_rules_and_double_binds": [],
      "dominant_distortions": [],
      "emotional_behavioral_patterns": [],
      "hidden_leverage_points": [],
      "therapeutic_opportunities": []
    }`;

    const parsed = parseSessionDiagnostics(validResponse);
    expect(parsed.core_beliefs).toHaveLength(1);
    expect(parsed.core_beliefs[0].confidence).toBe("high");
  });

  it("should handle malformed JSON gracefully", () => {
    const invalidResponse = "Invalid JSON response";
    expect(() => parseSessionDiagnostics(invalidResponse)).toThrow();
  });
});
```

### Integration Testing

```typescript
// Test full diagnostic generation flow
describe("Session Diagnostics Generation", () => {
  it("should generate complete diagnostics for valid session", async () => {
    const mockSession = createMockSession({
      messageCount: 15,
      analysisSnapshots: [createMockAnalysis(), createMockAnalysis()],
      memoryStore: "User discussed anxiety and work stress",
    });

    const result = await generateSessionDiagnosticsAction(mockSession, "M1");

    expect(result.diagnostics).toBeDefined();
    expect(result.metadata.tokensUsed).toBeGreaterThan(0);
    expect(result.metadata.sessionMessageCount).toBe(15);
  });
});
```

## Summary

The Session Diagnostics flow provides sophisticated psychological assessment capabilities that transform raw therapeutic conversations into actionable clinical insights:

1. **Advanced Clinical Formulation**: Expert-level case formulation using AI-powered analysis
2. **Structured Diagnostic Output**: Comprehensive psychological profile with confidence levels
3. **Pattern Recognition**: Identifies core beliefs, cognitive distortions, and behavioral loops
4. **Therapeutic Planning**: Concrete opportunities and leverage points for intervention
5. **Data Security**: Full encryption for sensitive psychological data
6. **Performance Optimization**: Smart caching and model selection for cost efficiency
7. **Error Resilience**: Graceful degradation and fallback mechanisms
8. **Quality Assurance**: Comprehensive validation and confidence scoring
9. **Integration Ready**: Seamless integration with session analysis and memory systems
10. **Clinical Value**: Professional-grade insights that enhance therapeutic outcomes

This system enables Innuora to provide clinical-level psychological insights while maintaining the highest standards of data privacy and user trust.
