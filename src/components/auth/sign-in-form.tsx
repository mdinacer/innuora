"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthError } from "@supabase/supabase-js";
import { XCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { signIn } from "@/app/actions/auth-actions";
import PasswordField from "@/components/input/password-field";
import TextField from "@/components/input/text-field";
import { Form } from "@/components/ui/form";
import { deriveUserKey, setSessionKey } from "@/lib/crypto/encryption";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SignInSchema, SignInSchemaType } from "@/lib/zod/auth.schema";
import CheckboxField from "../input/checkbox-field";

interface Props {
  className?: string;
}

const SignInForm: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const { t } = useTranslation("pages", { keyPrefix: "auth.sign-in" });
  const [formError, setFormError] = useState<string | null>(null);

  const { title, subtitle, formFields, no_account } = {
    title: t("title"),
    subtitle: t("subtitle"),
    formFields: {
      email: {
        label: t("form.email.label"),
        placeholder: t("form.email.placeholder"),
      },
      password: {
        label: t("form.password.label"),
        placeholder: t("form.password.placeholder"),
      },
      forgot_password: t("form.forgot_password"),
      remember: t("form.remember"),
      submit: t("form.submit"),
    },
    no_account: {
      text: t("no_account.text"),
      link: t("no_account.link"),
    },
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

  const handleOnSubmit = useCallback(
    async (data: SignInSchemaType) => {
      setFormError(null);
      try {
        const { user, session } = await signIn(data);

        if (session) {
          const client = createClient();
          client.auth.setSession(session);
        }
        const metadata = user.user_metadata;
        if (!metadata.encryptionSalt) {
          throw new Error("No encryption salt found in user metadata");
        }
        const generatedKey = await deriveUserKey(data.password, metadata.encryptionSalt);
        setSessionKey(generatedKey.toString("hex"), data.remember);

        router.push("/sessions");
      } catch (error: unknown) {
        if (error instanceof AuthError) {
          setFormError(error.message);
        }
      }
    },
    [router]
  );

  return (
    <div className={cn("w-full max-w-md", className)}>
      {/* <!-- Welcome Header --> */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">{title}</h1>
        <p className="text-mir-text-secondary">{subtitle}</p>
      </div>

      {formError && (
        <div className="mb-6 ">
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 shadow-subtle">
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
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
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

              <Link href="/auth/forgot-password" className="text-sm text-mir-bg-accent hover:underline">
                {formFields.forgot_password}
              </Link>
            </div>

            {/* <!-- Submit Button --> */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-2xl inline-flex items-center gap-x-2 justify-center bg-mir-bg-accent  focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50",
                "px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting && (
                <div className="size-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              )}
              {formFields.submit}
            </button>
          </form>
        </Form>
      </div>

      {/* <!-- Sign Up Link --> */}
      <div className="text-center mt-6">
        <p className="text-mir-text-secondary inline-flex gap-x-2">
          <span>{no_account.text}</span>
          <Link href="/auth/sign-up" className="text-mir-bg-accent font-medium hover:underline">
            {no_account.link}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
