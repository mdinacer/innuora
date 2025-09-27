import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors";

/**
 * Schema for user account status
 */
export const UserAccountStatusSchema = z.enum(["active", "suspended", "deleted", "pending"]);

/**
 * Schema for app locales
 */
export const AppLocalesSchema = z.enum(["en", "ar", "fr"]);

/**
 * Schema for user roles
 */
export const UserRoleSchema = z.enum(["user", "admin", "tester"]);

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
  authId: z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }),
  email: z.email({ message: ERROR_CODES.VALIDATION_EMAIL_INVALID }),
  role: UserRoleSchema.optional().default("user"),
  creditsBalance: z
    .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
    .int()
    .min(0, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL })
    .optional()
    .default(0),
  encryptionSalt: z.string().optional(),
});

/**
 * Schema for updating user profile
 */
export const UpdateUserSchema = z.object({
  authId: z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }),
  role: UserRoleSchema.optional(),
  creditsBalance: z
    .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
    .int()
    .min(0, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL })
    .optional(),
  status: UserAccountStatusSchema.optional(),
  isOnboarded: z.boolean().optional(),
  encryptionSalt: z.string().optional(),
});

/**
 * Schema for user lookup
 */
export const UserLookupSchema = z.object({
  authId: z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }),
});

/**
 * Schema for bulk user operations
 */
export const BulkUserOperationSchema = z.object({
  authIds: z
    .array(z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }))
    .min(1, { message: ERROR_CODES.VALIDATION_ARRAY_EMPTY })
    .max(100, { message: ERROR_CODES.VALIDATION_ARRAY_TOO_LARGE }),
  operation: z.enum(["suspend", "activate", "delete"], { message: ERROR_CODES.VALIDATION_ENUM_INVALID }),
  reason: z
    .string()
    .min(1, { message: ERROR_CODES.VALIDATION_STRING_TOO_SHORT })
    .max(500, { message: ERROR_CODES.VALIDATION_STRING_TOO_LONG })
    .optional(),
});

/**
 * Schema for user statistics query
 */
export const UserStatsQuerySchema = z.object({
  authId: z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }),
  startDate: z.string().datetime({ message: ERROR_CODES.VALIDATION_DATE_INVALID }).optional(),
  endDate: z.string().datetime({ message: ERROR_CODES.VALIDATION_DATE_INVALID }).optional(),
});

/**
 * Schema for admin user management
 */
export const AdminUserManagementSchema = z.object({
  targetAuthId: z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }),
  adminAuthId: z.uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }),
  action: z.enum(["promote", "demote", "suspend", "reactivate", "delete"], {
    message: ERROR_CODES.VALIDATION_ENUM_INVALID,
  }),
  reason: z
    .string()
    .min(1, { message: ERROR_CODES.VALIDATION_STRING_TOO_SHORT })
    .max(1000, { message: ERROR_CODES.VALIDATION_STRING_TOO_LONG }),
});

export type UserAccountStatusSchemaType = z.infer<typeof UserAccountStatusSchema>;
export type UserRoleSchemaType = z.infer<typeof UserRoleSchema>;
export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;
export type UserLookupSchemaType = z.infer<typeof UserLookupSchema>;
export type BulkUserOperationSchemaType = z.infer<typeof BulkUserOperationSchema>;
/**
 * Schema for updating user profile information
 */
export const UpdateUserProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { message: ERROR_CODES.VALIDATION_DISPLAY_NAME_REQUIRED })
    .max(50, { message: ERROR_CODES.VALIDATION_DISPLAY_NAME_TOO_LONG })
    .optional(),
  locale: AppLocalesSchema.optional(),
});

export type UserStatsQuerySchemaType = z.infer<typeof UserStatsQuerySchema>;
export type AdminUserManagementSchemaType = z.infer<typeof AdminUserManagementSchema>;
export type AppLocalesSchemaType = z.infer<typeof AppLocalesSchema>;
export type UpdateUserProfileSchemaType = z.infer<typeof UpdateUserProfileSchema>;
