import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors";

export const SignInSchema = z.object({
  email: z
    .string()
    .email({ message: ERROR_CODES.AUTH_EMAIL_INVALID })
    .max(254)
    .transform((val) => val.toLowerCase().trim()),
  password: z.string(),
  remember: z.boolean().optional(),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    email: z
      .string()
      .email({ message: ERROR_CODES.AUTH_EMAIL_INVALID })
      .max(254)
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(12, { message: ERROR_CODES.AUTH_PASSWORD_REQUIREMENTS })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: ERROR_CODES.AUTH_PASSWORD_REQUIREMENTS,
      }),
    confirmPassword: z.string(),
    ageConfirm: z.boolean(),
    termsAgree: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: ERROR_CODES.AUTH_PASSWORD_MISMATCH,
      });
    }

    if (data.ageConfirm !== true) {
      ctx.addIssue({
        path: ["ageConfirm"],
        code: "custom",
        message: ERROR_CODES.AUTH_AGE_CONFIRMATION_REQUIRED,
      });
    }

    if (data.termsAgree !== true) {
      ctx.addIssue({
        path: ["termsAgree"],
        code: "custom",
        message: ERROR_CODES.AUTH_TERMS_AGREEMENT_REQUIRED,
      });
    }
  });

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
