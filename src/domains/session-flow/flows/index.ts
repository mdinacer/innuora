import { SelectMode, StepType } from "@/types/flow-session.types";

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
  END: "end",
} as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[keyof typeof ONBOARDING_STEP_IDS];

export const ONBOARDING_SESSION_PROPS = {
  [ONBOARDING_STEP_IDS.WELCOME]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.WHAT_TO_EXPECT,
  },

  [ONBOARDING_STEP_IDS.WHAT_TO_EXPECT]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.DISPLAY_NAME,
  },

  [ONBOARDING_STEP_IDS.DISPLAY_NAME]: {
    type: StepType.USER_INPUT,
    nextStepId: ONBOARDING_STEP_IDS.AGE_GROUP,
    content: {
      key: "displayName",
      charLimit: 40,
    },
  },

  [ONBOARDING_STEP_IDS.AGE_GROUP]: {
    type: StepType.USER_SELECT,
    nextStepId: ONBOARDING_STEP_IDS.SELF_CONNECTION_INTRO,
    content: {
      key: "ageGroup",
      mode: SelectMode.SINGLE,
    },
  },

  [ONBOARDING_STEP_IDS.SELF_CONNECTION_INTRO]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.IDENTITY_CONNECTION,
  },

  [ONBOARDING_STEP_IDS.IDENTITY_CONNECTION]: {
    type: StepType.USER_SELECT,
    nextStepId: ONBOARDING_STEP_IDS.PRESSURE_INTRO,
    content: {
      key: "identityConnection",
      mode: SelectMode.SINGLE,
    },
  },

  [ONBOARDING_STEP_IDS.PRESSURE_INTRO]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.SOCIAL_PRESSURE,
  },

  [ONBOARDING_STEP_IDS.SOCIAL_PRESSURE]: {
    type: StepType.USER_SELECT,
    nextStepId: ONBOARDING_STEP_IDS.EMOTIONAL_WEIGHT_INTRO,
    content: {
      key: "socialPressureSources",
      mode: SelectMode.MULTIPLE,
      maxSelected: 4,
    },
  },

  [ONBOARDING_STEP_IDS.EMOTIONAL_WEIGHT_INTRO]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.EMOTIONAL_CONCERNS,
  },

  [ONBOARDING_STEP_IDS.EMOTIONAL_CONCERNS]: {
    type: StepType.USER_SELECT,
    nextStepId: ONBOARDING_STEP_IDS.COPING_INTRO,
    content: {
      key: "emotionalConcerns",
      mode: SelectMode.MULTIPLE,
      maxSelected: 4,
    },
  },

  [ONBOARDING_STEP_IDS.COPING_INTRO]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.COPING_MECHANISM,
  },

  [ONBOARDING_STEP_IDS.COPING_MECHANISM]: {
    type: StepType.USER_SELECT,
    nextStepId: ONBOARDING_STEP_IDS.ASPIRATION_INTRO,
    content: {
      key: "copingMechanism",
      mode: SelectMode.SINGLE,
    },
  },

  [ONBOARDING_STEP_IDS.ASPIRATION_INTRO]: {
    type: StepType.PARAGRAPHS,
    nextStepId: ONBOARDING_STEP_IDS.EMOTIONAL_ASPIRATIONS,
  },

  [ONBOARDING_STEP_IDS.EMOTIONAL_ASPIRATIONS]: {
    type: StepType.USER_SELECT,
    nextStepId: ONBOARDING_STEP_IDS.END,
    content: {
      key: "emotionalAspirations",
      mode: SelectMode.MULTIPLE,
      maxSelected: 3,
    },
  },

  [ONBOARDING_STEP_IDS.END]: {
    type: StepType.END,
  },
};
