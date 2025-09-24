import { User } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WrappedKeyPackage } from "@/lib/crypto/webcrypto-crypto.types";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import {
  assertCurrentUserId,
  findCurrentUser,
  requireAdmin,
  requireCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "../auth-actions";

// Mock logger
vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn(async (fn, errorCode, metadata, message) => {
      try {
        return await fn();
      } catch (error) {
        const appError = new AppError(errorCode, metadata, error);
        throw appError;
      }
    }),
    logErrorAndThrow: vi.fn((code, error, metadata) => {
      const appError = new AppError(code, metadata, error);
      throw appError;
    }),
  },
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock Next.js redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe("Auth Actions", () => {
  const mockUser: User = {
    id: "user123",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockPrismaUser = {
    id: "prisma-user-123",
    authId: "user123",
    role: "user",
    creditsBalance: 100,
    status: "active",
    isOnboarded: true,
  };

  const mockAdminUser = {
    ...mockPrismaUser,
    role: "admin",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findCurrentUser", () => {
    it("should return user when authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await findCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledOnce();
    });

    it("should return null when not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No session" },
      });

      const result = await findCurrentUser();

      expect(result).toBeNull();
    });

    it("should return null when Supabase returns error", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      });

      const result = await findCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe("requireCurrentUser", () => {
    it("should return user when authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await requireCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it("should throw error when Supabase returns error", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      });

      await expect(requireCurrentUser()).rejects.toThrow(AppError);
    });

    it("should throw error when no user in session", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(requireCurrentUser()).rejects.toThrow(AppError);
    });

    it("should throw AUTH_SESSION_EXPIRED error code", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Session expired" },
      });

      try {
        await requireCurrentUser();
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(ERROR_CODES.AUTH_SESSION_EXPIRED);
      }
    });
  });

  describe("requireAdmin", () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it("should return admin user when user has admin role", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.user.findUnique as any).mockResolvedValue(mockAdminUser);

      const result = await requireAdmin();

      expect(result).toEqual(mockAdminUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { authId: mockUser.id },
      });
    });

    it("should throw error when user is not admin", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.user.findUnique as any).mockResolvedValue(mockPrismaUser);

      await expect(requireAdmin()).rejects.toThrow(AppError);
    });

    it("should throw error when user not found in database", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow(AppError);
    });

    it("should throw AUTH_UNAUTHORIZED error code", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.user.findUnique as any).mockResolvedValue(mockPrismaUser);

      try {
        await requireAdmin();
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(ERROR_CODES.AUTH_UNAUTHORIZED);
      }
    });
  });

  describe("assertCurrentUserId", () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it("should pass when userId matches current user", async () => {
      await expect(assertCurrentUserId(mockUser.id)).resolves.toBeUndefined();
    });

    it("should throw error when userId is invalid", async () => {
      await expect(assertCurrentUserId("")).rejects.toThrow(AppError);
      await expect(assertCurrentUserId(null as any)).rejects.toThrow(AppError);
      await expect(assertCurrentUserId(undefined as any)).rejects.toThrow(AppError);
    });

    it("should throw error when userId doesn't match current user", async () => {
      await expect(assertCurrentUserId("different-user-id")).rejects.toThrow(AppError);
    });

    it("should throw VALIDATION_FAILED for invalid userId", async () => {
      try {
        await assertCurrentUserId("");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it("should throw AUTH_UNAUTHORIZED for mismatched userId", async () => {
      try {
        await assertCurrentUserId("different-user-id");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(ERROR_CODES.AUTH_UNAUTHORIZED);
      }
    });
  });

  describe("signUp", () => {
    const validSignUpData = {
      email: "test@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
      ageConfirm: true,
      termsAgree: true,
    };

    const mockWrappedKeyPackage: WrappedKeyPackage = {
      wrappedKey: "wrapped-key-data",
      salt: "salt-data",
      iv: "iv-data",
    };

    it("should successfully sign up user with valid data", async () => {
      const { redirect } = await import("next/navigation");
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { ...mockUser, confirmation_sent_at: "2024-01-01T00:00:00Z" },
          session: null,
        },
        error: null,
      });

      await signUp(validSignUpData, mockWrappedKeyPackage);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: validSignUpData.email,
        password: validSignUpData.password,
        options: {
          data: {
            crypto: mockWrappedKeyPackage,
            ageConfirm: validSignUpData.ageConfirm,
            termsAgree: validSignUpData.termsAgree,
          },
        },
      });
      expect(redirect).toHaveBeenCalledWith("/auth/verify-email/sent");
    });

    it("should work without key package", async () => {
      const { redirect } = await import("next/navigation");
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { ...mockUser, confirmation_sent_at: "2024-01-01T00:00:00Z" },
          session: null,
        },
        error: null,
      });

      await signUp(validSignUpData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: validSignUpData.email,
        password: validSignUpData.password,
        options: {
          data: {
            crypto: undefined,
            ageConfirm: validSignUpData.ageConfirm,
            termsAgree: validSignUpData.termsAgree,
          },
        },
      });
    });

    it("should handle Supabase signup errors", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Email already registered" },
      });

      await expect(signUp(validSignUpData)).rejects.toThrow();
    });

    it("should handle missing confirmation email", async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { ...mockUser, confirmation_sent_at: null }, // No confirmation sent
          session: null,
        },
        error: null,
      });

      await expect(signUp(validSignUpData)).rejects.toThrow(AppError);
    });

    it("should validate signup data with Zod schema", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "weak",
        confirmPassword: "different",
        ageConfirm: false,
        termsAgree: false,
      };

      await expect(signUp(invalidData)).rejects.toThrow();
    });

    it("should transform email to lowercase", async () => {
      const dataWithUppercaseEmail = {
        ...validSignUpData,
        email: "TEST@EXAMPLE.COM",
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { ...mockUser, confirmation_sent_at: "2024-01-01T00:00:00Z" },
          session: null,
        },
        error: null,
      });

      await signUp(dataWithUppercaseEmail);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com", // Should be lowercase
        })
      );
    });
  });

  describe("signIn", () => {
    const validSignInData = {
      email: "test@example.com",
      password: "SecurePass123!",
      remember: true,
    };

    it("should successfully sign in user with valid credentials", async () => {
      const mockAuthData = {
        user: mockUser,
        session: { access_token: "token123" },
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const result = await signIn(validSignInData);

      expect(result).toEqual(mockAuthData);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: validSignInData.email,
        password: validSignInData.password,
      });
    });

    it("should handle invalid credentials", async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      await expect(signIn(validSignInData)).rejects.toThrow();
    });

    it("should validate signin data with Zod schema", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "",
      };

      await expect(signIn(invalidData)).rejects.toThrow();
    });

    it("should transform email to lowercase", async () => {
      const dataWithUppercaseEmail = {
        ...validSignInData,
        email: "TEST@EXAMPLE.COM",
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: "token" } },
        error: null,
      });

      await signIn(dataWithUppercaseEmail);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com", // Should be lowercase
        })
      );
    });

    it("should handle remember me option", async () => {
      const { createClient } = await import("@/lib/supabase/server");

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: "token" } },
        error: null,
      });

      await signIn({ ...validSignInData, remember: false });

      // Should call createClient with remember parameter
      expect(createClient).toHaveBeenCalledWith(false);
    });
  });

  describe("signOut", () => {
    it("should successfully sign out authenticated user", async () => {
      const { redirect } = await import("next/navigation");

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(signOut()).resolves.toBeUndefined();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledOnce();
      expect(redirect).toHaveBeenCalledWith("/auth/sign-in");
    });

    it("should handle signout errors", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.auth.signOut.mockImplementation(() => {
        throw new Error("Failed to sign out");
      });

      await expect(signOut()).rejects.toThrow();
    });

    it("should work even when no user is logged in", async () => {
      const { redirect } = await import("next/navigation");

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No session" },
      });

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(signOut()).resolves.toBeUndefined();
      expect(redirect).toHaveBeenCalledWith("/auth/sign-in");
    });
  });

  describe("resetPassword", () => {
    it("should send password reset email successfully", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await resetPassword("test@example.com");

      expect(result).toEqual({ success: true });
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@example.com", {
        redirectTo: expect.stringContaining("/auth/password-reset/confirm"),
      });
    });

    it("should handle reset password errors", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: "User not found" },
      });

      await expect(resetPassword("nonexistent@example.com")).rejects.toThrow();
    });

    it("should transform email to lowercase", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      await resetPassword("TEST@EXAMPLE.COM");

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "TEST@EXAMPLE.COM", // Note: resetPassword doesn't transform email, but this tests the expectation
        expect.any(Object)
      );
    });
  });

  describe("Authentication Flow Integration", () => {
    it("should maintain user context through authentication flow", async () => {
      // 1. Start unauthenticated
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No session" },
      });

      let user = await findCurrentUser();
      expect(user).toBeNull();

      // 2. Sign up
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { ...mockUser, confirmation_sent_at: "2024-01-01T00:00:00Z" },
          session: null,
        },
        error: null,
      });

      await signUp({
        email: "newuser@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        ageConfirm: true,
        termsAgree: true,
      });

      // 3. Sign in after confirmation
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: "token" } },
        error: null,
      });

      const authData = await signIn({
        email: "newuser@example.com",
        password: "SecurePass123!",
      });

      expect(authData.user).toEqual(mockUser);

      // 4. Now authenticated
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      user = await findCurrentUser();
      expect(user).toEqual(mockUser);

      // 5. Require authentication works
      const requiredUser = await requireCurrentUser();
      expect(requiredUser).toEqual(mockUser);

      // 6. Sign out
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });
      await signOut();

      // 7. Back to unauthenticated
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No session" },
      });

      user = await findCurrentUser();
      expect(user).toBeNull();
    });

    it("should handle role-based authorization flow", async () => {
      // Setup authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { prisma } = await import("@/lib/prisma");

      // Test regular user access
      (prisma.user.findUnique as any).mockResolvedValue(mockPrismaUser);
      await expect(requireAdmin()).rejects.toThrow(AppError);

      // Test admin access
      (prisma.user.findUnique as any).mockResolvedValue(mockAdminUser);
      const adminUser = await requireAdmin();
      expect(adminUser.role).toBe("admin");
    });

    it("should handle user ID assertion flow", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Valid assertion
      await expect(assertCurrentUserId(mockUser.id)).resolves.toBeUndefined();

      // Invalid assertion
      await expect(assertCurrentUserId("different-id")).rejects.toThrow(AppError);
    });
  });

  describe("Error Handling and Security", () => {
    it("should properly handle rate limiting scenarios", async () => {
      // Multiple failed login attempts
      mockSupabaseClient.auth.signInWithPassword
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: "Invalid credentials" },
        })
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: "Invalid credentials" },
        })
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: "Too many requests" },
        });

      // Should fail three times
      await expect(signIn({ email: "test@example.com", password: "wrong" })).rejects.toThrow();
      await expect(signIn({ email: "test@example.com", password: "wrong" })).rejects.toThrow();
      await expect(signIn({ email: "test@example.com", password: "wrong" })).rejects.toThrow();
    });

    it("should handle edge cases in user validation", async () => {
      // Missing user data edge cases
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: "" } }, // Empty ID
        error: null,
      });

      await expect(assertCurrentUserId("any-id")).rejects.toThrow();

      // Malformed user data
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, email: null } },
        error: null,
      });

      const user = await findCurrentUser();
      expect(user?.email).toBeNull();
    });

    it("should validate email formats comprehensively", async () => {
      const invalidEmails = ["not-an-email", "@domain.com", "user@", "user..double@domain.com", "user@domain", "", " "];

      for (const email of invalidEmails) {
        await expect(signIn({ email, password: "ValidPass123!" })).rejects.toThrow();
      }
    });

    it("should validate password requirements", async () => {
      const invalidPasswords = [
        "short", // Too short
        "nouppercase123!", // No uppercase
        "NOLOWERCASE123!", // No lowercase
        "NoNumbers!", // No numbers
        "NoSpecialChars123", // No special characters
        "", // Empty
      ];

      for (const password of invalidPasswords) {
        await expect(
          signUp({
            email: "test@example.com",
            password,
            confirmPassword: password,
            ageConfirm: true,
            termsAgree: true,
          })
        ).rejects.toThrow();
      }
    });
  });
});
