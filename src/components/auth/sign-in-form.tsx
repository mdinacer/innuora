"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { signIn, signOutOthers } from "@/app/actions/auth-actions";
import CheckboxField from "@/components/input/checkbox-field";
import PasswordField from "@/components/input/password-field";
import TextField from "@/components/input/text-field";
import { Form } from "@/components/ui/form";
import { recoverContentKeyFromWrapped, storeContentKey } from "@/lib/crypto/webcrypto-crypto";
import { WrappedKeyPackageSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { logger } from "@/lib/logging/logger.client";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SignInSchema, SignInSchemaType } from "@/lib/zod/auth.schema";

interface Props {
  className?: string;
}

const SignInForm: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const { t } = useTranslation(["pages/auth", "errors"]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Simple translation lookups - no need for useMemo
  const title = t("title", { keyPrefix: "auth.sign-in" });
  const subtitle = t("subtitle", { keyPrefix: "auth.sign-in" });
  const formFields = {
    email: {
      label: t("form.email.label", { keyPrefix: "auth.sign-in" }),
      placeholder: t("form.email.placeholder", { keyPrefix: "auth.sign-in" }),
    },
    password: {
      label: t("form.password.label", { keyPrefix: "auth.sign-in" }),
      placeholder: t("form.password.placeholder", { keyPrefix: "auth.sign-in" }),
    },
    forgot_password: t("form.forgot_password", { keyPrefix: "auth.sign-in" }),
    remember: t("form.remember", { keyPrefix: "auth.sign-in" }),
    submit: t("form.submit", { keyPrefix: "auth.sign-in" }),
  };
  const no_account = {
    text: t("no_account.text", { keyPrefix: "auth.sign-in" }),
    link: t("no_account.link", { keyPrefix: "auth.sign-in" }),
  };

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const { isSubmitting } = form.formState;

  /**
   * Helper: Recover and store user's encryption key from wrapped package
   * Note: Key is always persisted in IndexedDB (industry standard for E2EE apps)
   */
  const recoverUserEncryptionKey = useCallback(async (userMetadata: any, password: string, email: string) => {
    const parsedCryptoData = WrappedKeyPackageSchema.safeParse(userMetadata?.crypto);

    if (parsedCryptoData.success) {
      const cryptoMeta = parsedCryptoData.data;
      const contentKey = await recoverContentKeyFromWrapped(cryptoMeta, password);
      // Always persist key in IndexedDB (removed 'remember' parameter)
      await storeContentKey(contentKey);
    } else {
      logger.logWarning("Crypto metadata invalid during sign-in", {
        operation: "auth_signin_crypto_metadata_invalid",
        metadata: {
          email,
          cryptoParsingError: parsedCryptoData.error?.message || "Unknown parsing error",
        },
      });
    }
  }, []);

  const handleSignIn = useCallback(
    async (credentials: SignInSchemaType) => {
      setFormError(null);
      try {
        const result = await signIn(credentials);

        // Handle error response
        if (result.error) {
          const errorMessage = t(result.error.code);
          setFormError(errorMessage);
          logger.logWarning("Authentication error during sign-in", {
            operation: "auth_signin_error",
            metadata: {
              email: credentials.email,
              errorCode: result.error.code,
            },
          });
          return;
        }

        // Success - extract data
        const { user } = result.data;

        // Recover and store encryption key (always persisted in IndexedDB)
        await recoverUserEncryptionKey(user?.user_metadata, credentials.password, credentials.email);

        // Enforces sign out of other sessions (Single session per user)
        await signOutOthers();

        const supabase = createClient();
        supabase.auth.setSession(result.data.session);

        // Mark as redirecting to prevent form re-enablement during navigation
        setIsRedirecting(true);

        // Navigate to sessions page
        router.push("/sessions");
        router.refresh();
      } catch (error: unknown) {
        setIsRedirecting(false);
        // Handle unexpected errors (e.g., crypto key recovery failure)
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during sign in";
        setFormError(errorMessage);
        logger.logWarning("Unexpected error during sign-in", {
          operation: "auth_signin_unexpected_error",
          metadata: {
            email: credentials.email,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    },
    [recoverUserEncryptionKey, router, t]
  );

  return (
    <div className={cn("w-full max-w-md", className)}>
      {/* <!-- Welcome Header --> */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {formError && (
        <div className="mb-6 ">
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <XCircleIcon className="size-5 text-red-600 shrink-0 " />
              <div>
                <h3 id="errorTitle" className="font-semibold text-red-800 dark:text-red-200">
                  {formError}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <!-- Sign In Form --> */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-6">
            {/* <!-- Email Field --> */}
            <TextField
              control={form.control}
              name="email"
              label={formFields.email.label}
              placeholder={formFields.email.placeholder}
              autoComplete="email webauthn"
            />

            {/* <!-- Password Field --> */}
            <PasswordField
              control={form.control}
              name="password"
              label={formFields.password.label}
              placeholder={formFields.password.placeholder}
              autoComplete="current-password webauthn"
            />

            {/* <!-- Forgot Password --> */}
            <div className="text-right">
              <CheckboxField name="remember" control={form.control} label={formFields.remember} />

              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                {formFields.forgot_password}
              </Link>
            </div>

            {/* <!-- Submit Button --> */}
            <button
              type="submit"
              disabled={isSubmitting || isRedirecting}
              className={cn(
                "w-full rounded-2xl inline-flex items-center gap-x-2 justify-center bg-primary  focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                "px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              )}
            >
              {(isSubmitting || isRedirecting) && (
                <div className="size-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              )}
              {isRedirecting ? "Redirecting..." : formFields.submit}
            </button>
          </form>
        </Form>
      </div>

      {/* <!-- Sign Up Link --> */}
      <div className="text-center mt-6">
        <p className="text-muted-foreground inline-flex gap-x-2">
          <span>{no_account.text}</span>
          <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
            {no_account.link}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
