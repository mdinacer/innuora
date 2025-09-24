import {
  ActionableInsight,
  ActionInstruction,
  ActionTemplate,
  BehavioralExperiment,
  CBTTechniqueMapping,
} from "./actionable-insights.types";
import {
  AvoidancePattern,
  BehavioralWiring,
  EmotionalTrigger,
  ProgressBlindSpot,
  RecoverySignature,
} from "./advanced-insights.types";

export class InsightsActionEngine {
  /**
   * Generate personalized actionable insights from psychological insights
   */
  static generateActionableInsights(
    emotionalTriggers: EmotionalTrigger[],
    behavioralWiring: BehavioralWiring[],
    avoidancePatterns: AvoidancePattern[],
    recoverySignatures: RecoverySignature[],
    progressBlindSpots: ProgressBlindSpot[]
  ): ActionableInsight[] {
    const actions: ActionableInsight[] = [];

    // Generate actions for emotional triggers
    emotionalTriggers.forEach((trigger) => {
      actions.push(...this.createTriggerActions(trigger));
    });

    // Generate actions for behavioral patterns
    behavioralWiring.forEach((wiring) => {
      actions.push(...this.createBehavioralActions(wiring));
    });

    // Generate actions for avoidance patterns
    avoidancePatterns.forEach((pattern) => {
      actions.push(...this.createAvoidanceActions(pattern));
    });

    // Generate actions for recovery signatures
    recoverySignatures.forEach((signature) => {
      actions.push(...this.createRecoveryActions(signature));
    });

    // Generate actions for progress blind spots
    progressBlindSpots.forEach((blindspot) => {
      actions.push(...this.createProgressActions(blindspot));
    });

    return actions.sort((a, b) => this.prioritizeActions(a, b));
  }

  private static createTriggerActions(trigger: EmotionalTrigger): ActionableInsight[] {
    const actions: ActionableInsight[] = [];

    // Awareness practice for unconscious triggers
    actions.push({
      id: `trigger-awareness-${trigger.trigger.replace(/\s+/g, "-")}`,
      sourceInsightId: trigger.trigger,
      sourceInsightType: "emotional_trigger",
      title: "Notice Your Trigger Pattern",
      description: `Build awareness of how "${trigger.trigger}" affects your emotional state`,
      actionType: "awareness_practice",
      timeCommitment: "ongoing practice",
      difficulty: "beginner",
      cbtFramework: "mindfulness",
      rationale:
        "Awareness is the first step to breaking automatic emotional patterns. By noticing when this trigger occurs, you gain choice in your response.",
      instructions: [
        {
          step: 1,
          instruction: `Set a gentle reminder to notice when "${trigger.trigger}" comes up`,
          tip: "Use your phone or write a note as a cue",
        },
        {
          step: 2,
          instruction: "When you notice the trigger, pause and take three deep breaths",
          example: "Feel your feet on the ground, notice you're having the trigger response",
        },
        {
          step: 3,
          instruction: "Ask yourself: 'What am I feeling right now? What do I need?'",
          tip: "No judgment, just curiosity about your inner experience",
        },
        {
          step: 4,
          instruction: "Choose your response consciously instead of reacting automatically",
          example: "You might choose to step away, speak up, or simply breathe through it",
        },
      ],
      expectedOutcome:
        "You'll start catching this trigger earlier and responding from choice rather than automatic reaction",
      trackingMetrics: [
        "How quickly you notice the trigger",
        "Emotional intensity before/after awareness",
        "Number of conscious responses vs automatic reactions",
      ],
      burnsReference: "Chapter 15: Mindfulness and Cognitive Therapy",
      isCompleted: false,
    });

    // Cognitive restructuring for trigger thoughts
    if (trigger.emotionalResponse === "intensity_spike") {
      actions.push({
        id: `trigger-restructure-${trigger.trigger.replace(/\s+/g, "-")}`,
        sourceInsightId: trigger.trigger,
        sourceInsightType: "emotional_trigger",
        title: "Challenge Your Trigger Thoughts",
        description: "Question the automatic thoughts that arise when this trigger occurs",
        actionType: "exercise",
        timeCommitment: "10-15 minutes",
        difficulty: "intermediate",
        cbtFramework: "cognitive_restructuring",
        rationale:
          "Triggers often activate distorted thinking patterns. By examining these thoughts, you can reduce their emotional impact.",
        instructions: [
          {
            step: 1,
            instruction: `Next time "${trigger.trigger}" occurs, write down your immediate thoughts`,
            example: "I can't handle this, Everyone will judge me, This always happens to me",
          },
          {
            step: 2,
            instruction: "Identify the thinking distortion in each thought",
            tip: "Look for all-or-nothing thinking, mind reading, fortune telling",
          },
          {
            step: 3,
            instruction: "Write a more balanced, realistic thought",
            example: "This is challenging but I've handled difficult things before",
          },
          {
            step: 4,
            instruction: "Notice how the balanced thought feels different emotionally",
            tip: "Rate your emotional intensity before and after",
          },
        ],
        expectedOutcome:
          "Emotional intensity from this trigger will decrease as you develop more balanced thinking patterns",
        trackingMetrics: [
          "Emotional intensity rating (1-10)",
          "Number of balanced thoughts identified",
          "Time to emotional recovery",
        ],
        burnsReference: "Chapter 4: How to Break Out of a Bad Mood",
        isCompleted: false,
      });
    }

    return actions;
  }

  private static createBehavioralActions(wiring: BehavioralWiring): ActionableInsight[] {
    const actions: ActionableInsight[] = [];

    // Behavioral experiment to test the pattern
    actions.push({
      id: `behavior-experiment-${wiring.id}`,
      sourceInsightId: wiring.id,
      sourceInsightType: "behavioral_wiring",
      title: "Test Your Automatic Pattern",
      description: `Experiment with breaking the "${wiring.pattern}" cycle`,
      actionType: "behavioral_experiment",
      timeCommitment: "20-30 minutes",
      difficulty: "intermediate",
      cbtFramework: "behavioral_activation",
      rationale:
        "By consciously choosing a different behavior, you can discover that your automatic pattern isn't necessary and build new neural pathways.",
      instructions: [
        {
          step: 1,
          instruction: `Identify the next situation where "${wiring.coreBeliefTrigger}" typically activates`,
          example: "Notice when perfectionist thoughts arise about a task",
        },
        {
          step: 2,
          instruction: `Instead of your automatic behavior (${wiring.automaticBehavior}), try a small opposite action`,
          example: "If you usually avoid, spend just 5 minutes engaging with the task",
        },
        {
          step: 3,
          instruction: "Observe what actually happens - not what your mind predicts",
          tip: "Write down the actual results vs your feared outcomes",
        },
        {
          step: 4,
          instruction: "Notice how it feels to act from choice rather than automatic programming",
          example: "Many people feel empowered and surprised by their capability",
        },
      ],
      expectedOutcome: "You'll discover you have more choice and capability than your automatic patterns suggest",
      trackingMetrics: [
        "Anxiety level before/after experiment",
        "Actual outcome vs predicted outcome",
        "Sense of personal agency (1-10)",
      ],
      burnsReference: "Chapter 8: The Pleasure Predicting Sheet",
      isCompleted: false,
    });

    return actions;
  }

  private static createAvoidanceActions(pattern: AvoidancePattern): ActionableInsight[] {
    const actions: ActionableInsight[] = [];

    // Gentle exposure practice
    actions.push({
      id: `avoidance-exposure-${pattern.avoidedTopic.replace(/\s+/g, "-")}`,
      sourceInsightId: pattern.avoidedTopic,
      sourceInsightType: "avoidance_pattern",
      title: "Gentle Approach Practice",
      description: `Gradually approach the topic of "${pattern.avoidedTopic}" in a safe way`,
      actionType: "exercise",
      timeCommitment: "10-15 minutes",
      difficulty: "beginner",
      cbtFramework: "exposure_therapy",
      rationale:
        "Avoidance often makes topics feel more threatening than they are. Gentle exposure helps you discover your strength and reduces the emotional charge.",
      instructions: [
        {
          step: 1,
          instruction: `Find a quiet, private moment to simply think about "${pattern.avoidedTopic}" for 2 minutes`,
          tip: "Set a timer so you know it has an endpoint",
        },
        {
          step: 2,
          instruction: "Notice what feelings and thoughts come up without judging them",
          example: "Anxiety, sadness, anger are all normal responses",
        },
        {
          step: 3,
          instruction: "Breathe deeply and remind yourself: 'I can handle feeling this'",
          tip: "You're not trying to fix anything, just proving you can be with difficult feelings",
        },
        {
          step: 4,
          instruction: "Write one sentence about what came up, then do something nurturing",
          example: "Take a walk, have tea, listen to music - something kind for yourself",
        },
      ],
      expectedOutcome:
        "The topic will gradually feel less overwhelming and you'll trust your ability to handle difficult emotions",
      trackingMetrics: [
        "Emotional intensity when thinking about topic",
        "Time spent before deflecting",
        "Comfort level discussing topic",
      ],
      burnsReference: "Chapter 16: The Anxiety Model",
      isCompleted: false,
    });

    return actions;
  }

  private static createRecoveryActions(signature: RecoverySignature): ActionableInsight[] {
    const actions: ActionableInsight[] = [];

    // Strengthen existing recovery pattern
    actions.push({
      id: `recovery-strengthen-${signature.recoveryTrigger.replace(/\s+/g, "-")}`,
      sourceInsightId: signature.recoveryTrigger,
      sourceInsightType: "recovery_signature",
      title: "Amplify Your Natural Strength",
      description: `Consciously use your natural "${signature.recoveryTrigger}" ability`,
      actionType: "awareness_practice",
      timeCommitment: "2-5 minutes",
      difficulty: "beginner",
      cbtFramework: "values_clarification",
      rationale: signature.personalizedInsight,
      instructions: [
        {
          step: 1,
          instruction: "When you notice emotional distress, remind yourself of your natural recovery ability",
          example: `"I know that ${signature.recoveryTrigger} helps me feel better"`,
        },
        {
          step: 2,
          instruction: "Consciously engage with this recovery method instead of waiting for it to happen automatically",
          tip: "Make it intentional rather than leaving it to chance",
        },
        {
          step: 3,
          instruction: "Notice how quickly and effectively it works when you use it deliberately",
          example: "Track your emotional state before and after",
        },
      ],
      expectedOutcome: `You'll recover from emotional difficulty faster and feel more in control of your well-being`,
      trackingMetrics: [
        "Recovery time when used consciously vs automatically",
        "Effectiveness rating",
        "Frequency of conscious use",
      ],
      isCompleted: false,
    });

    return actions;
  }

  private static createProgressActions(blindspot: ProgressBlindSpot): ActionableInsight[] {
    const actions: ActionableInsight[] = [];

    // Celebration and reinforcement practice
    actions.push({
      id: `progress-celebrate-${blindspot.area.replace(/\s+/g, "-")}`,
      sourceInsightId: blindspot.area,
      sourceInsightType: "progress_blindspot",
      title: "Celebrate Your Hidden Growth",
      description: `Acknowledge and reinforce your progress in "${blindspot.area}"`,
      actionType: "reflection",
      timeCommitment: "10-15 minutes",
      difficulty: "beginner",
      cbtFramework: "cognitive_restructuring",
      rationale:
        "Recognizing progress you can't see builds confidence and motivates continued growth. Your brain needs to consciously register positive changes.",
      instructions: [
        {
          step: 1,
          instruction: "Write down specific examples of your old pattern",
          example: blindspot.oldPattern,
        },
        {
          step: 2,
          instruction: "Write down specific examples of your new pattern",
          example: blindspot.newPattern,
        },
        {
          step: 3,
          instruction: "Appreciate the effort and courage this change required",
          tip: "This didn't happen by accident - you did this",
        },
        {
          step: 4,
          instruction: "Set an intention to continue nurturing this positive change",
          example: "How can you consciously support this new pattern?",
        },
      ],
      expectedOutcome:
        "You'll feel more confident in your ability to grow and change, and the positive pattern will strengthen",
      trackingMetrics: [
        "Self-compassion level",
        "Confidence in ability to change",
        "Frequency of new positive pattern",
      ],
      burnsReference: "Chapter 5: Do-Nothingism",
      isCompleted: false,
    });

    return actions;
  }

  private static prioritizeActions(a: ActionableInsight, b: ActionableInsight): number {
    // Priority order: awareness practices first, then exercises, then experiments
    const typeOrder = {
      awareness_practice: 1,
      exercise: 2,
      behavioral_experiment: 3,
      reflection: 4,
      educational_reading: 5,
    };

    const difficultyOrder = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };

    // Primary sort: action type
    const typeDiff = typeOrder[a.actionType] - typeOrder[b.actionType];
    if (typeDiff !== 0) return typeDiff;

    // Secondary sort: difficulty
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  }

  /**
   * Create CBT technique mappings for different patterns
   */
  static getCBTTechniqueMapping(): CBTTechniqueMapping[] {
    return [
      {
        insightPattern: "perfectionism_avoidance",
        recommendedTechniques: {
          primary: ["behavioral_experiments", "all_or_nothing_restructuring"],
          secondary: ["pleasure_predicting", "cost_benefit_analysis"],
          advanced: ["shame_attacking_exercises"],
        },
        burnsCorrespondence: [
          { technique: "Behavioral Experiments", chapter: "Chapter 8", page: "151-167" },
          { technique: "All-or-Nothing Thinking", chapter: "Chapter 3", page: "42-45" },
        ],
      },
      {
        insightPattern: "emotional_reasoning",
        recommendedTechniques: {
          primary: ["examine_the_evidence", "double_standard_technique"],
          secondary: ["thought_records", "mood_monitoring"],
          advanced: ["cognitive_flooding"],
        },
        burnsCorrespondence: [
          { technique: "Examine the Evidence", chapter: "Chapter 4", page: "94-98" },
          { technique: "Double-Standard Method", chapter: "Chapter 4", page: "102-105" },
        ],
      },
    ];
  }
}
