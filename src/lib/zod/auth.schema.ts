import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string(),
  remember: z.boolean().optional(),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    ageConfirm: z.boolean(),
    termsAgree: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords do not match",
      });
    }

    if (data.ageConfirm !== true) {
      ctx.addIssue({
        path: ["ageConfirm"],
        code: "custom",
        message: "You must confirm that you are at least 18 years old",
      });
    }

    if (data.termsAgree !== true) {
      ctx.addIssue({
        path: ["termsAgree"],
        code: "custom",
        message: "You must agree to the terms and conditions",
      });
    }
  });

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
