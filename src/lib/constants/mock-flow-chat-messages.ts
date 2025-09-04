import { ChatMessage, MessageType } from "@/types/flow-chat-messages.types";
import { SelectMode } from "@/types/flow-session.types";

export const mockChatMessages: ChatMessage[] = [
  // TEXT message - simple welcome
  {
    id: "msg-001",
    type: MessageType.TEXT,
    content: "Welcome to your personal growth journey! I'm here to guide you through this session.",
    flowStepId: "welcome-step",
    timestamp: Date.now() - 300000, // 5 minutes ago
  },

  // PARAGRAPHS message - structured content with multiple paragraphs
  {
    id: "msg-002",
    type: MessageType.PARAGRAPHS,
    content: {
      title: "Understanding Your Journey",
      subtitle: "Let's explore what brought you here today",
      paragraphs: [
        "Personal growth is a continuous process that requires both self-reflection and actionable steps.",
        "Throughout this session, we'll explore your current mindset, identify areas for improvement, and create a plan moving forward.",
        "Remember, there are no wrong answers - only opportunities to learn more about yourself.",
      ],
      buttonText: "I'm ready to begin",
      manualAdvance: true,
    },
    flowStepId: "intro-paragraphs",
    timestamp: Date.now() - 280000,
  },

  // USER_INPUT message - text input request
  {
    id: "msg-003",
    type: MessageType.USER_INPUT,
    content: {
      label: "What's your primary goal for today?",
      key: "primary_goal",
      placeholder: "e.g., overcome anxiety, improve confidence, find clarity...",
      hint: "Be as specific or general as feels comfortable to you",
      charLimit: 500,
    },
    flowStepId: "goal-input",
    timestamp: Date.now() - 260000,
  },

  // USER_MESSAGE - user's actual response
  {
    id: "msg-004",
    type: MessageType.USER_MESSAGE,
    content:
      "I want to build more confidence in my professional life. I often second-guess myself in meetings and struggle to speak up with my ideas.",
    timestamp: Date.now() - 240000,
  },

  // OPTIONS message - single select
  {
    id: "msg-005",
    type: MessageType.OPTIONS,
    content: {
      label: "How would you rate your current confidence level in professional settings?",
      key: "confidence_level",
      mode: SelectMode.SINGLE,
      options: [
        { label: "Very Low", value: "very_low", description: "I rarely speak up or share ideas" },
        { label: "Low", value: "low", description: "I sometimes contribute but hold back often" },
        { label: "Moderate", value: "moderate", description: "I participate but could be more assertive" },
        { label: "High", value: "high", description: "I'm usually comfortable sharing my thoughts" },
        { label: "Very High", value: "very_high", description: "I confidently express myself in most situations" },
      ],
      hint: "Choose the option that best reflects your typical experience",
    },
    flowStepId: "confidence-rating",
    timestamp: Date.now() - 220000,
  },

  // USER_MESSAGE - user's selection (could be stored differently in real app)
  {
    id: "msg-006",
    type: MessageType.USER_MESSAGE,
    content: "Low - I sometimes contribute but hold back often",
    timestamp: Date.now() - 200000,
  },

  // OPTIONS message - multiple select variant
  {
    id: "msg-007",
    type: MessageType.OPTIONS,
    content: {
      label: "Which situations make you feel least confident? (Select all that apply)",
      key: "challenging_situations",
      mode: SelectMode.MULTIPLE,
      options: [
        { label: "Speaking in large meetings", value: "large_meetings" },
        { label: "Presenting to leadership", value: "leadership_presentations" },
        { label: "Disagreeing with colleagues", value: "disagreements" },
        { label: "Sharing new ideas", value: "new_ideas" },
        { label: "Asking for help", value: "asking_help" },
        { label: "Giving feedback", value: "giving_feedback" },
        { label: "Networking events", value: "networking" },
      ],
      maxSelected: 5,
      hint: "Select up to 5 situations that resonate with you",
    },
    flowStepId: "challenging-situations",
    timestamp: Date.now() - 180000,
  },

  // USER_MESSAGE - multiple selections
  {
    id: "msg-008",
    type: MessageType.USER_MESSAGE,
    content: ["Speaking in large meetings", "Sharing new ideas", "Disagreeing with colleagues"],
    timestamp: Date.now() - 160000,
  },

  // REFLECTION message - AI processing/thinking
  {
    id: "msg-009",
    type: MessageType.REFLECTION,
    content: {
      title: "Processing your responses...",
      reflection:
        "Based on your input about confidence in professional settings, I can see patterns around self-expression and assertiveness. You've identified specific scenarios where this shows up most - large meetings, sharing ideas, and handling disagreements. This gives us concrete areas to work on together.",
    },
    timestamp: Date.now() - 140000,
  },

  // ACTION message - decision point
  {
    id: "msg-010",
    type: MessageType.ACTION,
    content: {
      prompt:
        "I'd like to explore this further with you. Would you prefer to dive deep into one specific scenario, or would you like to work on general confidence-building techniques first?",
      primary: {
        label: "Focus on a specific scenario",
        nextStepId: "scenario-deep-dive",
      },
      secondary: {
        label: "Work on general techniques",
        nextStepId: "general-techniques",
      },
    },
    flowStepId: "approach-choice",
    timestamp: Date.now() - 120000,
  },

  // USER_MESSAGE - user chose an action
  {
    id: "msg-011",
    type: MessageType.USER_MESSAGE,
    content: "Focus on a specific scenario",
    timestamp: Date.now() - 100000,
  },

  // SYSTEM message - internal processing
  // {
  //   id: "msg-012",
  //   type: MessageType.SYSTEM,
  //   content: {
  //     actions: [{ type: "callback" }, { type: "reset_session" }],
  //   },
  //   flowStepId: "system-routing",
  //   timestamp: Date.now() - 95000,
  // },

  // TEXT message - follow-up based on choice
  {
    id: "msg-013",
    type: MessageType.TEXT,
    content:
      "Great choice! Let's focus on the 'speaking in large meetings' scenario since that was one you mentioned. I'll guide you through a detailed exploration of this situation.",
    flowStepId: "scenario-intro",
    timestamp: Date.now() - 80000,
  },

  // USER_INPUT message - detailed exploration
  {
    id: "msg-014",
    type: MessageType.USER_INPUT,
    content: {
      label: "Describe a recent meeting where you held back from speaking up",
      key: "meeting_scenario",
      placeholder: "What was the context? What did you want to say? What stopped you?",
      hint: "Include as much detail as feels comfortable - the more context, the better I can help",
      charLimit: 1000,
    },
    flowStepId: "scenario-detail",
    timestamp: Date.now() - 60000,
  },

  // USER_MESSAGE - detailed user response
  {
    id: "msg-015",
    type: MessageType.USER_MESSAGE,
    content:
      "Last week in our quarterly planning meeting, I had an idea about improving our client onboarding process. About 15 people were there including our VP. I kept thinking 'what if it's not a good idea?' and 'everyone else seems more experienced.' By the time I worked up the courage, the conversation had moved on. I felt frustrated with myself afterward.",
    timestamp: Date.now() - 40000,
  },

  // REFLECTION message - with error handling example
  {
    id: "msg-016",
    type: MessageType.REFLECTION,
    content: {
      title: "Analyzing your experience",
      reflection:
        "I can see several key elements in your story: you had a valuable idea, the setting felt high-stakes with senior leadership present, and your inner critic created doubt ('what if it's not good?'). The timing aspect - waiting too long - is common when we're battling self-doubt. Your frustration afterward shows you recognize the missed opportunity.",
      error: undefined, // No error in this case
    },
    timestamp: Date.now() - 20000,
  },

  // FLOW_END message - session completion
  {
    id: "msg-017",
    type: MessageType.FLOW_END,
    content: {
      title: "Session Complete",
      message:
        "You've made great progress today in identifying your confidence patterns and exploring specific scenarios. Remember, building confidence is a practice - be patient and kind with yourself as you implement these new strategies.",
      primaryAction: "Continue to next session",
      secondaryAction: "Review session summary",
      shouldUpdateMirSummary: true,
    },
    flowStepId: "session-end",
    timestamp: Date.now(),
  },
];
