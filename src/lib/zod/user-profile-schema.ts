import {
  AgeGroup,
  CopingMechanism,
  EmotionalAspirations,
  EmotionalConcern,
  IdentityConnectionLevel,
  SocialPressureSource,
} from "@prisma/client";
import z from "zod";

export const userProfileSchema = z.object({
  displayName: z.string().min(1),
  ageGroup: z.enum(AgeGroup),
  identityConnection: z.enum(IdentityConnectionLevel),
  copingMechanism: z.enum(CopingMechanism),
  socialPressureSources: z.array(z.enum(SocialPressureSource)),
  emotionalConcerns: z.array(z.enum(EmotionalConcern)),
  emotionalAspirations: z.array(z.enum(EmotionalAspirations)),
});
