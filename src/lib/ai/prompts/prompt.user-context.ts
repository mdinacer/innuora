import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

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
