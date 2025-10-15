import { Profile } from "@prisma/client";

import { AppLocales } from "@/lib/i18n";

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
