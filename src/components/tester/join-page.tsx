"use client";

import React, { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createTester } from "@/app/actions/tester-actions";
import TextField from "@/components/input/text-field";
import TextareaField from "@/components/input/textarea-field";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const advancedTesterSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  occupation: z.string().max(100, "Occupation is too long").optional().nullable(),
  struggles: z.string().max(1000, "Struggles text is too long").optional().nullable(),
  coping: z.string().max(1000, "Coping mechanisms text is too long").optional().nullable(),
  source: z.string().max(255, "Source text is too long").optional().nullable(),
  notes: z.string().max(1000, "Notes text is too long").optional().nullable(),
});

type AdvancedTester = z.infer<typeof advancedTesterSchema>;

export type JoinPageData = {
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  form: {
    email: {
      label: string;
      placeholder: string;
      required: string;
    };
    occupation: {
      label: string;
      placeholder: string;
      helpText: string;
    };
    struggles: {
      label: string;
      placeholder: string;
      helpText: string;
    };
    coping: {
      label: string;
      placeholder: string;
      helpText: string;
    };
    source: {
      label: string;
      placeholder: string;
      helpText: string;
    };
    notes: {
      label: string;
      placeholder: string;
      helpText: string;
    };
    submitButton: string;
    thankYouNote: string;
  };
  messages: {
    success: string;
    pending: string;
    error: string;
  };
};

interface Props {
  className?: string;
  pageData: JoinPageData;
}

const JoinPage: React.FC<Props> = ({ className, pageData }) => {
  const form = useForm<AdvancedTester>({
    resolver: zodResolver(advancedTesterSchema),
    defaultValues: {
      email: "",
      occupation: "",
      struggles: "",
      coping: "",
      source: "",
      notes: "",
    },
  });
  const {
    hero,
    form: formData,
    messages: { success, pending, error },
  } = pageData;

  const { isSubmitting } = form.formState;

  const handleOnSubmit = useCallback(
    async (data: AdvancedTester) => {
      try {
        await createTester(data, "/join?status=success");
        //mock api call
        await toast.promise(createTester(data, "/join?status=success"), {
          loading: pending,
          success: success,
          error: error,
        });
      } catch {
        toast.error(error);
      }
    },
    [error, pending, success]
  );

  return (
    <div className={cn("relative pt-20", className)}>
      {/* <!-- Hero Section --> */}
      <section className={"max-w-4xl mx-auto px-6 py-12 text-center"}>
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-inn-bg-accent/25 bg-inn-bg-soft px-3 py-1 text-[13px] font-semibold text-inn-bg-accent">
          {hero.badge}
        </div>
        <h1 className="rtl:font-arabic text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          {hero.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{hero.description} </p>
      </section>

      {/* <!-- Form Section --> */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-[0_4px_20px] shadow-black/8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="grid gap-12">
              {/* <!-- Email (Required) --> */}
              <TextField
                control={form.control}
                name="email"
                label={formData.email.label}
                placeholder={formData.email.placeholder}
                type="email"
                required
              />

              {/* <!-- Occupation/Role (Optional) --> */}
              <TextField
                control={form.control}
                name="occupation"
                label={formData.occupation.label}
                placeholder={formData.occupation.placeholder}
                helperText={formData.occupation.helpText}
              />

              {/* <!-- General Struggles (Optional) --> */}
              <TextareaField
                control={form.control}
                name="struggles"
                label={formData.struggles.label}
                placeholder={formData.struggles.placeholder}
                helperText={formData.struggles.helpText}
              />

              {/* <!-- Coping Mechanisms (Optional) --> */}
              <TextareaField
                control={form.control}
                name="coping"
                label={formData.coping.label}
                placeholder={formData.coping.placeholder}
                helperText={formData.coping.helpText}
              />

              {/* <!-- Source (Optional) --> */}
              <TextField
                control={form.control}
                name="source"
                label={formData.source.label}
                placeholder={formData.source.placeholder}
                helperText={formData.source.helpText}
              />

              {/* <!-- Additional Notes (Optional) --> */}
              <TextareaField
                control={form.control}
                name="notes"
                label={formData.notes.label}
                placeholder={formData.notes.placeholder}
                helperText={formData.notes.helpText}
              />

              {/* <!-- Submit Button --> */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-x-2 justify-center disabled:cursor-not-allowed disabled:opacity-50 rounded-2xl bg-inn-bg-accent px-6 py-4 text-white font-semibold shadow hover:translate-y-[-1px] transition-all duration-200"
                >
                  {isSubmitting && <Loader2Icon className="mr-2 size-5 animate-spin" />}
                  {formData.submitButton}
                </button>
              </div>
            </form>
          </Form>
        </div>

        {/* <!-- Additional Info --> */}
        <div className="mt-8 text-center">
          <p className="text-sm text-inn-text-secondary max-w-lg mx-auto">
            <em>{formData.thankYouNote} </em>
          </p>
        </div>
      </section>
    </div>
  );
};

export default JoinPage;
