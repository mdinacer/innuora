"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthError } from "@supabase/supabase-js";
import { XCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { signOut, signUp } from "@/app/actions/auth-actions";
import CheckboxField from "@/components/input/checkbox-field";
import PasswordField from "@/components/input/password-field";
import TextField from "@/components/input/text-field";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { SignUpSchema, SignUpSchemaType } from "@/lib/zod/auth.schema";

interface Props {
  className?: string;
}

const SignUpForm: React.FC<Props> = ({}) => {
  const { t } = useTranslation("pages", { keyPrefix: "auth.sign-up" });
  const [formError, setFormError] = useState<string | null>(null);

  const { title, subtitle, formFields, haveAccount } = {
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
      confirmPassword: {
        label: t("form.confirmPassword.label"),
        placeholder: t("form.confirmPassword.placeholder"),
        match: t("form.confirmPassword.match"),
        mismatch: t("form.confirmPassword.mismatch"),
      },
      ageConfirm: t("form.ageConfirm"),
      termsAgree: {
        prefix: t("form.termsAgree.prefix"),
        terms: t("form.termsAgree.terms"),
        and: t("form.termsAgree.and"),
        privacy: t("form.termsAgree.privacy"),
      },
      submit: t("form.submit"),
    },
    haveAccount: {
      text: t("have_account.text"),
      link: t("have_account.link"),
    },
  };

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      ageConfirm: true,
      termsAgree: true,
    },
  });

  const { isSubmitting } = form.formState;

  const handleOnSubmit = useCallback(async (data: SignUpSchemaType) => {
    await signOut();
    setFormError(null);
    try {
      console.log(data);

      await signUp(data);
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        setFormError(error.message);
      }
    }
  }, []);

  return (
    <div className={cn("w-full max-w-lg")}>
      {/* <!-- Welcome Header --> */}
      <div className="text-center mb-8">
        <h1
          className={
            "text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3 rtl:mb-5 rtl:text-4xl rtl:md:text-5xl rtl:font-arabic"
          }
        >
          {title}
        </h1>
        <p className="text-mir-text-secondary rtl:text-lg rtl:font-arabic-body">{subtitle}</p>
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

      {/* <!-- Sign Up Form --> */}
      <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)} className="grid gap-y-8">
            <TextField
              control={form.control}
              name="email"
              label={formFields.email.label}
              placeholder={formFields.email.placeholder}
            />

            <PasswordField
              control={form.control}
              name="password"
              label={formFields.password.label}
              placeholder={formFields.password.placeholder}
              autoComplete="new-password"
            />
            <PasswordField
              control={form.control}
              name="confirmPassword"
              label={formFields.confirmPassword.label}
              placeholder={formFields.confirmPassword.placeholder}
              autoComplete="off"
            />

            <CheckboxField name="ageConfirm" control={form.control} label={formFields.ageConfirm} />
            <CheckboxField
              name="termsAgree"
              control={form.control}
              label={
                <>
                  {formFields.termsAgree.prefix}{" "}
                  <Link href="/terms" className="text-mir-bg-accent hover:underline font-semibold">
                    {formFields.termsAgree.terms}
                  </Link>{" "}
                  {formFields.termsAgree.and}{" "}
                  <Link href="/privacy" className="text-mir-bg-accent hover:underline font-semibold">
                    {formFields.termsAgree.privacy}
                  </Link>
                  .
                </>
              }
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {formFields.submit}
            </button>
          </form>
        </Form>
      </div>

      {/* <!-- Sign In Link --> */}
      <div className="text-center mt-6">
        <p className="text-mir-text-secondary">
          {haveAccount.text}{" "}
          <Link href="/auth/sign-in" className="text-mir-bg-accent font-medium hover:underline">
            {haveAccount.link}
          </Link>
        </p>
      </div>

      {/* <!-- Important Notice --> */}
      {/* <div className="mt-8 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
        <p className="text-sm text-mir-text-secondary text-center">
          <strong>Important:</strong> Mirael is not a mental health or crisis service. If you are in crisis, contact
          local emergency services immediately.
        </p>
      </div> */}
    </div>
  );
};

export default SignUpForm;
