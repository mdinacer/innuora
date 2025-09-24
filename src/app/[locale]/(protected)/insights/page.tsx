import { Metadata } from "next";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import IntegratedInsightsPage from "@/components/insights/integrated-insights-page";
import { APP_CONFIG } from "@/config/app";
import { AdvancedInsightsProfile } from "@/domains/insights/advanced-insights.types";

export const metadata: Metadata = {
  title: `Your Psychological Insights - ${APP_CONFIG.name}`,
  description: `Discover hidden patterns in how your mind works with ${APP_CONFIG.name}'s AI-powered psychological insights.`,
};

// Mock data showcasing advanced AI insights - will be replaced with real data fetching
// const getAdvancedMockInsights = (): AdvancedInsightsProfile => {
//   return {
//     userId: "user-123",
//     analysisDate: new Date(),

//     // Emotional triggers that will surprise users
//     emotionalTriggers: [
//       {
//         trigger: "Sunday evening",
//         triggerType: "situation",
//         emotionalResponse: "intensity_spike",
//         confidence: 89,
//         occurrences: 7,
//         averageDelay: 1,
//         context:
//           "Your emotional intensity consistently rises on Sunday evenings, likely related to anticipatory work anxiety - even when you're not discussing work directly",
//         lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
//       },
//       {
//         trigger: "my mother",
//         triggerType: "person",
//         emotionalResponse: "avoidance_behavior",
//         confidence: 84,
//         occurrences: 12,
//         averageDelay: 2,
//         context:
//           "Within 2-3 exchanges of mentioning your mother, you consistently redirect conversations to safer topics, suggesting unconscious emotional protection",
//         lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//       },
//       {
//         trigger: "good enough",
//         triggerType: "phrase",
//         emotionalResponse: "crisis_elevation",
//         confidence: 92,
//         occurrences: 15,
//         averageDelay: 1,
//         context:
//           "The phrase 'good enough' triggers immediate stress responses, revealing a deep perfectionist wound around adequacy",
//         lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
//       },
//     ],

//     // Behavioral wiring patterns
//     behavioralWiring: [
//       {
//         id: "perfectionism-avoidance",
//         pattern: "perfectionism → avoidance",
//         coreBeliefTrigger: "I must be perfect or I'm worthless",
//         automaticBehavior: "avoids challenging tasks or conversations",
//         frequency: 87,
//         confidence: 94,
//         unconsciousIndicator: true,
//         insight:
//           "Your perfectionist beliefs automatically trigger avoidance behaviors without conscious awareness. This happens 87% of the time when perfectionist thoughts arise - you likely don't realize this connection.",
//         sessions: ["session-1", "session-3", "session-7", "session-12"],
//       },
//       {
//         id: "criticism-shutdown",
//         pattern: "perceived criticism → emotional shutdown",
//         coreBeliefTrigger: "I can't handle being judged",
//         automaticBehavior: "becomes emotionally distant and analytical",
//         frequency: 78,
//         confidence: 88,
//         unconsciousIndicator: true,
//         insight:
//           "When you sense even mild criticism, you automatically shift into 'analytical mode' as emotional protection. This happens so consistently it seems to be an unconscious defense mechanism.",
//         sessions: ["session-2", "session-5", "session-9"],
//       },
//     ],

//     // Avoidance patterns
//     avoidancePatterns: [
//       {
//         avoidedTopic: "family dynamics",
//         deflectionMethods: ["shifts to work stress", "asks about CBT techniques", "intellectualizes emotions"],
//         frequency: 11,
//         lastAvoidance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
//         totalAvoidances: 23,
//         insightGenerated:
//           "You've developed sophisticated ways to redirect conversations away from family relationships. This suggests these topics carry significant emotional weight that you're unconsciously protecting yourself from.",
//         emotionalContext: "anxiety and deep sadness emerge when family topics become too real",
//       },
//     ],

//     // Recovery signatures
//     recoverySignatures: [
//       {
//         recoveryTrigger: "values-based reflection",
//         effectiveness: 82,
//         averageRecoveryTime: 4,
//         preferredModule: "values_clarification",
//         unconsciousUse: true,
//         personalizedInsight:
//           "You naturally shift to thinking about your values when overwhelmed - this happens so automatically you might not realize it's your most effective unconscious coping strategy",
//       },
//       {
//         recoveryTrigger: "connecting to bigger purpose",
//         effectiveness: 76,
//         averageRecoveryTime: 5,
//         preferredModule: "meaning_making",
//         unconsciousUse: false,
//         personalizedInsight:
//           "When you consciously connect your struggles to your larger purpose, your emotional intensity drops significantly within 5 exchanges",
//       },
//     ],

//     // Progress blind spots
//     progressBlindSpots: [
//       {
//         area: "self-compassion in perfectionist moments",
//         oldPattern: "immediate harsh self-criticism when making any mistake",
//         newPattern: "notices perfectionist thoughts and responds with curiosity instead of judgment",
//         improvementPercentage: 73,
//         timeframe: "over the past 3 months",
//         userAwareness: "unaware",
//         aiGeneratedCelebration:
//           "You've developed a remarkably kinder inner voice without even realizing it. Your self-talk has become 73% more compassionate - this is profound growth that deserves recognition.",
//       },
//       {
//         area: "emotional regulation under pressure",
//         oldPattern: "would spiral into crisis mode within minutes of stress",
//         newPattern: "maintains emotional stability and problem-solving capacity even when stressed",
//         improvementPercentage: 61,
//         timeframe: "over the past 2 months",
//         userAwareness: "somewhat_aware",
//         aiGeneratedCelebration:
//           "Your nervous system has learned to stay regulated under pressure. You're handling stress 61% better than before - your body and mind are both getting stronger.",
//       },
//     ],

//     // Emotional wiring
//     emotionalWiring: [
//       {
//         beliefStatePattern: "When I believe I've disappointed someone, I feel shame and immediately withdraw",
//         automaticEmotionalRule: "disappointment = shame = isolation",
//         frequency: 91,
//         intensity: "strong",
//         bypass: true,
//         therapeuticImplication:
//           "This automatic sequence happens so fast you might experience it as one emotion, but it's actually three distinct responses that can be interrupted",
//       },
//     ],

//     // Meta-insights
//     overallPattern:
//       "Unconscious perfectionism drives most of your emotional responses, creating automatic avoidance and self-protection patterns",
//     biggestBlindSpot:
//       "You don't realize how much your perfectionist beliefs control your daily emotional responses and decisions",
//     hiddenStrength:
//       "Your values-based thinking is your most powerful unconscious coping mechanism - you naturally find meaning in difficulty",
//     unconsciousWisdom:
//       "You automatically protect your energy by avoiding emotionally overwhelming topics until you're ready to process them",

//     // Meta metrics
//     dataPointsAnalyzed: 47,
//     analysisConfidence: 91,
//     recommendedNextInsights: [
//       "Explore the connection between family perfectionist expectations and current work anxiety",
//       "Investigate why Sunday evenings specifically trigger anticipatory stress",
//       "Discover what 'good enough' means in your family system and how it shaped your self-worth",
//     ],
//   };
// };

const getAdvancedMockInsights = (): AdvancedInsightsProfile => {
  return {
    userId: "user-123",
    analysisDate: new Date(),

    // Core discoveries
    emotionalTriggers: [
      {
        trigger: "Sunday evening",
        triggerType: "situation",
        emotionalResponse: "intensity_spike",
        confidence: 91,
        occurrences: 12,
        averageDelay: 1,
        context:
          "Your emotional intensity consistently rises on Sunday evenings, often linked to anticipatory work anxiety and rumination over tasks. Even casual mentions of plans trigger subtle tension.",
        lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        trigger: "my mother",
        triggerType: "person",
        emotionalResponse: "avoidance_behavior",
        confidence: 87,
        occurrences: 14,
        averageDelay: 2,
        context:
          "References to your mother reliably provoke avoidance or topic redirection. This reflects unconscious protection against unresolved family expectations and vulnerability.",
        lastSeen: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        trigger: "good enough",
        triggerType: "phrase",
        emotionalResponse: "crisis_elevation",
        confidence: 94,
        occurrences: 19,
        averageDelay: 1,
        context:
          "The phrase 'good enough' triggers immediate stress responses, exposing deep perfectionist wounds around adequacy and self-worth.",
        lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        trigger: "deadline approaching",
        triggerType: "situation",
        emotionalResponse: "intensity_spike",
        confidence: 85,
        occurrences: 9,
        averageDelay: 0,
        context:
          "As deadlines near, you display heightened vigilance and over-preparation behaviors. This is tied to fear of failure and anticipatory stress.",
        lastSeen: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],

    behavioralWiring: [
      {
        id: "perfectionism-avoidance",
        pattern: "perfectionism → avoidance → overplanning",
        coreBeliefTrigger: "I must be perfect or I'm worthless",
        automaticBehavior:
          "avoids challenging tasks, overprepares, and procrastinates on emotionally difficult conversations",
        frequency: 88,
        confidence: 95,
        unconsciousIndicator: true,
        insight:
          "Your perfectionist beliefs automatically trigger a cascade of avoidance and over-preparation behaviors, rarely noticed until after they occur.",
        sessions: ["session-1", "session-3", "session-7", "session-12", "session-14"],
      },
      {
        id: "criticism-shutdown",
        pattern: "perceived criticism → emotional shutdown → analytical detachment",
        coreBeliefTrigger: "I can't handle being judged",
        automaticBehavior: "becomes emotionally distant, over-analytical, and disengages from vulnerable topics",
        frequency: 79,
        confidence: 90,
        unconsciousIndicator: true,
        insight:
          "Even subtle critique activates this multi-layered defensive pattern. Awareness allows you to consciously override the detachment before it escalates.",
        sessions: ["session-2", "session-5", "session-9", "session-11"],
      },
      {
        id: "self-worth-trigger",
        pattern: "perceived underappreciation → self-critique → withdrawal",
        coreBeliefTrigger: "I am invisible unless I achieve",
        automaticBehavior:
          "reduces communication, internalizes perceived slights, and engages in self-critical rumination",
        frequency: 70,
        confidence: 88,
        unconsciousIndicator: true,
        insight:
          "Your internalized belief about needing external validation drives subtle withdrawal patterns that reinforce perfectionism.",
        sessions: ["session-4", "session-8", "session-10"],
      },
    ],

    avoidancePatterns: [
      {
        avoidedTopic: "family dynamics",
        deflectionMethods: ["intellectualizes emotions", "shifts to work stress", "asks for cognitive exercises"],
        frequency: 13,
        lastAvoidance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalAvoidances: 27,
        insightGenerated:
          "Your avoidance strategies around family topics show both protective instinct and potential stagnation. Recognizing the avoidance opens pathways to conscious engagement.",
        emotionalContext: "anxiety, guilt, subtle shame, and emotional withdrawal",
      },
      {
        avoidedTopic: "career feedback",
        deflectionMethods: ["focus on metrics", "jokes to lighten mood", "switch to technical details"],
        frequency: 8,
        lastAvoidance: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        totalAvoidances: 15,
        insightGenerated:
          "Avoidance in career-related feedback reflects fear of judgment and reinforces internal pressure to overperform.",
        emotionalContext: "anticipatory stress and self-critique",
      },
    ],

    recoverySignatures: [
      {
        recoveryTrigger: "values-based reflection",
        effectiveness: 84,
        averageRecoveryTime: 3,
        preferredModule: "values_clarification",
        unconsciousUse: true,
        personalizedInsight:
          "Automatically connecting to your core values helps reset emotional intensity and recalibrate decision-making.",
      },
      {
        recoveryTrigger: "meaning-making exercises",
        effectiveness: 79,
        averageRecoveryTime: 5,
        preferredModule: "meaning_making",
        unconsciousUse: false,
        personalizedInsight:
          "Framing challenges in terms of larger purpose reduces stress intensity and helps shift focus from self-critique to growth.",
      },
      {
        recoveryTrigger: "micro-mindfulness pauses",
        effectiveness: 71,
        averageRecoveryTime: 2,
        preferredModule: "mindfulness_micro",
        unconsciousUse: false,
        personalizedInsight:
          "Short, structured mindfulness breaks stabilize emotional fluctuations and increase awareness of automatic patterns.",
      },
    ],

    progressBlindSpots: [
      {
        area: "self-compassion in perfectionist moments",
        oldPattern: "immediate harsh self-criticism when making any mistake",
        newPattern: "notices perfectionist thoughts and responds with curiosity and self-kindness",
        improvementPercentage: 75,
        timeframe: "over the past 3 months",
        userAwareness: "somewhat_aware",
        aiGeneratedCelebration:
          "Your inner voice has become markedly kinder, enhancing resilience and long-term emotional stability.",
      },
      {
        area: "emotional regulation under pressure",
        oldPattern: "would spiral into crisis mode within minutes of stress",
        newPattern: "maintains emotional equilibrium and problem-solving capacity under pressure",
        improvementPercentage: 63,
        timeframe: "over the past 2 months",
        userAwareness: "aware",
        aiGeneratedCelebration:
          "Your nervous system is recalibrating. You're responding to stress more effectively and sustaining focus despite internal tension.",
      },
      {
        area: "adaptive social calibration",
        oldPattern: "reactive defensiveness during perceived criticism",
        newPattern: "pauses, reflects, and responds intentionally, reducing interpersonal tension",
        improvementPercentage: 58,
        timeframe: "over the past month",
        userAwareness: "somewhat_aware",
        aiGeneratedCelebration:
          "You’re gradually breaking reactive cycles and establishing conscious engagement patterns with others.",
      },
    ],

    emotionalWiring: [
      {
        beliefStatePattern:
          "When I perceive a lack of recognition, shame and self-doubt activate sequentially, leading to withdrawal",
        automaticEmotionalRule: "perceived underappreciation → shame → self-critique → isolation",
        frequency: 89,
        intensity: "strong",
        bypass: true,
        therapeuticImplication:
          "This sequence can be slowed or interrupted by conscious awareness, allowing choice in emotional response.",
      },
    ],

    // Meta-insights
    overallPattern:
      "Complex perfectionist and self-worth beliefs drive automatic avoidance, hyper-vigilance, and emotional intensity spikes.",
    biggestBlindSpot:
      "The subtlety of your perfectionist beliefs controlling daily emotional responses and choices is largely unconscious.",
    hiddenStrength:
      "Values-based reflection and meaning-making provide powerful, largely automatic resilience mechanisms.",
    unconsciousWisdom:
      "Your mind conserves emotional energy by selectively avoiding overwhelming topics until you're prepared to engage consciously.",

    // Confidence metrics
    dataPointsAnalyzed: 62,
    analysisConfidence: 93,
    recommendedNextInsights: [
      "Explore family expectations and their influence on current perfectionism",
      "Investigate triggers behind Sunday evening anticipatory anxiety",
      "Map phrases like 'good enough' and their historical meaning in family context",
      "Examine hyper-vigilance patterns near deadlines",
    ],
  };
};

export default async function InsightsPage() {
  // Ensure user is authenticated
  await requireCurrentUser();

  // Get advanced mock insights data (will be replaced with real data fetching)
  const insights = getAdvancedMockInsights();

  return <IntegratedInsightsPage insights={insights} />;
}
