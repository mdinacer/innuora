import {
  buildOnboardingSessionFlow,
  ONBOARDING_SESSION_ID,
  ONBOARDING_SESSION_PROPS,
} from "@/domains/session-flow/flows";
import { AppLocales } from "@/lib/i18n";
import { SessionFlow } from "@/types/flow-session.types";

export const SESSIONS_IDS = {
  ONBOARDING_SESSION: ONBOARDING_SESSION_ID,
} as const;

export type SessionId = (typeof SESSIONS_IDS)[keyof typeof SESSIONS_IDS];

export type SessionBuilder = (locale: AppLocales) => Promise<SessionFlow>;

export const SESSION_BUILDERS: Record<SessionId, SessionBuilder> = {
  [SESSIONS_IDS.ONBOARDING_SESSION]: buildOnboardingSessionFlow,
} as const;

export const SESSION_STEP_PROPS: Record<SessionId, Record<string, any>> = {
  [SESSIONS_IDS.ONBOARDING_SESSION]: ONBOARDING_SESSION_PROPS,
} as const;
