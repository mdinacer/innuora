# Breathing Exercises Integration Plan

## Overview

Integrate guided breathing exercises into Innuora's therapeutic platform as evidence-based interventions for anxiety, stress, and emotional regulation, seamlessly integrated with the existing CBT module system and session flows.

## Phase 1: Breathing Exercise Framework

### 1.1 Core Breathing Types & Techniques

```typescript
// src/types/breathing-exercises.types.ts
export const BreathingTechniques = {
  BOX_BREATHING: "box_breathing",        // 4-4-4-4 pattern
  FOUR_SEVEN_EIGHT: "4_7_8",           // 4-7-8 pattern
  PROGRESSIVE: "progressive",            // Progressive muscle relaxation
  BELLY_BREATHING: "belly_breathing",    // Diaphragmatic breathing
  COHERENT: "coherent",                  // 5-second in, 5-second out
  TRIANGLE: "triangle",                  // 4-4-4 pattern
  EQUAL: "equal",                        // Equal in/out breathing
  EXTENDED_EXHALE: "extended_exhale",    // Longer exhale for calm
} as const;

export const BreathingIntensity = {
  GENTLE: "gentle",      // 3-5 minutes, slow pace
  MODERATE: "moderate",  // 5-10 minutes, standard pace
  INTENSIVE: "intensive" // 10-15 minutes, focused session
} as const;

export const BreathingContext = {
  ANXIETY_RELIEF: "anxiety_relief",
  STRESS_REDUCTION: "stress_reduction",
  SLEEP_PREPARATION: "sleep_preparation",
  FOCUS_ENHANCEMENT: "focus_enhancement",
  PANIC_INTERVENTION: "panic_intervention",
  SESSION_PREPARATION: "session_preparation",
  POST_SESSION_CALM: "post_session_calm",
  ROUTINE_PRACTICE: "routine_practice",
} as const;
```

### 1.2 Breathing Session Schema

```prisma
// prisma/schema.prisma additions
model BreathingSession {
  id              String   @id @default(cuid())
  userId          String
  sessionId       String?  // Optional link to therapy session

  // Exercise details
  technique       String   // BreathingTechniques enum
  duration        Int      // Duration in seconds
  intensity       String   // BreathingIntensity enum
  context         String   // BreathingContext enum

  // Session data
  completed       Boolean  @default(false)
  completedAt     DateTime?
  startedAt       DateTime @default(now())
  pausedDuration  Int      @default(0) // Time paused in seconds

  // Effectiveness tracking
  preMoodRating   Int?     // 1-10 mood before exercise
  postMoodRating  Int?     // 1-10 mood after exercise
  stressLevel     Int?     // 1-10 stress level
  effectiveness   Int?     // 1-5 perceived effectiveness
  notes           String?

  // Metadata
  timezone        String?
  createdAt       DateTime @default(now())

  // Relationships
  user            User     @relation(fields: [userId], references: [id])
  session         Session? @relation(fields: [sessionId], references: [id])

  @@index([userId, startedAt])
  @@index([sessionId])
  @@index([technique, completed])
}
```

### 1.3 Breathing Exercise Configurations

```typescript
// src/domains/breathing-exercises/breathing-configs.ts
export const BREATHING_EXERCISE_CONFIGS = {
  [BreathingTechniques.BOX_BREATHING]: {
    name: "Box Breathing",
    description: "Equal-length inhale, hold, exhale, hold pattern",
    pattern: {
      inhale: 4,
      holdAfterInhale: 4,
      exhale: 4,
      holdAfterExhale: 4,
    },
    defaultDuration: 300, // 5 minutes
    benefits: ["anxiety_reduction", "focus_improvement", "stress_relief"],
    difficulty: "beginner",
    instructions: [
      "Find a comfortable position",
      "Inhale for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts",
      "Hold for 4 counts",
      "Repeat the pattern"
    ]
  },

  [BreathingTechniques.FOUR_SEVEN_EIGHT]: {
    name: "4-7-8 Breathing",
    description: "Calming breath technique for anxiety and sleep",
    pattern: {
      inhale: 4,
      holdAfterInhale: 7,
      exhale: 8,
      holdAfterExhale: 0,
    },
    defaultDuration: 240, // 4 minutes
    benefits: ["anxiety_reduction", "sleep_improvement", "panic_relief"],
    difficulty: "intermediate",
    maxCycles: 8, // Limit to prevent hyperventilation
    instructions: [
      "Exhale completely through your mouth",
      "Inhale through nose for 4 counts",
      "Hold breath for 7 counts",
      "Exhale through mouth for 8 counts",
      "Repeat up to 8 cycles"
    ]
  },

  [BreathingTechniques.BELLY_BREATHING]: {
    name: "Belly Breathing",
    description: "Deep diaphragmatic breathing for relaxation",
    pattern: {
      inhale: 6,
      holdAfterInhale: 2,
      exhale: 6,
      holdAfterExhale: 2,
    },
    defaultDuration: 600, // 10 minutes
    benefits: ["stress_reduction", "nervous_system_calm", "digestion_support"],
    difficulty: "beginner",
    positionRequired: "lying_or_sitting",
    instructions: [
      "Place one hand on chest, one on belly",
      "Breathe slowly through nose",
      "Feel belly rise more than chest",
      "Exhale slowly through mouth",
      "Focus on belly movement"
    ]
  }
};
```

## Phase 2: Breathing Exercise UI Components

### 2.1 Guided Breathing Interface

**Location**: `src/components/breathing-exercises/guided-breathing-session.tsx`

**Features**:
- Animated breathing guide (expanding/contracting circle)
- Real-time countdown and cycle tracking
- Phase indicators (inhale/hold/exhale)
- Pause/resume functionality
- Background sounds/music options
- Progress visualization

**Animation System**:
```typescript
// Breathing animation configuration
const BreathingAnimation = {
  inhale: {
    scale: 1.5,
    duration: (pattern.inhale * 1000),
    easing: "ease-in-out"
  },
  holdAfterInhale: {
    scale: 1.5,
    duration: (pattern.holdAfterInhale * 1000)
  },
  exhale: {
    scale: 1.0,
    duration: (pattern.exhale * 1000),
    easing: "ease-in-out"
  },
  holdAfterExhale: {
    scale: 1.0,
    duration: (pattern.holdAfterExhale * 1000)
  }
};
```

### 2.2 Breathing Exercise Selection

**Location**: `src/components/breathing-exercises/exercise-selector.tsx`

**Features**:
- Technique cards with descriptions and benefits
- Context-based recommendations
- Difficulty level indicators
- Duration selection options
- Quick-start for emergency situations

### 2.3 Breathing Progress Dashboard

**Location**: `src/components/breathing-exercises/breathing-dashboard.tsx`

**Components**:
- **Weekly Practice Summary**: Total sessions, average duration
- **Effectiveness Tracking**: Mood improvement correlation
- **Technique Usage**: Most effective techniques for user
- **Streak Tracking**: Consecutive days of practice
- **Progress Goals**: Personal breathing practice goals

### 2.4 Emergency Breathing Intervention

**Location**: `src/components/breathing-exercises/emergency-breathing.tsx`

**Features**:
- Rapid access from any screen
- Crisis-specific breathing techniques
- Simplified interface for high-stress moments
- Integration with crisis intervention system
- Automatic session logging

## Phase 3: CBT Module Integration

### 3.1 Breathing Exercise CBT Module

**Location**: `src/domains/cbt-modules/modules/breathing-exercises.ts`

```typescript
export const BREATHING_EXERCISE_MODULE = {
  id: "breathing_exercises",
  name: "Breathing & Mindfulness",
  category: "mindfulness-techniques",

  interventions: {
    anxiety_intervention: {
      trigger: "anxiety_detected",
      technique: BreathingTechniques.FOUR_SEVEN_EIGHT,
      duration: 240,
      context: BreathingContext.ANXIETY_RELIEF,
      prompt: "I notice you're feeling anxious. Let's try some calming breathing together."
    },

    stress_reduction: {
      trigger: "stress_reported",
      technique: BreathingTechniques.BOX_BREATHING,
      duration: 300,
      context: BreathingContext.STRESS_REDUCTION,
      prompt: "Box breathing can help reduce stress. Would you like to try a 5-minute session?"
    },

    session_preparation: {
      trigger: "pre_session",
      technique: BreathingTechniques.COHERENT,
      duration: 180,
      context: BreathingContext.SESSION_PREPARATION,
      prompt: "Let's center ourselves with some breathing before we begin."
    }
  }
};
```

### 3.2 Anxiety Management Enhancement

**Integration**: `src/domains/cbt-modules/modules/anxiety-management.ts`

```typescript
// Extend existing anxiety management with breathing exercises
export const ANXIETY_BREATHING_PROTOCOLS = {
  mild_anxiety: {
    technique: BreathingTechniques.BELLY_BREATHING,
    duration: 300,
    followUpPrompts: [
      "How does your body feel now?",
      "What do you notice about your thoughts?",
      "Rate your anxiety level now (1-10)"
    ]
  },

  moderate_anxiety: {
    technique: BreathingTechniques.BOX_BREATHING,
    duration: 600,
    additionalSupport: ["grounding_techniques", "positive_affirmations"]
  },

  severe_anxiety: {
    technique: BreathingTechniques.FOUR_SEVEN_EIGHT,
    duration: 240,
    maxCycles: 6,
    escalationProtocol: "crisis_intervention"
  }
};
```

### 3.3 Mindfulness Integration

**Enhancement**: `src/domains/cbt-modules/modules/mindfulness.ts`

```typescript
export const MINDFULNESS_BREATHING_SEQUENCES = {
  awareness_building: [
    {
      technique: BreathingTechniques.BELLY_BREATHING,
      duration: 300,
      focus: "body_awareness"
    },
    {
      technique: BreathingTechniques.COHERENT,
      duration: 300,
      focus: "present_moment"
    }
  ],

  emotional_regulation: [
    {
      technique: BreathingTechniques.EXTENDED_EXHALE,
      duration: 240,
      focus: "nervous_system_calm"
    },
    {
      technique: BreathingTechniques.TRIANGLE,
      duration: 180,
      focus: "emotional_balance"
    }
  ]
};
```

## Phase 4: Session Flow Integration

### 4.1 Breathing Exercise Session Steps

```typescript
// Add breathing exercise steps to session flows
export const BREATHING_EXERCISE_STEPS = {
  BREATHING_INTRO: {
    id: "breathing_intro",
    type: StepType.PARAGRAPHS,
    content: {
      title: "Let's Practice Breathing",
      subtitle: "A moment to center yourself",
      paragraphs: [
        "Breathing exercises are powerful tools for managing anxiety and stress.",
        "We'll guide you through a technique that works best for your current needs."
      ]
    },
    nextStepId: "select_breathing_technique"
  },

  SELECT_BREATHING_TECHNIQUE: {
    id: "select_breathing_technique",
    type: StepType.OPTIONS,
    content: {
      label: "Which type of breathing exercise would you like to try?",
      key: "breathingTechnique",
      mode: SelectMode.SINGLE,
      options: [
        {
          value: BreathingTechniques.BOX_BREATHING,
          label: "Box Breathing",
          description: "Equal rhythm breathing for focus and calm"
        },
        {
          value: BreathingTechniques.FOUR_SEVEN_EIGHT,
          label: "4-7-8 Breathing",
          description: "Powerful technique for anxiety relief"
        },
        {
          value: BreathingTechniques.BELLY_BREATHING,
          label: "Belly Breathing",
          description: "Deep, relaxing diaphragmatic breathing"
        }
      ]
    },
    nextStepId: "breathing_exercise_session"
  },

  BREATHING_EXERCISE_SESSION: {
    id: "breathing_exercise_session",
    type: StepType.ACTION,
    content: {
      prompt: "Ready to begin your breathing exercise?",
      primary: {
        label: "Start Breathing Exercise",
        nextStepId: "breathing_reflection"
      },
      secondary: {
        label: "Skip for Now",
        nextStepId: "continue_session"
      }
    }
  },

  BREATHING_REFLECTION: {
    id: "breathing_reflection",
    type: StepType.USER_INPUT,
    content: {
      label: "How do you feel after the breathing exercise?",
      key: "breathingReflection",
      placeholder: "Notice any changes in your body, mind, or emotions...",
      hint: "Take a moment to observe without judgment"
    },
    nextStepId: "continue_session"
  }
};
```

### 4.2 Crisis Intervention Integration

**Enhancement**: `src/domains/cbt-modules/modules/crisis.ts`

```typescript
export const CRISIS_BREATHING_PROTOCOL = {
  immediate_intervention: {
    technique: BreathingTechniques.FOUR_SEVEN_EIGHT,
    duration: 120, // Short duration for crisis
    maxCycles: 4,
    instructions: [
      "You're safe. Focus only on breathing.",
      "We'll breathe together, slowly.",
      "In for 4... hold for 7... out for 8..."
    ],
    followUp: "grounding_techniques"
  },

  panic_attack_protocol: {
    technique: BreathingTechniques.BOX_BREATHING,
    duration: 300,
    adaptiveInstructions: true, // Adjust based on user response
    safetyReminders: [
      "This feeling will pass",
      "You are in control",
      "Focus only on your breath"
    ]
  }
};
```

## Phase 5: Advanced Features

### 5.1 Personalized Breathing Recommendations

**Location**: `src/domains/breathing-exercises/breathing-recommendation-engine.ts`

```typescript
export class BreathingRecommendationEngine {
  static getRecommendation(context: {
    currentMood?: number;
    stressLevel?: number;
    sessionContext?: string;
    timeOfDay?: string;
    userPreferences?: BreathingTechniques[];
    pastEffectiveness?: Record<string, number>;
  }): {
    technique: BreathingTechniques;
    duration: number;
    reason: string;
  } {
    // Algorithm to select optimal breathing exercise
    // Based on user context, preferences, and historical effectiveness
  }

  static getEmergencyTechnique(severity: "mild" | "moderate" | "severe") {
    const emergencyTechniques = {
      mild: BreathingTechniques.BELLY_BREATHING,
      moderate: BreathingTechniques.BOX_BREATHING,
      severe: BreathingTechniques.FOUR_SEVEN_EIGHT
    };
    return emergencyTechniques[severity];
  }
}
```

### 5.2 Breathing Exercise Analytics

**Location**: `src/domains/breathing-exercises/breathing-analytics.ts`

**Analytics Features**:
- Most effective techniques for user
- Optimal session duration analysis
- Context-effectiveness correlation
- Mood improvement metrics
- Progress toward breathing goals
- Streak tracking and motivational insights

### 5.3 Integration with Mood Tracking

```typescript
// Cross-system integration
export const BreathingMoodIntegration = {
  trackMoodChange: async (breathingSessionId: string) => {
    const session = await getBreathingSession(breathingSessionId);
    if (session.preMoodRating && session.postMoodRating) {
      const improvement = session.postMoodRating - session.preMoodRating;
      await logMoodImprovement({
        technique: session.technique,
        improvement,
        context: session.context
      });
    }
  },

  suggestBreathingForMood: (currentMood: number) => {
    const techniques = {
      veryLow: BreathingTechniques.BELLY_BREATHING,   // Gentle, supportive
      low: BreathingTechniques.EXTENDED_EXHALE,       // Calming
      neutral: BreathingTechniques.COHERENT,          // Balancing
      good: BreathingTechniques.BOX_BREATHING,        // Energizing
      veryGood: BreathingTechniques.TRIANGLE          // Maintaining
    };
    return techniques[getMoodCategory(currentMood)];
  }
};
```

## Phase 6: Mobile & Accessibility Features

### 6.1 Mobile Optimization

- **Haptic Feedback**: Gentle vibrations to guide breathing rhythm
- **Screen Sleep Prevention**: Keep screen active during exercises
- **Landscape Mode**: Optimal viewing for breathing animations
- **Voice Guidance**: Optional audio instructions
- **Background Mode**: Continue exercises when app is backgrounded

### 6.2 Accessibility Features

- **Screen Reader Support**: Full ARIA labels and descriptions
- **High Contrast Mode**: Enhanced visibility for breathing guides
- **Motion Sensitivity**: Alternative static guides for motion-sensitive users
- **Font Size Scaling**: Adjustable text size for instructions
- **Keyboard Navigation**: Full keyboard accessibility

### 6.3 Customization Options

- **Animation Speed**: Adjustable animation timing
- **Visual Themes**: Different breathing guide styles
- **Sound Options**: Nature sounds, music, or silence
- **Instruction Preferences**: Text, audio, or both
- **Session Length**: Flexible duration options

## Implementation Timeline

### Week 1-2: Foundation
- Create breathing exercise types and schemas
- Implement basic breathing technique configurations
- Build core breathing session components

### Week 3-4: UI Components
- Develop guided breathing interface with animations
- Create exercise selection and customization
- Implement progress tracking dashboard

### Week 5-6: CBT Integration
- Integrate breathing exercises with CBT modules
- Enhance anxiety and mindfulness modules
- Implement session flow integration

### Week 7-8: Advanced Features
- Build recommendation engine
- Implement crisis intervention protocols
- Create analytics and insights system

### Week 9-10: Polish & Optimization
- Mobile optimization and accessibility
- Performance optimization
- User testing and refinement

## Technical Considerations

### Performance
- Efficient animation rendering
- Background session management
- Memory optimization for long sessions
- Battery usage optimization

### User Experience
- Minimal loading times
- Smooth animations at 60fps
- Intuitive gesture controls
- Clear progress indicators

### Integration Points
- Seamless CBT module integration
- Mood tracking correlation
- Crisis intervention system
- Session flow architecture
- Analytics and reporting

### Privacy & Security
- Local storage of session data
- Optional cloud sync for progress
- Anonymized effectiveness data
- User control over data sharing

This comprehensive breathing exercises system will provide evidence-based interventions while maintaining seamless integration with Innuora's existing therapeutic architecture.