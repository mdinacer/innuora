import {
  AgeGroup,
  CopingMechanism,
  EmotionalAspirations,
  EmotionalConcern,
  IdentityConnectionLevel,
  SocialPressureSource,
} from "@prisma/client";
import { z } from "zod";

export const UserProfileSchema = z.object({
  displayName: z.string().max(255).optional().nullable(),
  ageGroup: z.enum(AgeGroup).optional().nullable(),
  identityConnection: z.enum(IdentityConnectionLevel).optional().nullable(),
  copingMechanism: z.enum(CopingMechanism).optional().nullable(),
  socialPressureSources: z.array(z.enum(SocialPressureSource)),
  emotionalConcerns: z.array(z.enum(EmotionalConcern)),
  emotionalAspirations: z.array(z.enum(EmotionalAspirations)),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
