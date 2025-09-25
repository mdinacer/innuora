import { z } from "zod";

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
  authId: z.uuid("Invalid authentication ID format"),
  email: z.email("Invalid email format"),
  role: UserRoleSchema.optional().default("user"),
  creditsBalance: z.number().int().min(0).optional().default(0),
  encryptionSalt: z.string().optional(),
});

/**
 * Schema for updating user profile
 */
export const UpdateUserSchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
  role: UserRoleSchema.optional(),
  creditsBalance: z.number().int().min(0).optional(),
  status: UserAccountStatusSchema.optional(),
  isOnboarded: z.boolean().optional(),
  encryptionSalt: z.string().optional(),
});

/**
 * Schema for user lookup
 */
export const UserLookupSchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
});

/**
 * Schema for bulk user operations
 */
export const BulkUserOperationSchema = z.object({
  authIds: z.array(z.uuid("Invalid authentication ID format")).min(1).max(100),
  operation: z.enum(["suspend", "activate", "delete"]),
  reason: z.string().min(1).max(500).optional(),
});

/**
 * Schema for user statistics query
 */
export const UserStatsQuerySchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
});

/**
 * Schema for admin user management
 */
export const AdminUserManagementSchema = z.object({
  targetAuthId: z.uuid("Invalid target user authentication ID format"),
  adminAuthId: z.uuid("Invalid admin authentication ID format"),
  action: z.enum(["promote", "demote", "suspend", "reactivate", "delete"]),
  reason: z.string().min(1).max(1000, "Reason too long"),
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
  displayName: z.string().trim().min(1, "Display name is required").max(50, "Display name too long").optional(),
  locale: AppLocalesSchema.optional(),
});

export type UserStatsQuerySchemaType = z.infer<typeof UserStatsQuerySchema>;
export type AdminUserManagementSchemaType = z.infer<typeof AdminUserManagementSchema>;
export type AppLocalesSchemaType = z.infer<typeof AppLocalesSchema>;
export type UpdateUserProfileSchemaType = z.infer<typeof UpdateUserProfileSchema>;
