import { ONBOARDING_SESSION_PROPS } from "@/constants/sessions/onboarding";

export const SESSIONS_IDS = {
  ONBOARDING_SESSION: "onboarding",
} as const;

export const SESSION_PROPS: Record<SessionId, Record<string, any>> = {
  [SESSIONS_IDS.ONBOARDING_SESSION]: ONBOARDING_SESSION_PROPS,
} as const;

export type SessionId = (typeof SESSIONS_IDS)[keyof typeof SESSIONS_IDS];
