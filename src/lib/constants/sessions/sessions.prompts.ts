import { Profile } from "@prisma/client";

import { SessionId, SESSIONS_IDS } from "@/constants/sessions/sessions.props";

export const sessionsPrompts: Record<SessionId, { prompt: (values: Record<string, any>) => string }> = {
  [SESSIONS_IDS.ONBOARDING_SESSION]: {
    prompt: (values: Record<string, any>) => {
      const userData = values as Profile;
      const name = userData.displayName?.trim() || "this woman";
      const age = userData.ageGroup?.replace("_", "-").replace("plus", "+");
      const connection = userData.identityConnection;
      const pressures = Array.isArray(userData.socialPressureSources) ? userData.socialPressureSources.join(", ") : "";
      const concerns = Array.isArray(userData.emotionalConcerns) ? userData.emotionalConcerns.join(", ") : "";
      const coping = userData.copingMechanism;
      const aspirations = Array.isArray(userData.emotionalAspirations) ? userData.emotionalAspirations.join(", ") : "";

      return `Reflect with emotional precision on what ${name} has shared:

- Age group: ${age}
- Connection to self: ${connection}
- Social pressures: ${pressures}
- Emotional concerns: ${concerns}
- Coping pattern: ${coping}
- Aspirations: ${aspirations}

Your goal is to translate these into a short emotional reflection that feels lived — not described.

Mirror the internal experience of someone who’s been *performing under pressure, disconnecting to survive*, and quietly aching for clarity, kindness, or direction. 

Speak in grounded, woman-to-woman language. Let the emotional weight be felt. Don’t soften it. Don’t analyze it. And don’t sound like a therapist.

End with quiet presence. One gentle line of tenderness is enough — something that feels like *“Maybe today, you don’t have to hold it all together.”*

No lists. No summaries. No repeating data.

Use punctuation instead of em dashes. Return markdown text.`;
    },
  },
};

export function getSessionReflectionPrompt(sessionId: SessionId): (values: Record<string, any>) => string {
  return sessionsPrompts[sessionId].prompt;
}
