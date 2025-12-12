# Global Memory & Tracking Architecture Proposal

## Problem Statement

**Current Issues:**
1. Memory is session-scoped → duplicates across sessions, no global view
2. Tracking is session-scoped → can't see patterns across 10+ sessions
3. Memory will grow unbounded without consolidation strategy
4. Therapeutic insights limited to single session context

**Therapeutic Need:**
- Track patterns ACROSS all sessions (e.g., "catastrophizing in 70% of sessions")
- Maintain global memory (e.g., "mentioned mother in 5 contexts over 3 weeks")
- Consolidate memories to prevent bloat (keep relevant, archive outdated)
- See user growth over time (e.g., "anxiety decreased 40% over 4 weeks")

---

## Proposed Solution

### Part 1: Global Memory System

#### New Schema

```prisma
// Global user memory (replaces session-scoped factualMemory)
model UserMemory {
  id     String @id @default(cuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Memory content
  category        MemoryCategory // "person", "work", "family", "health", etc.
  summary         String         @db.Text() // "User's mother is critical, strained relationship"

  // Anchors for recall (searchable)
  entities        String[]       // ["mother", "mom"]
  themes          String[]       // ["family_conflict", "criticism"]
  people          String[]       // ["mother"]
  aliases         String[]       // ["mom", "mother", "her"]

  // Context
  temporalScope   TemporalScope  // "ongoing", "past", "future"
  emotionalValence String        // "negative", "positive", "mixed", "neutral"

  // Metadata
  firstMentioned  DateTime       @map("first_mentioned") // When first extracted
  lastMentioned   DateTime       @map("last_mentioned")  // When last referenced
  mentionCount    Int            @default(1) // How many times discussed

  // Consolidation tracking
  isConsolidated  Boolean        @default(false) // Merged from multiple memories
  sourceMemoryIds String[]       @default([]) // IDs of memories merged into this one

  // Relevance decay
  importance      Float          @default(1.0) // 0-1, decays over time
  isArchived      Boolean        @default(false)
  archivedAt      DateTime?      @map("archived_at")

  // Timestamps
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  @@index([userId, isArchived, importance])
  @@index([userId, category])
  @@index([userId, lastMentioned])
  @@map("user_memories")
}

enum MemoryCategory {
  person
  work
  family
  health
  relationship
  emotion
  goal
  trauma
  coping
  trigger
  achievement
  loss
}

enum TemporalScope {
  ongoing
  past
  future
  uncertain
}
```

#### Memory Lifecycle

```
1. EXTRACTION (per conversation turn)
   └─ Extract new facts from user input
   └─ Check if fact already exists in UserMemory
      ├─ If exists: UPDATE (increment mentionCount, update lastMentioned)
      └─ If new: CREATE new UserMemory entry

2. CONSOLIDATION (when memory count > threshold)
   └─ Trigger: When user has > 50 active memories
   └─ Process:
      ├─ Group related memories (same entities/themes)
      ├─ Use GPT-4.1-mini to merge duplicates
      ├─ Keep consolidated version
      ├─ Mark originals as isConsolidated=true
      └─ Store sourceMemoryIds for audit trail

3. DECAY (background job, daily)
   └─ For each memory:
      ├─ If lastMentioned > 30 days: importance *= 0.95
      ├─ If importance < 0.3: archive
      └─ Archived memories still searchable but not loaded by default

4. RECALL (during conversation)
   └─ Extract memory cues from user input
   └─ Query UserMemory where:
      ├─ isArchived = false
      ├─ Match on entities/themes/people
      ├─ ORDER BY importance DESC, lastMentioned DESC
      └─ LIMIT 5-10 most relevant
```

#### Consolidation Example

**Before consolidation (3 separate memories):**
```json
[
  {
    "summary": "User's mother is critical",
    "entities": ["mother"],
    "themes": ["criticism"],
    "mentionCount": 1,
    "firstMentioned": "2025-01-01"
  },
  {
    "summary": "Mom doesn't listen to her",
    "entities": ["mom"],
    "themes": ["communication"],
    "mentionCount": 2,
    "firstMentioned": "2025-01-05"
  },
  {
    "summary": "Mother's expectations are overwhelming",
    "entities": ["mother"],
    "themes": ["pressure"],
    "mentionCount": 1,
    "firstMentioned": "2025-01-10"
  }
]
```

**After consolidation (1 merged memory):**
```json
{
  "summary": "User has strained relationship with mother characterized by criticism, poor communication, and overwhelming expectations. This is an ongoing source of stress.",
  "entities": ["mother", "mom"],
  "themes": ["family_conflict", "criticism", "communication", "pressure"],
  "mentionCount": 4,
  "firstMentioned": "2025-01-01",
  "lastMentioned": "2025-01-10",
  "isConsolidated": true,
  "sourceMemoryIds": ["mem_abc123", "mem_def456", "mem_ghi789"],
  "importance": 1.0
}
```

**Cost:** ~1-3 credits per consolidation (GPT-4.1-mini)
**Frequency:** When memory count exceeds 50, or weekly for active users

---

### Part 2: Global Therapeutic Tracking

#### New Schema

```prisma
// Track therapeutic patterns across all sessions
model TherapeuticPattern {
  id     String @id @default(cuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Pattern identification
  patternType     PatternType    // "cognitive_distortion", "behavior", "emotion", "trigger"
  specificPattern String         // "catastrophizing", "avoidance", "anxiety", "work_stress"

  // Occurrence tracking
  firstDetected   DateTime       @map("first_detected")
  lastDetected    DateTime       @map("last_detected")
  occurrenceCount Int            @default(1) @map("occurrence_count")

  // Context
  contexts        String[]       // Where pattern appears: ["work", "relationships", "family"]
  severity        Float          @default(0.5) // 0-1 scale
  trend           Trend          // "increasing", "decreasing", "stable"

  // Session linkage
  sessionIds      String[]       @default([]) // Sessions where detected

  // Progress tracking
  isAddressed     Boolean        @default(false) // User has worked on this
  addressedAt     DateTime?      @map("addressed_at")
  improvement     Float          @default(0.0) // 0-1 scale, calculated from severity trend

  // Metadata
  metadata        Json           @default("{}") // Additional context

  // Timestamps
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  @@index([userId, patternType])
  @@index([userId, trend])
  @@index([userId, lastDetected])
  @@map("therapeutic_patterns")
}

// Track emotional state over time
model EmotionalTrend {
  id     String @id @default(cuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Emotion tracking
  emotion   String   // "anxiety", "sadness", "anger", "joy", etc.
  intensity Float    // 0-1 scale
  context   String?  // "work", "family", "relationship", etc.

  // Source
  sessionId String?  @map("session_id")
  messageId String?  @map("message_id")
  source    String   // "mood_check", "analysis", "self_report"

  // Timestamp
  recordedAt DateTime @default(now()) @map("recorded_at")

  @@index([userId, emotion, recordedAt])
  @@index([userId, recordedAt])
  @@map("emotional_trends")
}

// Aggregate therapeutic progress
model TherapeuticProgress {
  id     String @id @default(cuid())
  userId String @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Overall metrics
  totalSessions           Int      @default(0) @map("total_sessions")
  totalActiveMinutes      Int      @default(0) @map("total_active_minutes")
  averageSessionDepth     Float    @default(0.0) @map("average_session_depth") // 0-1

  // Pattern tracking
  distortionsIdentified   Json     @default("{}") @map("distortions_identified") // { "catastrophizing": 12, "black_white": 5 }
  distortionsAddressed    Json     @default("{}") @map("distortions_addressed") // { "catastrophizing": 3 }

  // Coping strategies
  strategiesDeveloped     Json     @default("[]") @map("strategies_developed") // [{ strategy, effectiveness }]
  strategiesUsed          Json     @default("{}") @map("strategies_used") // { "breathing": 5, "reframe": 3 }

  // Emotional awareness
  emotionsExplored        String[] @default([]) @map("emotions_explored")
  emotionalRange          Float    @default(0.0) @map("emotional_range") // Diversity of emotions, 0-1

  // Wellness trends
  baselineAnxiety         Float?   @map("baseline_anxiety") // First 3 sessions average
  currentAnxiety          Float?   @map("current_anxiety") // Last 3 sessions average
  baselineMood            Float?   @map("baseline_mood")
  currentMood             Float?   @map("current_mood")

  // Milestones
  milestonesUnlocked      String[] @default([]) @map("milestones_unlocked")

  // Timestamps
  firstSession  DateTime? @map("first_session")
  lastSession   DateTime? @map("last_session")
  lastUpdated   DateTime  @updatedAt @map("last_updated")

  @@map("therapeutic_progress")
}

enum PatternType {
  cognitive_distortion
  behavioral
  emotional
  relational
  trigger
  coping
}

enum Trend {
  increasing
  decreasing
  stable
}
```

---

## Implementation Strategy

### Phase 1: Migrate to Global Memory (Week 1-2)

#### Step 1: Add new tables
```bash
# Add UserMemory, TherapeuticPattern, EmotionalTrend, TherapeuticProgress to schema
pnpm prisma migrate dev --name add_global_memory_tracking
```

#### Step 2: Create memory consolidation service

```typescript
// src/domains/memory-analysis/memory-consolidation.service.ts

interface ConsolidationResult {
  consolidated: UserMemory;
  removed: string[]; // IDs of memories merged
  saved_tokens: number;
}

export async function consolidateUserMemories(
  userId: string
): Promise<ConsolidationResult> {
  // 1. Get all active memories for user
  const memories = await prisma.userMemory.findMany({
    where: { userId, isArchived: false },
    orderBy: { importance: 'desc' }
  });

  // 2. If count < 50, no consolidation needed
  if (memories.length < 50) {
    return { consolidated: null, removed: [], saved_tokens: 0 };
  }

  // 3. Group by entity overlap (find duplicates)
  const groups = groupMemoriesByEntity(memories);

  // 4. For each group with 2+ memories, consolidate
  for (const group of groups) {
    if (group.length < 2) continue;

    // Use GPT-4.1-mini to merge
    const consolidated = await mergeMemoriesWithAI(group);

    // Create new consolidated memory
    const newMemory = await prisma.userMemory.create({
      data: {
        userId,
        category: consolidated.category,
        summary: consolidated.summary,
        entities: consolidated.entities,
        themes: consolidated.themes,
        people: consolidated.people,
        aliases: consolidated.aliases,
        temporalScope: consolidated.temporalScope,
        emotionalValence: consolidated.emotionalValence,
        firstMentioned: group[0].firstMentioned,
        lastMentioned: group[group.length - 1].lastMentioned,
        mentionCount: group.reduce((sum, m) => sum + m.mentionCount, 0),
        isConsolidated: true,
        sourceMemoryIds: group.map(m => m.id),
        importance: Math.max(...group.map(m => m.importance))
      }
    });

    // Archive old memories (don't delete - keep audit trail)
    await prisma.userMemory.updateMany({
      where: { id: { in: group.map(m => m.id) } },
      data: { isArchived: true, archivedAt: new Date() }
    });
  }
}

async function mergeMemoriesWithAI(memories: UserMemory[]): Promise<ConsolidatedMemory> {
  const prompt = `You are consolidating multiple memory entries about the same topic.

Memories to merge:
${memories.map((m, i) => `${i + 1}. ${m.summary}`).join('\n')}

Create ONE consolidated memory that:
1. Combines all unique information
2. Removes redundancy
3. Keeps most recent/relevant details
4. Maintains emotional context
5. Is 150-250 words MAX

Return JSON:
{
  "summary": "consolidated summary",
  "entities": ["canonical entities"],
  "themes": ["merged themes"],
  "people": ["people mentioned"],
  "aliases": ["all name variations"],
  "category": "most relevant category",
  "temporalScope": "ongoing|past|future",
  "emotionalValence": "positive|negative|mixed|neutral"
}`;

  const result = await callAI(prompt, 'gpt-4.1-mini');
  return JSON.parse(result);
}
```

#### Step 3: Update memory extraction to use global store

```typescript
// src/domains/memory-analysis/memory-analysis.actions.ts

export async function extractAndStoreMemories(
  userId: string,
  sessionId: string,
  userInput: string,
  currentMemories: UserMemory[] // Load from UserMemory, not SessionContext
): Promise<void> {
  // 1. Extract new memories from input
  const extracted = await extractMemoryCues(userInput, currentMemories);

  // 2. For each extracted memory
  for (const mem of extracted.extracted_memories) {
    // Check if memory already exists (match on entities)
    const existing = await prisma.userMemory.findFirst({
      where: {
        userId,
        OR: [
          { entities: { hasSome: mem.anchors.entities } },
          { people: { hasSome: mem.anchors.people } }
        ],
        isArchived: false
      }
    });

    if (existing) {
      // UPDATE: Increment mention count, update last mentioned
      await prisma.userMemory.update({
        where: { id: existing.id },
        data: {
          mentionCount: { increment: 1 },
          lastMentioned: new Date(),
          // Optionally enrich summary if new info
          summary: enrichSummary(existing.summary, mem.summary)
        }
      });
    } else {
      // CREATE: New memory
      await prisma.userMemory.create({
        data: {
          userId,
          category: mem.category,
          summary: mem.summary,
          entities: mem.anchors.entities,
          themes: mem.anchors.themes,
          people: mem.anchors.people || [],
          aliases: mem.anchors.aliases || [],
          temporalScope: mem.temporal_scope,
          emotionalValence: mem.emotional_valence,
          firstMentioned: new Date(),
          lastMentioned: new Date(),
          mentionCount: 1,
          importance: 1.0
        }
      });
    }
  }

  // 3. Check if consolidation needed
  const memoryCount = await prisma.userMemory.count({
    where: { userId, isArchived: false }
  });

  if (memoryCount > 50) {
    // Queue consolidation job (run async, don't block response)
    await queueConsolidationJob(userId);
  }
}
```

#### Step 4: Update recall to use global memory

```typescript
// src/domains/memory-analysis/memory-recall.ts

export async function recallRelevantMemories(
  userId: string,
  cues: MemoryCue[]
): Promise<UserMemory[]> {
  // Query global UserMemory instead of session-scoped
  const memories = await prisma.userMemory.findMany({
    where: {
      userId,
      isArchived: false,
      OR: cues.map(cue => ({
        OR: [
          { entities: { hasSome: cue.entities || [] } },
          { themes: { hasSome: cue.themes || [] } },
          { people: { hasSome: cue.people || [] } }
        ]
      }))
    },
    orderBy: [
      { importance: 'desc' },
      { lastMentioned: 'desc' }
    ],
    take: 10 // Top 10 most relevant
  });

  return memories;
}
```

---

### Phase 2: Implement Global Tracking (Week 3-4)

#### Step 1: Track patterns from directives

```typescript
// src/domains/reflection-directive/pattern-tracker.ts

export async function trackPatternsFromDirective(
  userId: string,
  sessionId: string,
  directive: ReflectionDirective
): Promise<void> {
  // 1. Track cognitive distortions
  for (const distortion of directive.distortions_detected) {
    await upsertPattern({
      userId,
      patternType: 'cognitive_distortion',
      specificPattern: distortion,
      sessionId,
      severity: calculateSeverity(directive.risk_level)
    });
  }

  // 2. Track emotional themes
  for (const theme of directive.emotional_themes) {
    await upsertPattern({
      userId,
      patternType: 'emotional',
      specificPattern: theme,
      sessionId,
      severity: calculateSeverity(directive.crisis)
    });
  }

  // 3. Update therapeutic progress
  await updateTherapeuticProgress(userId, directive);
}

async function upsertPattern(data: {
  userId: string;
  patternType: PatternType;
  specificPattern: string;
  sessionId: string;
  severity: number;
}): Promise<void> {
  const existing = await prisma.therapeuticPattern.findFirst({
    where: {
      userId: data.userId,
      patternType: data.patternType,
      specificPattern: data.specificPattern
    }
  });

  if (existing) {
    // Update: increment count, update severity, calculate trend
    const newOccurrences = existing.occurrenceCount + 1;
    const trend = calculateTrend(existing.severity, data.severity);

    await prisma.therapeuticPattern.update({
      where: { id: existing.id },
      data: {
        lastDetected: new Date(),
        occurrenceCount: newOccurrences,
        severity: (existing.severity + data.severity) / 2, // Rolling average
        trend,
        sessionIds: [...existing.sessionIds, data.sessionId]
      }
    });
  } else {
    // Create new pattern
    await prisma.therapeuticPattern.create({
      data: {
        userId: data.userId,
        patternType: data.patternType,
        specificPattern: data.specificPattern,
        firstDetected: new Date(),
        lastDetected: new Date(),
        occurrenceCount: 1,
        severity: data.severity,
        trend: 'stable',
        sessionIds: [data.sessionId]
      }
    });
  }
}
```

#### Step 2: Track emotional trends

```typescript
// src/domains/mood-tracking/emotional-trend-tracker.ts

export async function trackEmotionalState(
  userId: string,
  sessionId: string,
  source: 'mood_check' | 'analysis' | 'directive',
  emotions: { emotion: string; intensity: number; context?: string }[]
): Promise<void> {
  for (const { emotion, intensity, context } of emotions) {
    await prisma.emotionalTrend.create({
      data: {
        userId,
        sessionId,
        emotion,
        intensity,
        context,
        source,
        recordedAt: new Date()
      }
    });
  }

  // Update aggregate progress
  await updateEmotionalProgress(userId);
}

async function updateEmotionalProgress(userId: string): Promise<void> {
  // Get last 7 days of emotional data
  const recentEmotions = await prisma.emotionalTrend.findMany({
    where: {
      userId,
      recordedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  // Calculate emotional range (diversity of emotions)
  const uniqueEmotions = new Set(recentEmotions.map(e => e.emotion));
  const emotionalRange = Math.min(uniqueEmotions.size / 10, 1.0); // Max 10 emotions = 1.0

  // Calculate current anxiety/mood
  const anxietyReadings = recentEmotions.filter(e => e.emotion === 'anxiety');
  const currentAnxiety = anxietyReadings.length > 0
    ? anxietyReadings.reduce((sum, e) => sum + e.intensity, 0) / anxietyReadings.length
    : null;

  // Update progress
  await prisma.therapeuticProgress.upsert({
    where: { userId },
    update: {
      currentAnxiety,
      emotionalRange,
      emotionsExplored: Array.from(uniqueEmotions),
      lastUpdated: new Date()
    },
    create: {
      userId,
      currentAnxiety,
      emotionalRange,
      emotionsExplored: Array.from(uniqueEmotions)
    }
  });
}
```

---

## Cost Analysis

### Memory Consolidation
- **Trigger**: When user has > 50 memories
- **Frequency**: ~1-2 times per month for active users
- **Cost per consolidation**: 1-3 credits (GPT-4.1-mini)
- **Total monthly cost**: 2-6 credits per active user

### Pattern Tracking
- **No AI calls** - just database operations
- **Storage cost**: Negligible (small JSON fields)

### Net Impact
- **Saves tokens**: Consolidated memory = fewer tokens sent to reflection model
- **Improves quality**: More coherent context = better responses
- **ROI**: Positive (saves more than it costs)

---

## Migration Plan

### Week 1: Schema & Infrastructure
- [ ] Add new tables to schema
- [ ] Run migration
- [ ] Create consolidation service
- [ ] Create pattern tracking service

### Week 2: Integration
- [ ] Update memory extraction to use UserMemory
- [ ] Update recall to query UserMemory
- [ ] Update directive handler to track patterns
- [ ] Add emotional trend tracking

### Week 3: Background Jobs
- [ ] Create daily consolidation job
- [ ] Create weekly progress aggregation job
- [ ] Add importance decay logic

### Week 4: UI & Testing
- [ ] Build progress dashboard (show patterns)
- [ ] Build insights page (emotional trends)
- [ ] Test with real user data
- [ ] Monitor consolidation effectiveness

---

## Benefits

### Therapeutic
✅ Track patterns across ALL sessions (not just one)
✅ See user growth over time (e.g., "anxiety down 40%")
✅ Identify recurring distortions (e.g., "catastrophizing in 70% of sessions")
✅ Provide evidence-based progress feedback

### Technical
✅ Prevent memory bloat (consolidation)
✅ Reduce token costs (fewer duplicate facts)
✅ Better context (global vs session-scoped)
✅ Scalable (importance decay archives old memories)

### User Experience
✅ "Innuora remembers me" (global memory)
✅ "I can see my progress" (pattern trends)
✅ "I've worked on X patterns" (concrete feedback)
✅ "My anxiety is improving" (data-driven insights)

---

## Risks & Mitigations

### Risk: Consolidation errors (AI merges wrong memories)
**Mitigation**:
- Keep audit trail (sourceMemoryIds)
- Allow manual memory editing
- Archive instead of delete
- Test consolidation logic extensively

### Risk: Pattern tracking false positives
**Mitigation**:
- Require 2+ detections before surfacing to user
- Show confidence scores
- Allow user to dismiss patterns

### Risk: Database bloat (emotional trends)
**Mitigation**:
- Archive emotional trends > 90 days
- Aggregate into summary statistics
- Keep only raw data for recent period

---

## Next Steps

1. **Review this proposal** - discuss tradeoffs
2. **Approve schema changes** - if design makes sense
3. **Implement Phase 1** - global memory migration
4. **Test consolidation** - with sample data
5. **Roll out gradually** - new users first, then migrate existing

---

This architecture solves both problems you identified:
1. ✅ **Global memory** with consolidation to prevent bloat
2. ✅ **Cross-session tracking** to see patterns over time

It also enables the retention features from the implementation plan (progress tracking, insights dashboard, milestones).
