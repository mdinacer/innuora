# Mood Tracking Integration Plan

## Overview

Integrate a comprehensive mood tracking system into Innuora's therapeutic platform, leveraging the existing session flow architecture and CBT module system to provide personalized mood insights and interventions.

## Phase 1: Mood Data Model & Types

### 1.1 Core Mood Types

```typescript
// src/types/mood-tracking.types.ts
export const MoodScale = {
  VERY_LOW: 1,
  LOW: 2,
  NEUTRAL: 3,
  GOOD: 4,
  VERY_GOOD: 5,
} as const;

export const MoodTriggers = {
  WORK_STRESS: "work_stress",
  RELATIONSHIPS: "relationships",
  HEALTH: "health",
  FINANCES: "finances",
  FAMILY: "family",
  SOCIAL: "social",
  SLEEP: "sleep",
  WEATHER: "weather",
  UNKNOWN: "unknown",
} as const;

export const MoodContexts = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
  BEFORE_SESSION: "before_session",
  AFTER_SESSION: "after_session",
  CRISIS: "crisis",
  ROUTINE_CHECKIN: "routine_checkin",
} as const;
```

### 1.2 Mood Entry Schema

```prisma
// prisma/schema.prisma additions
model MoodEntry {
  id          String   @id @default(cuid())
  userId      String
  sessionId   String?

  // Core mood data
  moodScale   Int      // 1-5 scale
  intensity   Int?     // 1-10 intensity
  notes       String?

  // Context and triggers
  context     String   // MoodContexts enum
  triggers    String[] // Array of MoodTriggers

  // Metadata
  timestamp   DateTime @default(now())
  timezone    String?
  location    String?  // Optional location context

  // Relationships
  user        User     @relation(fields: [userId], references: [id])
  session     Session? @relation(fields: [sessionId], references: [id])

  @@index([userId, timestamp])
  @@index([sessionId])
}
```

### 1.3 Mood Analytics Schema

```prisma
model MoodPattern {
  id           String   @id @default(cuid())
  userId       String

  // Pattern analysis
  patternType  String   // "weekly", "daily", "trigger_based"
  insights     Json     // AI-generated insights
  trends       Json     // Statistical trends

  // Time range
  startDate    DateTime
  endDate      DateTime

  // Metadata
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id])

  @@index([userId, startDate])
}
```

## Phase 2: Mood Collection System

### 2.1 Quick Mood Check-in Component

**Location**: `src/components/mood-tracking/quick-mood-checkin.tsx`

**Features**:

- 5-point mood scale with emoji indicators
- Single-tap mood entry
- Optional trigger selection
- Contextual prompting based on time/session

### 2.2 Detailed Mood Entry Component

**Location**: `src/components/mood-tracking/detailed-mood-entry.tsx`

**Features**:

- Extended mood scale with intensity slider
- Multi-select trigger identification
- Free-text notes with character limit
- Mood trend visualization
- Session correlation display

### 2.3 Mood Visualization Dashboard

**Location**: `src/components/mood-tracking/mood-dashboard.tsx`

**Components**:

- **MoodTrendChart**: 30-day mood timeline
- **MoodDistribution**: Pie chart of mood frequencies
- **TriggerAnalysis**: Most common triggers with frequency
- **SessionCorrelation**: Mood before/after sessions
- **PersonalInsights**: AI-generated mood insights

### 2.4 Mood Reminder System

**Location**: `src/domains/mood-tracking/mood-reminders.ts`

**Features**:

- Configurable reminder schedules (daily, weekly)
- Smart reminder timing based on user patterns
- Integration with notification system
- Gentle nudging without pressure

## Phase 3: AI Integration & CBT Enhancement

### 3.1 Mood-Aware CBT Modules

**Extension**: `src/domains/cbt-modules/modules-mood-integration.ts`

**Enhancements**:

```typescript
// Extend existing CBT modules with mood awareness
export const MOOD_ENHANCED_MODULES = {
  [SESSION_MODULES.COGNITIVE]: {
    lowMoodPrompts: [
      "I notice you're feeling low today. What thoughts are particularly heavy?",
      "When mood is down, our thinking can become more negative. What's your mind telling you?",
    ],
    highMoodPrompts: [
      "You're feeling good today! What thoughts are supporting this positive mood?",
      "Let's capture what's working well for you right now.",
    ],
  },

  [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: {
    moodBasedActivities: {
      veryLow: ["gentle_movement", "basic_self_care", "reach_out"],
      low: ["small_accomplishment", "nature_walk", "creative_activity"],
      neutral: ["routine_maintenance", "social_connection", "skill_building"],
      good: ["challenging_activity", "help_others", "goal_pursuit"],
      veryGood: ["celebration", "reflection", "gratitude_practice"],
    },
  },
};
```

### 3.2 Mood Pattern Analysis Engine

**Location**: `src/domains/mood-tracking/mood-analysis-engine.ts`

**Capabilities**:

- Weekly/monthly mood trend analysis
- Trigger pattern identification
- Session effectiveness correlation
- Predictive mood insights
- Crisis risk assessment based on mood patterns

### 3.3 Content Recommendation Enhancement

**Integration**: `src/lib/content/content-recommendation-engine.ts`

**Mood-Based Recommendations**:

```typescript
// Extend existing recommendation context
export interface MoodAwareRecommendationContext extends ContentRecommendationContext {
  currentMood?: number;
  moodTrends?: Array<{ date: Date; mood: number }>;
  frequentTriggers?: string[];
  moodGoals?: string[];
}

// Mood-specific content filtering
const getMoodAppropriateContent = (mood: number, content: ContentItem[]) => {
  const moodFilters = {
    veryLow: (item) => item.metadata.intent === "supportive" || item.metadata.targetEmotions?.includes("crisis"),
    low: (item) => item.metadata.intent === "actionable" && item.metadata.category === "depression-support",
    neutral: (item) => item.metadata.intent === "informational",
    good: (item) => item.metadata.intent === "actionable",
    veryGood: (item) => item.metadata.category === "self-compassion",
  };

  return content.filter(moodFilters[getMoodCategory(mood)]);
};
```

## Phase 4: Session Integration

### 4.1 Pre-Session Mood Check-in

**Integration Point**: Session flow initialization

**Implementation**:

```typescript
// Add mood check-in step to session flows
const PRE_SESSION_MOOD_STEP = {
  id: "pre_session_mood",
  type: StepType.OPTIONS,
  content: {
    label: "How are you feeling right now?",
    key: "prSessionMood",
    mode: SelectMode.SINGLE,
    options: MOOD_SCALE_OPTIONS,
  },
  nextStepId: "main_session_flow",
};
```

### 4.2 Post-Session Mood Assessment

**Integration Point**: Session completion flow

**Features**:

- Mood change assessment (before/after)
- Session effectiveness rating
- Insights capture for future sessions
- Automatic mood trend update

### 4.3 Crisis Intervention Integration

**Enhancement**: `src/domains/cbt-modules/modules/crisis.ts`

**Mood-Based Crisis Detection**:

```typescript
const assessCrisisRisk = (moodEntries: MoodEntry[], currentMood: number) => {
  const recentLowMoods = moodEntries.filter((entry) => entry.moodScale <= 2 && isWithinDays(entry.timestamp, 7));

  const riskFactors = {
    consistentLowMood: recentLowMoods.length >= 5,
    rapidMoodDrop: hasRapidMoodDrop(moodEntries),
    crisisTriggers: recentLowMoods.some((entry) => entry.triggers.includes("crisis") || entry.notes?.includes("harm")),
  };

  return calculateRiskLevel(riskFactors);
};
```

## Phase 5: Data Analytics & Insights

### 5.1 Personal Mood Analytics

**Location**: `src/domains/mood-tracking/mood-analytics.ts`

**Analytics Features**:

- Average mood by day of week
- Mood correlation with sleep/weather/sessions
- Trigger frequency analysis
- Mood stability metrics
- Progress toward mood goals

### 5.2 Therapeutic Insights Generation

**AI Integration**: `src/domains/mood-tracking/mood-insights-generator.ts`

**Insight Types**:

- Pattern recognition ("You tend to feel low on Mondays")
- Trigger analysis ("Work stress seems to be your main mood trigger")
- Progress tracking ("Your mood has improved 15% this month")
- Intervention suggestions ("Breathing exercises help improve your mood")
- Goal recommendations ("Consider setting a goal for mood stability")

### 5.3 Mood Report Generation

**Location**: `src/components/mood-tracking/mood-reports.tsx`

**Report Features**:

- Weekly mood summary with trends
- Monthly progress report
- Trigger pattern analysis
- Session effectiveness correlation
- Downloadable PDF reports for healthcare providers

## Implementation Timeline

### Week 1-2: Foundation

- Create mood tracking types and schemas
- Implement basic mood entry components
- Set up database migrations

### Week 3-4: Core Features

- Build mood visualization dashboard
- Implement mood reminder system
- Create mood analytics engine

### Week 5-6: AI Integration

- Enhance CBT modules with mood awareness
- Implement mood pattern analysis
- Integrate with content recommendation engine

### Week 7-8: Session Integration

- Add pre/post session mood check-ins
- Implement crisis intervention enhancements
- Create mood-based session adaptations

### Week 9-10: Advanced Features

- Build comprehensive mood reports
- Implement therapeutic insights generation
- Add mood goal setting and tracking

## Technical Considerations

### Database Performance

- Efficient indexing on userId and timestamp
- Aggregation queries for trend analysis
- Caching for frequently accessed mood data

### Privacy & Security

- Encrypt sensitive mood notes
- Anonymize mood data for analytics
- Granular privacy controls for mood sharing

### User Experience

- Minimal friction mood entry (< 10 seconds)
- Contextual mood prompts
- Positive reinforcement for consistent tracking
- Optional mood tracking (never forced)

### Integration Points

- Seamless session flow integration
- Content recommendation enhancement
- Crisis intervention system
- Notification system integration

This comprehensive mood tracking system will significantly enhance Innuora's therapeutic capabilities while maintaining the platform's focus on user privacy and clinical effectiveness.
