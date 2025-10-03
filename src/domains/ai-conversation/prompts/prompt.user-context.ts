import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { AppLocales } from "@/lib/i18n";

export function buildUserProfilePrompt(profile: Profile): ChatCompletionMessageParam {
  const {
    displayName,
    ageGroup,
    identityConnection,
    copingMechanism,
    socialPressureSources,
    emotionalConcerns,
    emotionalAspirations,
  } = profile;

  const namePart = displayName ? `Name: ${displayName}.` : "";
  const agePart = ageGroup ? `Age group: ${ageGroup.replace("Age", "").replace("_", "-")}.` : "";
  const identityPart = identityConnection ? `Identity connection: ${identityConnection}.` : "";
  const copingPart = copingMechanism ? `Coping: ${copingMechanism.replace("_", " ")}.` : "";
  const pressurePart = socialPressureSources.length > 0 ? `Social pressures: ${socialPressureSources.join(", ")}.` : "";
  const concernPart = emotionalConcerns.length > 0 ? `Concerns: ${emotionalConcerns.join(", ")}.` : "";
  const aspirationPart = emotionalAspirations.length > 0 ? `Aspirations: ${emotionalAspirations.join(", ")}.` : "";

  return {
    role: "assistant",
    content: [namePart, agePart, identityPart, copingPart, pressurePart, concernPart, aspirationPart]
      .filter(Boolean)
      .join(" "),
  };
}

export function buildUserProfilePromptCompact(profile: Profile): string {
  return `
User Profile:
- Display Name: ${profile.displayName ?? "N/A"}
- Age Group: ${profile.ageGroup ?? "N/A"}
- Identity Connection: ${profile.identityConnection ?? "N/A"}
- Coping Mechanism: ${profile.copingMechanism ?? "N/A"}
- Social Pressure Sources: ${profile.socialPressureSources.join(", ") || "N/A"}
- Emotional Concerns: ${profile.emotionalConcerns.join(", ") || "N/A"}
- Emotional Aspirations: ${profile.emotionalAspirations.join(", ") || "N/A"}
`.trim();
}

/**
 * Builds localized user profile context for system prompt
 * More token-efficient than separate assistant message
 */
export function buildUserProfileContext(profile: Profile, locale: AppLocales): string {
  const {
    displayName,
    ageGroup,
    identityConnection,
    copingMechanism,
    socialPressureSources,
    emotionalConcerns,
    emotionalAspirations,
  } = profile;

  // Format age group
  const formattedAge = ageGroup ? ageGroup.replace("Age", "").replace("_", "-") : null;
  const formattedCoping = copingMechanism ? copingMechanism.replace("_", " ") : null;

  switch (locale) {
    case "ar":
      return `
معلومات المستخدمة:
${displayName ? `- الاسم: ${displayName}` : ""}
${formattedAge ? `- الفئة العمرية: ${formattedAge}` : ""}
${identityConnection ? `- الارتباط بالهوية: ${identityConnection}` : ""}
${formattedCoping ? `- آلية التأقلم: ${formattedCoping}` : ""}
${socialPressureSources.length > 0 ? `- ضغوط اجتماعية: ${socialPressureSources.join("، ")}` : ""}
${emotionalConcerns.length > 0 ? `- مخاوف عاطفية: ${emotionalConcerns.join("، ")}` : ""}
${emotionalAspirations.length > 0 ? `- تطلعات عاطفية: ${emotionalAspirations.join("، ")}` : ""}
`.trim();

    case "fr":
      return `
Profil utilisateur:
${displayName ? `- Nom: ${displayName}` : ""}
${formattedAge ? `- Tranche d'âge: ${formattedAge}` : ""}
${identityConnection ? `- Connexion identitaire: ${identityConnection}` : ""}
${formattedCoping ? `- Mécanisme d'adaptation: ${formattedCoping}` : ""}
${socialPressureSources.length > 0 ? `- Pressions sociales: ${socialPressureSources.join(", ")}` : ""}
${emotionalConcerns.length > 0 ? `- Préoccupations émotionnelles: ${emotionalConcerns.join(", ")}` : ""}
${emotionalAspirations.length > 0 ? `- Aspirations émotionnelles: ${emotionalAspirations.join(", ")}` : ""}
`.trim();

    case "en":
    default:
      return `
User Profile:
${displayName ? `- Name: ${displayName}` : ""}
${formattedAge ? `- Age group: ${formattedAge}` : ""}
${identityConnection ? `- Identity connection: ${identityConnection}` : ""}
${formattedCoping ? `- Coping mechanism: ${formattedCoping}` : ""}
${socialPressureSources.length > 0 ? `- Social pressures: ${socialPressureSources.join(", ")}` : ""}
${emotionalConcerns.length > 0 ? `- Emotional concerns: ${emotionalConcerns.join(", ")}` : ""}
${emotionalAspirations.length > 0 ? `- Emotional aspirations: ${emotionalAspirations.join(", ")}` : ""}
`.trim();
  }
}
