import { AdvanceMode, SelectMode, StepType } from "@/types/flow-session.types";

export const ONBOARDING_STEP_IDS = {
  WELCOME: "welcome",
  WHAT_TO_EXPECT: "what_to_expect",
  DISPLAY_NAME: "display_name",
  AGE_GROUP: "age_group",
  SELF_CONNECTION_INTRO: "self_connection_intro",
  IDENTITY_CONNECTION: "identity_connection",
  PRESSURE_INTRO: "pressure_intro",
  SOCIAL_PRESSURE: "social_pressure",
  EMOTIONAL_WEIGHT_INTRO: "emotional_weight_intro",
  EMOTIONAL_CONCERNS: "emotional_concerns",
  COPING_INTRO: "coping_intro",
  COPING_MECHANISM: "coping_mechanism",
  ASPIRATION_INTRO: "aspiration_intro",
  EMOTIONAL_ASPIRATIONS: "emotional_aspirations",
  CONFIRM_INPUTS: "confirm_inputs",
  RESET_ONBOARDING_FLOW: "reset_onboarding_flow",
  SYNC_BEFORE_REFLECTION: "sync_before_reflection",
  REFLECTION: "reflection",
  END: "end",
} as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[keyof typeof ONBOARDING_STEP_IDS];

export const ONBOARDING_SESSION_PROPS = {
  [ONBOARDING_STEP_IDS.WELCOME]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.WHAT_TO_EXPECT,
    advancementMode: AdvanceMode.MANUAL,
  },

  [ONBOARDING_STEP_IDS.WHAT_TO_EXPECT]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.DISPLAY_NAME,
    advancementMode: AdvanceMode.MANUAL,
  },

  [ONBOARDING_STEP_IDS.DISPLAY_NAME]: {
    type: StepType.USER_INPUT,
    nextStepId: ONBOARDING_STEP_IDS.AGE_GROUP,
    advancementMode: AdvanceMode.MANUAL,
    content: {
      key: "displayName",
      charLimit: 40,
    },
  },

  [ONBOARDING_STEP_IDS.AGE_GROUP]: {
    type: StepType.OPTIONS,
    nextStepId: ONBOARDING_STEP_IDS.SELF_CONNECTION_INTRO,
    advancementMode: AdvanceMode.MANUAL,
    content: {
      key: "ageGroup",
      mode: SelectMode.SINGLE,
    },
  },

  [ONBOARDING_STEP_IDS.SELF_CONNECTION_INTRO]: {
    type: StepType.PARAGRAPHS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.IDENTITY_CONNECTION,
  },

  [ONBOARDING_STEP_IDS.IDENTITY_CONNECTION]: {
    type: StepType.OPTIONS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.PRESSURE_INTRO,
    content: {
      key: "identityConnection",
      mode: SelectMode.SINGLE,
    },
  },

  [ONBOARDING_STEP_IDS.PRESSURE_INTRO]: {
    type: StepType.PARAGRAPHS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.SOCIAL_PRESSURE,
  },

  [ONBOARDING_STEP_IDS.SOCIAL_PRESSURE]: {
    type: StepType.OPTIONS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.EMOTIONAL_WEIGHT_INTRO,
    content: {
      key: "socialPressureSources",
      mode: SelectMode.MULTIPLE,
      maxSelected: 4,
    },
  },

  [ONBOARDING_STEP_IDS.EMOTIONAL_WEIGHT_INTRO]: {
    type: StepType.PARAGRAPHS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.EMOTIONAL_CONCERNS,
  },

  [ONBOARDING_STEP_IDS.EMOTIONAL_CONCERNS]: {
    type: StepType.OPTIONS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.COPING_INTRO,
    content: {
      key: "emotionalConcerns",
      mode: SelectMode.MULTIPLE,
      maxSelected: 4,
    },
  },

  [ONBOARDING_STEP_IDS.COPING_INTRO]: {
    type: StepType.PARAGRAPHS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.COPING_MECHANISM,
  },

  [ONBOARDING_STEP_IDS.COPING_MECHANISM]: {
    type: StepType.OPTIONS,
    advancementMode: AdvanceMode.MANUAL,
    nextStepId: ONBOARDING_STEP_IDS.ASPIRATION_INTRO,
    content: {
      key: "copingMechanism",
      mode: SelectMode.SINGLE,
    },
  },

  [ONBOARDING_STEP_IDS.ASPIRATION_INTRO]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.EMOTIONAL_ASPIRATIONS,
    advancementMode: AdvanceMode.MANUAL,
  },

  [ONBOARDING_STEP_IDS.EMOTIONAL_ASPIRATIONS]: {
    type: StepType.OPTIONS,
    nextStepId: ONBOARDING_STEP_IDS.CONFIRM_INPUTS, // If this becomes a fixed step, add it to the ID enum.
    advancementMode: AdvanceMode.MANUAL,
    content: {
      key: "emotionalAspirations",
      mode: SelectMode.MULTIPLE,
      maxSelected: 3,
    },
  },

  [ONBOARDING_STEP_IDS.CONFIRM_INPUTS]: {
    type: StepType.ACTION,
    advancementMode: AdvanceMode.MANUAL,
  },

  // [ONBOARDING_STEP_IDS.RESET_ONBOARDING_FLOW]: {
  //   type: StepType.SYSTEM,
  //   advancementMode: AdvanceMode.MANUAL,
  //   autoAdvanceDelay: 800,
  //   nextStepId: ONBOARDING_STEP_IDS.WELCOME,
  //   content: {
  //     actions: [
  //       {
  //         type: "reset_flow",
  //         resetInputs: true,
  //         resetMessages: true,
  //         toStepId: ONBOARDING_STEP_IDS.WELCOME,
  //       },
  //     ],
  //   },
  // } ,

  // [ONBOARDING_STEP_IDS.SYNC_BEFORE_REFLECTION]: {
  //   type: StepType.SYSTEM,
  //   advancementMode: AdvanceMode.AUTO,
  //   autoAdvanceDelay: 600,
  //   nextStepId: ONBOARDING_STEP_IDS.REFLECTION,
  //   content: {
  //     actions: [
  //       {
  //         type: "callback",
  //         name: "onSyncData",
  //       },
  //     ],
  //   },
  // } ,

  // [ONBOARDING_STEP_IDS.REFLECTION]: {
  //   type: StepType.REFLECTION,
  //   nextStepId: ONBOARDING_STEP_IDS.END,
  //   advancementMode: AdvanceMode.AWAIT,
  //   content: {
  //     mergeMode: "replace",
  //     includeMirSummary: false,
  //     includeChatSummary: false,
  //     mergeTarget: "session_summary",
  //   },
  // } ,

  [ONBOARDING_STEP_IDS.END]: {
    type: StepType.FLOW_END,
  },
};
