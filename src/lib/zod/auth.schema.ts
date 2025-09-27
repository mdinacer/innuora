import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors";

export const SignInSchema = z.object({
  email: z
    .string({ message: ERROR_CODES.VALIDATION_EMAIL_REQUIRED })
    .email({ message: ERROR_CODES.VALIDATION_EMAIL_INVALID })
    .max(254, { message: ERROR_CODES.VALIDATION_EMAIL_TOO_LONG })
    .transform((val) => val.toLowerCase().trim()),
  password: z.string({ message: ERROR_CODES.VALIDATION_PASSWORD_REQUIRED }),
  remember: z.boolean().optional(),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    email: z
      .string({ message: ERROR_CODES.VALIDATION_EMAIL_REQUIRED })
      .email({ message: ERROR_CODES.VALIDATION_EMAIL_INVALID })
      .max(254, { message: ERROR_CODES.VALIDATION_EMAIL_TOO_LONG })
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ message: ERROR_CODES.VALIDATION_PASSWORD_REQUIRED })
      .min(12, { message: ERROR_CODES.VALIDATION_PASSWORD_TOO_SHORT })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: ERROR_CODES.VALIDATION_PASSWORD_WEAK,
      }),
    confirmPassword: z.string({ message: ERROR_CODES.VALIDATION_PASSWORD_REQUIRED }),
    ageConfirm: z.boolean({ message: ERROR_CODES.VALIDATION_BOOLEAN_REQUIRED }),
    termsAgree: z.boolean({ message: ERROR_CODES.VALIDATION_BOOLEAN_REQUIRED }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: ERROR_CODES.VALIDATION_PASSWORD_MISMATCH,
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
