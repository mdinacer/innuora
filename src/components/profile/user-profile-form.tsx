"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AgeGroup,
  CopingMechanism,
  EmotionalAspirations,
  EmotionalConcern,
  IdentityConnectionLevel,
  Prisma,
  Profile,
  SocialPressureSource,
} from "@prisma/client";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { updateCurrentUser } from "@/app/actions/user-actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { UserProfileInput, UserProfileSchema } from "@/lib/zod/user-profile.schema";
import { useAppUserStore } from "@/stores/app-user.store";
import CheckboxGroupField from "../input/checkbox-group-field";
import RadiogroupField from "../input/radio-group-field";
import TextField from "../input/text-field";
import { Button } from "../mir-ui/button";
import { Form } from "../ui/form";

interface Props {
  className?: string;
  userProfile?: Profile;
}

const defaultValues: UserProfileInput = {
  displayName: "",
  ageGroup: null,
  identityConnection: null,
  socialPressureSources: [],
  emotionalConcerns: [],
  copingMechanism: null,
  emotionalAspirations: [],
};

const UserProfileForm: React.FC<Props> = ({ className, userProfile }) => {
  const { t } = useTranslation(["pages", "common"]);

  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<UserProfileInput>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: userProfile ? UserProfileSchema.parse(userProfile) : defaultValues,
  });

  const fields = {
    description: t("account.description"),
    displayName: t("account.fields.displayName.label"),
    ageGroup: t("account.fields.ageGroup.title"),
    identityConnection: t("account.fields.identityConnection.title"),
    socialPressure: {
      title: t("account.fields.socialPressure.title"),
      helperText: t("account.fields.socialPressure.helperText"),
    },
    emotionalConcerns: {
      title: t("account.fields.emotionalConcerns.title"),
      helperText: t("account.fields.emotionalConcerns.helperText"),
    },
    copingMechanism: t("account.fields.copingMechanism.title"),
    emotionalAspirations: {
      title: t("account.fields.emotionalAspirations.title"),
      helperText: t("account.fields.emotionalAspirations.helperText"),
    },
    actions: {
      edit: t("account.actions.edit"),
      save: t("account.actions.save"),
      saving: t("account.actions.saving"),
      cancel: t("account.actions.cancel"),
    },
  };

  const data = {
    ageGroup: {
      enum: (t("lists.age-group.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<AgeGroup, string>,
      list: (t("lists.age-group.list", { returnObjects: true, defaultValue: "" }) || []) as {
        label: string;
        value: AgeGroup;
      }[],
    },
    identityConnection: {
      enum: (t("lists.identity_connection.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
        IdentityConnectionLevel,
        string
      >,
      list: (t("lists.identity_connection.list", { returnObjects: true, defaultValue: "" }) || []) as {
        label: string;
        value: IdentityConnectionLevel;
        description: string;
      }[],
    },
    socialPressure: {
      enum: (t("lists.social_pressure.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
        SocialPressureSource,
        string
      >,
      list: (t("lists.social_pressure.list", { returnObjects: true, defaultValue: "" }) || []) as {
        label: string;
        value: SocialPressureSource;
        description: string;
      }[],
    },
    emotionalConcerns: {
      enum: (t("lists.emotional_concerns.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
        EmotionalConcern,
        string
      >,
      list: (t("lists.emotional_concerns.list", { returnObjects: true, defaultValue: "" }) || []) as {
        label: string;
        value: EmotionalConcern;
        description: string;
      }[],
    },
    copingMechanism: {
      enum: (t("lists.coping_mechanism.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
        CopingMechanism,
        string
      >,
      list: (t("lists.coping_mechanism.list", { returnObjects: true, defaultValue: "" }) || []) as {
        label: string;
        value: CopingMechanism;
        description: string;
      }[],
    },
    emotionalAspirations: {
      enum: (t("lists.emotional_aspirations.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
        EmotionalAspirations,
        string
      >,
      list: (t("lists.emotional_aspirations.list", { returnObjects: true, defaultValue: "" }) || []) as {
        label: string;
        value: EmotionalAspirations;
        description: string;
      }[],
    },
  };
  const { isSubmitting, isValid, isDirty } = form.formState;

  const handleSubmit = async (data: UserProfileInput) => {
    try {
      const updateData: Prisma.UserUpdateInput = {
        profile: {
          update: data,
        },
      };

      const result = await updateCurrentUser(updateData);

      if (result.error) {
        // Show error toast
        toast.error("Failed to update profile", {
          description: result.error.message || "An error occurred while updating your profile. Please try again.",
        });
      } else {
        // Update local store
        useAppUserStore.getState().setUser(result.data);

        // Show success toast
        toast.success("Profile updated successfully", {
          description: "Your profile information has been saved.",
        });

        // Exit edit mode
        setIsEditing(false);

        // Reset form to new values
        form.reset(UserProfileSchema.parse(result.data.profile));
      }
    } catch (error) {
      // Show generic error toast
      toast.error("Unexpected error", {
        description: "An unexpected error occurred. Please try again.",
      });
      console.error("Profile update error:", error);
    }
  };

  const formValues = form.watch();

  if (!isEditing) {
    return (
      <div className={cn("flex flex-col gap-y-6", className)}>
        <div className="flex md:flex-row flex-col gap-y-2 items-center justify-between">
          <p className="text-sm text-inn-text-secondary mb-2">{fields.description} </p>
          <Button
            className="w-full md:w-auto rounded-2xl bg-inn-bg-accent px-6 py-3 text-base font-semibold text-white hover:translate-y-[-1px] transition shadow-lg whitespace-nowrap"
            onClick={() => setIsEditing(true)}
          >
            {fields.actions.edit}
          </Button>
        </div>
        <div className="grid gap-6 w-full">
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.displayName}</span>
            <span className="col-span-2">{formValues.displayName}</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.ageGroup}</span>
            <span className="col-span-2">{data.ageGroup.enum[formValues.ageGroup!]}</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.identityConnection}</span>
            <span className="col-span-2">{data.identityConnection.enum[formValues.identityConnection!]}</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.socialPressure.title}</span>
            <ul className="list-disc list-inside col-span-2">
              {formValues.socialPressureSources.map((source) => (
                <li className="list-item" key={source}>
                  {data.socialPressure.enum[source]}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.emotionalConcerns.title}</span>
            <ul className="list-disc list-inside col-span-2">
              {formValues.emotionalConcerns.map((source) => (
                <li className="list-item" key={source}>
                  {data.emotionalConcerns.enum[source]}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.copingMechanism}</span>
            <span className="col-span-2">{data.copingMechanism.enum[formValues.copingMechanism!]}</span>
          </div>

          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">{fields.emotionalAspirations.title}</span>
            <ul className="list-disc list-inside col-span-2">
              {formValues.emotionalAspirations.map((source) => (
                <li className="list-item" key={source}>
                  {data.emotionalAspirations.enum[source]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Form {...form}>
      <form className={cn(" grid gap-4", className)} onSubmit={form.handleSubmit(handleSubmit)}>
        <TextField control={form.control} name="displayName" label={fields.displayName} />

        <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="age-group">
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
                descriptionExtractor={(item) => item.description}
              />
            </AccordionContent>
          </AccordionItem>

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
                descriptionExtractor={(item) => item.description}
                helperText={fields.socialPressure.helperText}
              />
            </AccordionContent>
          </AccordionItem>
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
                descriptionExtractor={(item) => item.description}
                helperText={fields.emotionalConcerns.helperText}
              />
            </AccordionContent>
          </AccordionItem>
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
                descriptionExtractor={(item) => item.description}
              />
            </AccordionContent>
          </AccordionItem>
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
                descriptionExtractor={(item) => item.description}
                helperText={fields.emotionalAspirations.helperText}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-end gap-4">
          <Button
            size={"lg"}
            type="submit"
            className="mt-4 justify-center col-span-2"
            disabled={!isValid || !isDirty || isSubmitting}
          >
            {isSubmitting ? fields.actions.saving : fields.actions.save}
          </Button>
          <Button
            size={"lg"}
            onClick={() => {
              // Reset form to original values
              form.reset(userProfile ? UserProfileSchema.parse(userProfile) : defaultValues);
              setIsEditing(false);
            }}
            type="button"
            variant={"outline"}
            className="mt-4 justify-center"
            disabled={isSubmitting}
          >
            {fields.actions.cancel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserProfileForm;
