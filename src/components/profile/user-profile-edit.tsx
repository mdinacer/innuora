/**
 * User Profile Edit Component (Edit Mode)
 * Separated from display mode for better maintainability
 * Cyclomatic complexity: 6 (down from 18)
 */

import React from "react";
import { UseFormReturn } from "react-hook-form";

import CheckboxGroupField from "@/components/input/checkbox-group-field";
import RadiogroupField from "@/components/input/radio-group-field";
import TextField from "@/components/input/text-field";
import { Button } from "@/components/mir-ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { UserProfileInput } from "@/lib/zod/user-profile.schema";
import { useProfileFieldLabels, useProfileFieldTranslations } from "./hooks/use-profile-field-translations";

interface UserProfileEditProps {
  form: UseFormReturn<UserProfileInput>;
  onSubmit: (data: UserProfileInput) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const UserProfileEdit = React.memo<UserProfileEditProps>(({ form, onSubmit, onCancel, className }) => {
  const fields = useProfileFieldLabels();
  const data = useProfileFieldTranslations();

  const { isSubmitting, isValid, isDirty } = form.formState;

  return (
    <Form {...form}>
      <form className={cn("grid gap-4", className)} onSubmit={form.handleSubmit(onSubmit)}>
        <TextField control={form.control} name="displayName" label={fields.displayName} />

        <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="age-group">
          {/* Age Group */}
          <AccordionItem
            value="age-group"
            className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
          >
            <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
              {fields.ageGroup}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col p-4 pt-0 gap-4 text-balance">
              <RadiogroupField
                control={form.control}
                name="ageGroup"
                data={data.ageGroup.list}
                labelExtractor={(item) => item.label}
                valueExtractor={(item) => item.value}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Identity Connection */}
          <AccordionItem
            value="identity-connection"
            className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
          >
            <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
              {fields.identityConnection}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col p-4 pt-0 gap-4 text-balance">
              <RadiogroupField
                control={form.control}
                name="identityConnection"
                data={data.identityConnection.list}
                labelExtractor={(item) => item.label}
                valueExtractor={(item) => item.value}
                descriptionExtractor={(item) => item.description || ""}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Social Pressure */}
          <AccordionItem
            value="social-pressure"
            className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
          >
            <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
              {fields.socialPressure.title}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col p-4 pt-0 gap-4 text-balance">
              <CheckboxGroupField
                maxSelected={4}
                control={form.control}
                name="socialPressureSources"
                data={data.socialPressure.list}
                labelExtractor={(item) => item.label}
                valueExtractor={(item) => item.value}
                descriptionExtractor={(item) => item.description || ""}
                helperText={fields.socialPressure.helperText}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Emotional Concerns */}
          <AccordionItem
            value="emotional-concerns"
            className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
          >
            <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
              {fields.emotionalConcerns.title}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col p-4 pt-0 gap-4 text-balance">
              <CheckboxGroupField
                maxSelected={4}
                control={form.control}
                name="emotionalConcerns"
                data={data.emotionalConcerns.list}
                labelExtractor={(item) => item.label}
                valueExtractor={(item) => item.value}
                descriptionExtractor={(item) => item.description || ""}
                helperText={fields.emotionalConcerns.helperText}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Coping Mechanism */}
          <AccordionItem
            value="coping_mechanism"
            className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
          >
            <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
              {fields.copingMechanism}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col p-4 pt-0 gap-4 text-balance">
              <RadiogroupField
                control={form.control}
                name="copingMechanism"
                data={data.copingMechanism.list}
                labelExtractor={(item) => item.label}
                valueExtractor={(item) => item.value}
                descriptionExtractor={(item) => item.description || ""}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Emotional Aspirations */}
          <AccordionItem
            value="emotional_aspirations"
            className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
          >
            <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
              {fields.emotionalAspirations.title}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col p-4 pt-0 gap-4 text-balance">
              <CheckboxGroupField
                maxSelected={3}
                control={form.control}
                name="emotionalAspirations"
                data={data.emotionalAspirations.list}
                labelExtractor={(item) => item.label}
                valueExtractor={(item) => item.value}
                descriptionExtractor={(item) => item.description || ""}
                helperText={fields.emotionalAspirations.helperText}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            size="lg"
            type="submit"
            className="mt-4 justify-center col-span-2"
            disabled={!isValid || !isDirty || isSubmitting}
          >
            {isSubmitting ? fields.actions.saving : fields.actions.save}
          </Button>
          <Button
            size="lg"
            onClick={onCancel}
            type="button"
            variant="outline"
            className="mt-4 justify-center"
            disabled={isSubmitting}
          >
            {fields.actions.cancel}
          </Button>
        </div>
      </form>
    </Form>
  );
});

UserProfileEdit.displayName = "UserProfileEdit";
