"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { resetPassword } from "@/app/actions/auth-actions";
import TextField from "@/components/input/text-field";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const ResetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

const PasswordResetForm: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    setStatus("idle");
    setMessage("");

    try {
      await resetPassword(data.email);
      setStatus("success");
      setMessage("Check your email for a password reset link.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to send reset email");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextField
          control={form.control}
          name="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
        />

        {status === "success" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="size-5 text-green-600 shrink-0" />
              <p className="text-green-800 dark:text-green-200">{message}</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
            <div className="flex items-center gap-3">
              <XCircleIcon className="size-5 text-red-600 shrink-0" />
              <p className="text-red-800 dark:text-red-200">{message}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          )}
        >
          {isSubmitting && (
            <div className="inline-block size-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
          )}
          Send reset link
        </button>
      </form>
    </Form>
  );
};

export default PasswordResetForm;
