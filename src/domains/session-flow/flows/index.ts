import { APP_CONFIG } from "@/config/app";
import initTranslations, { APP_NAMESPACES, AppLocales } from "@/lib/i18n";
import {
  EndContent,
  FlowStep,
  ParagraphsContent,
  SelectMode,
  SessionFlow,
  StepType,
  UserInputContent,
  UserOption,
  UserSelectContent,
} from "@/types/flow-session.types";

export const ONBOARDING_SESSION_ID = "onboarding" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSelectModeValue(value: unknown): value is SelectMode {
  return value === SelectMode.SINGLE || value === SelectMode.MULTIPLE;
}

function isUserOption(value: unknown): value is UserOption {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    typeof value.value === "string" &&
    (value.description === undefined || typeof value.description === "string")
  );
}

function isUserOptionArray(value: unknown): value is UserOption[] {
  return Array.isArray(value) && value.every((item) => isUserOption(item));
}

function isParagraphsContent(value: unknown): value is ParagraphsContent {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.subtitle === "string" &&
    isStringArray(value.paragraphs) &&
    (value.buttonText === undefined || typeof value.buttonText === "string")
  );
}

function isUserInputContent(value: unknown): value is UserInputContent {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    typeof value.key === "string" &&
    (value.placeholder === undefined || typeof value.placeholder === "string") &&
    (value.hint === undefined || typeof value.hint === "string") &&
    (value.charLimit === undefined || typeof value.charLimit === "number")
  );
}

function isUserSelectContent(value: unknown): value is UserSelectContent {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    typeof value.key === "string" &&
    isSelectModeValue(value.mode) &&
    isUserOptionArray(value.options) &&
    (value.hint === undefined || typeof value.hint === "string") &&
    (value.maxSelected === undefined || typeof value.maxSelected === "number")
  );
}

function isEndContent(value: unknown): value is EndContent {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.message === "string" &&
    typeof value.primaryAction === "string" &&
    (value.secondaryAction === undefined || typeof value.secondaryAction === "string")
  );
}

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

type OnboardingStepProps = (typeof ONBOARDING_SESSION_PROPS)[OnboardingStepId];

interface OnboardingTranslations {
  title: string;
  subtitle: string;
  initialStepId: string;
  defaultAutoAdvanceDelay?: number;
  steps: Record<string, unknown>;
}

function hasContentProp(
  stepProps: OnboardingStepProps
): stepProps is OnboardingStepProps & { content: Record<string, unknown> } {
  return "content" in stepProps && isRecord((stepProps as { content?: unknown }).content);
}

function combineContent(stepProps: OnboardingStepProps, translationContent: unknown): unknown {
  switch (stepProps.type) {
    case StepType.END: {
      if (!isRecord(translationContent)) {
        throw new Error("End step content must be an object");
      }
      return translationContent;
    }
    default: {
      if (!isRecord(translationContent)) {
        throw new Error("Expected localized step content to be an object");
      }

      if (hasContentProp(stepProps)) {
        return {
          ...stepProps.content,
          ...translationContent,
        };
      }

      return translationContent;
    }
  }
}

export async function buildOnboardingSessionFlow(locale: AppLocales): Promise<SessionFlow> {
  const { t } = await initTranslations(locale, [APP_NAMESPACES.SESSIONS_ONBOARDING, APP_NAMESPACES.COMMON]);

  const onboarding = t(ONBOARDING_SESSION_ID, {
    ns: APP_NAMESPACES.SESSIONS_ONBOARDING,
    returnObjects: true,
    app_name: APP_CONFIG.name,
  }) as OnboardingTranslations | undefined;

  if (!onboarding) {
    throw new Error(`Missing onboarding translations for locale "${locale}"`);
  }

  if (!onboarding.steps || typeof onboarding.steps !== "object") {
    throw new Error(`Onboarding translations for locale "${locale}" are missing steps content`);
  }

  const steps: FlowStep[] = [];
  const stepOrder = Object.values(ONBOARDING_STEP_IDS);

  for (const stepId of stepOrder) {
    const stepProps = ONBOARDING_SESSION_PROPS[stepId];
    if (!stepProps) {
      throw new Error(`Missing onboarding step props for step "${stepId}"`);
    }

    const translationContent = (onboarding.steps as Record<string, unknown>)[stepId];
    if (!translationContent) {
      throw new Error(`Missing onboarding translation content for step "${stepId}" in locale "${locale}"`);
    }

    const combinedContent = combineContent(stepProps, translationContent);

    switch (stepProps.type) {
      case StepType.PARAGRAPHS: {
        if (!isParagraphsContent(combinedContent)) {
          throw new Error(`Invalid paragraphs content for step "${stepId}"`);
        }

        steps.push({
          id: stepId,
          type: StepType.PARAGRAPHS,
          content: combinedContent,
          nextStepId: stepProps.nextStepId,
        });
        break;
      }
      case StepType.USER_INPUT: {
        if (!isUserInputContent(combinedContent)) {
          throw new Error(`Invalid user input content for step "${stepId}"`);
        }

        steps.push({
          id: stepId,
          type: StepType.USER_INPUT,
          content: combinedContent,
          nextStepId: stepProps.nextStepId,
        });
        break;
      }
      case StepType.USER_SELECT: {
        if (!isUserSelectContent(combinedContent)) {
          throw new Error(`Invalid user select content for step "${stepId}"`);
        }

        steps.push({
          id: stepId,
          type: StepType.USER_SELECT,
          content: combinedContent,
          nextStepId: stepProps.nextStepId,
        });
        break;
      }
      case StepType.END: {
        if (stepId !== ONBOARDING_STEP_IDS.END) {
          throw new Error(`Unexpected step id "${stepId}" for end step type`);
        }
        if (!isEndContent(combinedContent)) {
          throw new Error(`Invalid end content for step "${stepId}"`);
        }

        const endStep: Extract<FlowStep, { type: typeof StepType.END }> = {
          id: ONBOARDING_STEP_IDS.END,
          type: StepType.END,
          content: combinedContent,
        };

        steps.push(endStep);
        break;
      }
      default: {
        // Exhaustive type check - ensures all step types are handled
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveStep: never = stepProps;
        throw new Error("Unsupported step type for onboarding flow");
      }
    }
  }

  const sessionFlow: SessionFlow = {
    id: ONBOARDING_SESSION_ID,
    title: onboarding.title,
    subtitle: onboarding.subtitle,
    initialStepId: onboarding.initialStepId,
    steps,
  };

  if (typeof onboarding.defaultAutoAdvanceDelay === "number") {
    sessionFlow.defaultAutoAdvanceDelay = onboarding.defaultAutoAdvanceDelay;
  }

  return sessionFlow;
}
