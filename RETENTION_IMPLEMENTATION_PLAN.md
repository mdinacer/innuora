# Innuora Retention Implementation Plan

**Date**: November 2025
**Purpose**: Add research-backed retention features while keeping existing conversation engine
**Goal**: Move from 3% industry average retention to 15%+ through targeted features

---

## Executive Summary

**What We Have (Strengths):**
- ✅ Sophisticated 3-stage conversation pipeline (directive → memory → reflection)
- ✅ Persistent memory system across sessions (beats ChatGPT)
- ✅ Consistent personality via relational trace (beats ChatGPT's generic responses)
- ✅ Crisis detection in analysis layer (beats ChatGPT's unsafe responses)
- ✅ Professional therapeutic structure (what women want per 2024 research)

**What We're Missing (Critical Gaps):**
- ❌ No mood tracking or progress visualization
- ❌ No peer community support (research shows 3x better retention)
- ❌ No daily engagement ritual
- ❌ No accountability mechanisms
- ❌ No proactive outreach

**Research Foundation:**
- Mental health apps: 3% retention at 30 days (industry baseline)
- Apps with peer support: 8.9% retention (3x better)
- Women prefer structured guidance + emotional support over friendship
- ChatGPT problems: no memory, inconsistent, generic, creates loneliness
- What works: human accountability, progress visualization, personalization, community
- What doesn't: gamification (weakens retention)

---

## Phase 1: Quick Wins (2-3 weeks)
*Goal: Add foundational retention features with minimal complexity*

### 1.1 Mood Tracking System
**Why**: Research shows mood tracking + visualization = core retention driver
**Effort**: Low | **Impact**: High

**Implementation:**
```typescript
// Database schema addition
model MoodEntry {
  id          String   @id @default(cuid())
  userId      String
  sessionId   String?
  mood        Int      // 1-5 scale
  energy      Int?     // 1-5 scale
  tags        String[] // ["anxious", "hopeful", "tired"]
  notes       String?
  createdAt   DateTime @default(now())
}
```

**UI Components:**
- Simple 1-5 mood slider at session start
- Optional: energy level + emotion tags
- Takes 5 seconds, non-intrusive

**Where to add:**
- `src/components/sessions/session-page/mood-check.tsx` (new)
- Update `src/domains/session-state/` to track mood in session metadata
- Add to session start flow (not every message)

### 1.2 Basic Progress Visualization
**Why**: Users need to see tangible progress to stay engaged
**Effort**: Low | **Impact**: High

**What to show:**
- Total sessions completed
- Active session time (you already track this!)
- Mood trend over last 7/30 days (simple line chart)
- Themes discussed (extract from session memory)

**Implementation:**
- Create `/src/app/[locale]/(protected)/progress/page.tsx`
- Use existing `Session.metadata.activeDurationMs`
- Query `MoodEntry` for trends
- Use `SessionContext.factualMemory` to extract recurring themes

**Tech stack:**
- Recharts for simple graphs
- Server component for data fetching
- No real-time updates needed

### 1.3 Session Streak Counter
**Why**: Creates accountability without gamification
**Effort**: Very Low | **Impact**: Medium

**Implementation:**
```typescript
// Add to User model
model User {
  // ... existing fields
  currentStreak     Int @default(0)
  longestStreak     Int @default(0)
  lastSessionDate   DateTime?
}
```

**Display:**
- Simple counter in header: "3 days in a row"
- No points, no badges, just acknowledgment
- Reset logic: if gap > 3 days, restart streak

**Where:**
- Update user on session completion
- Display in `src/components/user-menu.tsx` (already open in IDE)
- Small, non-intrusive

---

## Phase 2: Community & Accountability (3-4 weeks)
*Goal: Add peer support (3x retention boost) and accountability mechanisms*

### 2.1 Anonymous Peer Community
**Why**: Research shows peer support apps = 8.9% retention vs 3% average
**Effort**: Medium | **Impact**: Very High

**Structure:**
```typescript
model CommunityPost {
  id            String   @id @default(cuid())
  authorId      String   // Anonymized display name
  content       String   // Max 500 chars
  category      String   // "win", "struggle", "question", "reflection"
  isAnonymous   Boolean  @default(true)
  mood          Int?     // Optional mood when posted

  reactions     Reaction[]
  comments      Comment[]

  isModerated   Boolean  @default(false)
  moderatedBy   String?
  moderatedAt   DateTime?

  createdAt     DateTime @default(now())
}

model Reaction {
  id        String @id @default(cuid())
  postId    String
  userId    String
  type      String // "support", "relate", "celebrate"
  createdAt DateTime @default(now())
}
```

**Safety Features:**
- All posts anonymous by default
- Moderation queue for flagged content
- No DMs (reduces risk)
- Professional moderation required (could be you initially)
- Clear community guidelines

**Categories:**
- **Wins**: "I set a boundary today"
- **Struggles**: "Having a hard time with..."
- **Questions**: "How do you deal with..."
- **Reflections**: Insights from therapy work

**Where to build:**
- `/src/app/[locale]/(protected)/community/page.tsx`
- `/src/domains/community/` (new domain)
- Optional: Users can choose to participate or not

**Monetization angle:**
- Free tier: read-only community access
- Paid tier: can post + comment
- Creates upgrade incentive

### 2.2 Daily Check-In Ritual
**Why**: Daily engagement = habit formation
**Effort**: Low | **Impact**: Medium

**Implementation:**
- Optional morning notification: "How are you starting your day?"
- 1-tap mood check (links to mood tracking)
- Optional: Brief gratitude prompt
- Takes 10 seconds

**Tech:**
- Push notifications (Next.js + service workers)
- Or email/SMS for non-intrusive option
- User controls timing and frequency

**Data collected:**
```typescript
model DailyCheckIn {
  id          String   @id @default(cuid())
  userId      String
  mood        Int      // Quick mood
  gratitude   String?  // Optional "what went well"
  createdAt   DateTime @default(now())
}
```

### 2.3 Proactive Outreach System
**Why**: Shows the app cares, prevents abandonment
**Effort**: Medium | **Impact**: High

**Triggers:**
- User hasn't checked in for 3 days → "Thinking of you"
- Mood declining trend (3+ consecutive lower moods) → "I noticed things seem harder"
- Long session gap after consistent use → "Would you like to talk?"

**Implementation:**
- Cron job checks user patterns daily
- Generates gentle outreach messages
- Uses existing reflection model to personalize
- Non-intrusive (email or in-app notification)

**Location:**
- `/src/lib/proactive-care/` (new)
- Background job (Vercel Cron)
- Integrates with existing session context

---

## Phase 3: Advanced Progress Features (4-6 weeks)
*Goal: Make therapy progress tangible and visible*

### 3.1 Progress Milestones
**Why**: Concrete markers create sense of achievement
**Effort**: Medium | **Impact**: High

**Milestone Types:**
```typescript
interface Milestone {
  type: "pattern_identified" | "coping_strategy" | "reframe" | "consistency"
  title: string
  description: string
  unlockedAt: DateTime
  sessionId: string
}
```

**Examples:**
- "Identified your first cognitive distortion"
- "Created 3 personalized coping strategies"
- "Reframed 10 negative thoughts"
- "7-day conversation streak"
- "Explored a difficult emotion for the first time"

**Detection:**
- Parse `SessionContext.aggregatedAnalysis` for patterns
- Track cognitive work in reflection outputs
- Use existing therapeutic analysis

**Display:**
- Progress page timeline
- Subtle celebration when unlocked
- NOT gamification - just acknowledgment

### 3.2 Insights Dashboard
**Why**: Helps users see patterns they wouldn't notice
**Effort**: Medium | **Impact**: Medium

**What to show:**
- Most discussed themes (word cloud from memory)
- Mood patterns vs time of day/week
- Progress in specific areas (anxiety, relationships, etc.)
- Coping strategies that worked
- Emotional range over time

**Data sources:**
- `SessionContext.factualMemory` → themes
- `MoodEntry` → mood patterns
- `SessionContext.aggregatedAnalysis` → therapeutic progress
- Reflection outputs → strategies tried

**Tech:**
- Server-side aggregation
- Simple visualizations (charts, word clouds)
- Weekly summary email (optional)

### 3.3 Therapeutic Progress Tracking
**Why**: Makes abstract therapy work concrete
**Effort**: High | **Impact**: High

**Track:**
```typescript
interface TherapeuticProgress {
  userId: string

  // Cognitive patterns
  distortionsIdentified: {
    type: string      // "catastrophizing", "black-white thinking"
    count: number
    lastSeen: DateTime
  }[]

  // Coping strategies
  strategiesDeveloped: {
    strategy: string  // "breathing exercise", "thought reframe"
    usageCount: number
    effectiveness: number // Self-reported or inferred
  }[]

  // Emotional awareness
  emotionsExplored: {
    emotion: string
    depth: number     // Surface vs deep exploration
    firstExplored: DateTime
  }[]

  // Session quality
  averageSessionDepth: number  // From wellness checks
  readinessForDeepWork: number // Trend over time
}
```

**Implementation:**
- Extract from existing analysis snapshots
- Aggregate in background job
- Display in progress dashboard
- Use for personalized recommendations

---

## Phase 4: Intelligence Layer (Ongoing)
*Goal: Use existing AI to create smarter engagement*

### 4.1 Smart Recommendations
**Why**: Personalized next steps based on progress
**Effort**: Low (uses existing AI) | **Impact**: Medium

**What to recommend:**
- "Based on your mood pattern, let's explore [theme]"
- "You mentioned [person] 3 times - want to talk about that?"
- "It's been [X] days since you practiced [coping strategy]"
- Community posts relevant to user's themes

**Implementation:**
- Use GPT-4.1-mini with user's context
- Generate weekly personalized suggestions
- Non-intrusive, just helpful

### 4.2 Crisis Prevention (Enhanced)
**Why**: Proactive safety vs reactive
**Effort**: Medium | **Impact**: Very High

**Current state:** Crisis detection in directive stage
**Enhancement:**
- Track crisis signals over time
- Detect patterns (time of day, triggers)
- Proactive check-in when risk elevated
- Escalation protocol (suggest professional help)

**Safety first:**
- Clear messaging: "I'm not a substitute for professional help"
- Resource list (hotlines, therapists)
- Partner with crisis services (future)

---

## Technical Implementation Notes

### Database Changes Needed

```prisma
// Add to schema.prisma

model MoodEntry {
  id          String   @id @default(cuid())
  userId      String
  sessionId   String?
  mood        Int
  energy      Int?
  tags        String[]
  notes       String?
  createdAt   DateTime @default(now())

  user        User     @relation(...)
}

model DailyCheckIn {
  id          String   @id @default(cuid())
  userId      String
  mood        Int
  gratitude   String?
  createdAt   DateTime @default(now())

  user        User     @relation(...)
}

model CommunityPost {
  id            String     @id @default(cuid())
  authorId      String
  content       String
  category      String
  isAnonymous   Boolean    @default(true)
  mood          Int?
  isModerated   Boolean    @default(false)
  moderatedBy   String?
  moderatedAt   DateTime?
  createdAt     DateTime   @default(now())

  author        User       @relation(...)
  reactions     Reaction[]
  comments      Comment[]
}

model Reaction {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  type      String
  createdAt DateTime @default(now())

  post      CommunityPost @relation(...)
  user      User          @relation(...)
}

model Milestone {
  id          String   @id @default(cuid())
  userId      String
  type        String
  title       String
  description String
  sessionId   String?
  unlockedAt  DateTime @default(now())

  user        User     @relation(...)
}

// Update User model
model User {
  // ... existing fields
  currentStreak     Int       @default(0)
  longestStreak     Int       @default(0)
  lastSessionDate   DateTime?

  // New relations
  moodEntries       MoodEntry[]
  dailyCheckIns     DailyCheckIn[]
  communityPosts    CommunityPost[]
  reactions         Reaction[]
  milestones        Milestone[]
}
```

### New Domains to Create

```
src/domains/
├── mood-tracking/
│   ├── mood-tracking.actions.ts
│   ├── mood-tracking.types.ts
│   └── mood-tracking.utils.ts
├── community/
│   ├── community.actions.ts
│   ├── community.moderation.ts
│   ├── community.types.ts
│   └── community.utils.ts
├── progress/
│   ├── progress.actions.ts
│   ├── progress.aggregation.ts
│   ├── progress.types.ts
│   └── milestone-detector.ts
└── proactive-care/
    ├── proactive-care.service.ts
    ├── outreach-triggers.ts
    └── notification.utils.ts
```

### New UI Components

```
src/components/
├── mood/
│   ├── mood-entry-form.tsx
│   ├── mood-trend-chart.tsx
│   └── mood-calendar.tsx
├── community/
│   ├── community-feed.tsx
│   ├── community-post-card.tsx
│   ├── post-composer.tsx
│   └── reaction-buttons.tsx
├── progress/
│   ├── progress-dashboard.tsx
│   ├── milestone-card.tsx
│   ├── insights-widget.tsx
│   └── streak-counter.tsx
└── check-in/
    ├── daily-check-in-dialog.tsx
    └── gratitude-prompt.tsx
```

---

## Success Metrics

### Primary KPIs
- **30-day retention**: Target 12-15% (vs 3% industry)
- **7-day retention**: Target 25-30%
- **Sessions per user**: Target 8+ (vs current unknown)
- **Time to second session**: Target <48 hours

### Secondary Metrics
- Mood tracking adoption rate: >60% of users
- Community participation: >20% post/comment
- Daily check-in completion: >40% of active users
- Progress page views: >50% of users visit weekly

### Engagement Indicators
- Average session length (already tracking)
- Messages per session
- Return visit frequency
- Feature usage by cohort

---

## Prioritization Matrix

| Feature | Effort | Impact | Research Support | Priority |
|---------|--------|--------|------------------|----------|
| Mood tracking | Low | High | Strong | **P0** |
| Progress visualization | Low | High | Strong | **P0** |
| Streak counter | Very Low | Medium | Medium | **P0** |
| Community (read) | Medium | Very High | Very Strong | **P1** |
| Community (post) | Medium | Very High | Very Strong | **P1** |
| Daily check-in | Low | Medium | Strong | **P1** |
| Proactive outreach | Medium | High | Strong | **P1** |
| Milestones | Medium | High | Medium | **P2** |
| Insights dashboard | Medium | Medium | Medium | **P2** |
| Smart recommendations | Low | Medium | Medium | **P2** |

---

## What NOT to Build

Based on research showing these DON'T improve retention:

- ❌ **Gamification** (points, badges, levels) - Research shows this weakens retention
- ❌ **Complex goal-setting systems** - Too much friction
- ❌ **Social media features** (profiles, follows) - Increases risk, decreases safety
- ❌ **Direct messaging** - Liability and moderation nightmare
- ❌ **Elaborate onboarding** - Reduces activation
- ❌ **Notifications overload** - Causes opt-out

Keep it simple. Focus on what research proves works.

---

## Revenue Implications

### Freemium Model Opportunity

**Free Tier:**
- Basic conversation (limited messages/month)
- Read-only community access
- Basic mood tracking
- View own progress

**Paid Tier ($20-30/month):**
- Unlimited conversations
- Post/comment in community
- Advanced insights dashboard
- Daily check-in features
- Proactive care outreach
- Priority support

**Why this works:**
- Community posting as paid feature = upgrade incentive
- Aligns with research: human connection drives retention
- Users experience value before paying
- Recurring revenue vs credit purchases

### Credit System Enhancement

Keep credits for pay-as-you-go users, but:
- Offer subscription that includes credits
- Bundle community access with subscription
- Credits for one-off users, subscription for committed users

---

## Migration Path

### Week 1-2: Foundation
- Add database schema for mood tracking
- Build basic mood entry component
- Add to session start flow
- Ship to production (low risk)

### Week 3-4: Progress
- Build progress dashboard
- Add streak counter to header
- Implement basic visualizations
- Test with beta users

### Week 5-8: Community
- Build community backend
- Create moderation tools
- Launch with invite-only beta
- Gather feedback, iterate

### Week 9-12: Intelligence
- Add daily check-in system
- Build proactive outreach triggers
- Implement milestone detection
- Launch to all users

### Ongoing:
- Monitor retention metrics
- Iterate based on data
- Add features from Phase 3-4 based on user feedback

---

## Risk Mitigation

### Technical Risks
- **Database bloat**: Implement data retention policies (archive old mood entries)
- **Community moderation**: Start small, hire moderators as needed
- **Notification fatigue**: User controls, smart throttling

### Business Risks
- **Low community participation**: Seed with quality content, invite active users first
- **Privacy concerns**: Anonymous by default, clear data policies
- **Regulatory compliance**: Consult legal, avoid medical claims

### User Risks
- **Feature creep perception**: Ship incrementally, each feature must prove value
- **Complexity**: Keep UI simple, features optional
- **Trust**: Be transparent about what data is collected and why

---

## Competitive Positioning

### vs ChatGPT
- ✅ Persistent memory (we have)
- ✅ Consistency (we have)
- ✅ Crisis detection (we have)
- ✅ **Progress tracking** (we'll add)
- ✅ **Community support** (they don't have)
- ✅ **Therapeutic structure** (we have)

### vs Replika
- ✅ Professional therapeutic framework (they're friendship-focused)
- ✅ Evidence-based CBT approach (they're open-ended)
- ✅ **Women-focused guidance** (they're general companion)
- ⚠️ They have better personalization depth (we can improve)
- ⚠️ They have activities/games (not our focus)

### vs Woebot
- ✅ More natural conversation (they're rigid CBT)
- ✅ **Community support** (they don't have)
- ✅ Better personalization (our memory system)
- ⚠️ They have clinical validation (we don't yet)
- ⚠️ They're insurance-backed (we're not yet)

**Our moat:** Only app combining ChatGPT-quality conversation + therapeutic structure + community support + persistent memory

---

## Next Steps

### Immediate (This Week)
1. Review this plan
2. Decide on Phase 1 scope
3. Create database migration for mood tracking
4. Design mood entry UI (sketch/wireframe)

### Short-term (Next 2 Weeks)
1. Implement mood tracking
2. Build basic progress page
3. Add streak counter
4. Ship to production
5. **Measure**: Do users engage with mood tracking?

### Medium-term (Next Month)
1. Design community features
2. Build moderation tools
3. Invite beta users to community
4. Implement daily check-in
5. **Measure**: Does community improve retention?

### Long-term (Next Quarter)
1. Analyze retention data
2. Iterate on what works
3. Cut what doesn't
4. Consider freemium model
5. Plan for scale

---

## Final Thoughts

**You have a sophisticated conversation engine that solves real problems ChatGPT has.**

Now add the simple features that research proves create retention:
- Mood tracking (users see their patterns)
- Progress visualization (users see their growth)
- Community (users feel less alone)
- Accountability (users show up consistently)

**Simple execution > sophisticated technology.**

Your technical foundation is strong. Build the retention layer on top, and you'll have something defensible.

Focus on Phase 1 first. Ship it. Measure it. Then decide if Phase 2 is worth it.

**Start with mood tracking this week.**
