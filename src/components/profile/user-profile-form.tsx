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
  SocialPressureSource,
} from "@prisma/client";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { updateCurrentUser } from "@/app/actions/user-actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserProfileInput, UserProfileSchema } from "@/lib/zod/user-profile.schema";
import { useAppUserStore } from "@/stores/app-user.store";
import CheckboxGroupField from "../input/checkbox-group-field";
import RadiogroupField from "../input/radio-group-field";
import TextField from "../input/text-field";
import { Button } from "../mir-ui/button";
import { Form } from "../ui/form";

interface Props {
  className?: string;
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

const UserProfileForm: React.FC<Props> = ({}) => {
  const { t } = useTranslation(["common"]);
  const user = useAppUserStore((state) => state.user);
  const updateUser = useAppUserStore((state) => state.updateUser);
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<UserProfileInput>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: user?.profile ? UserProfileSchema.parse(user.profile) : defaultValues,
  });

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
        updateUser(result.data);

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
      <div className="flex flex-col gap-y-6">
        <div className="flex md:flex-row flex-col  gap-y-2 items-center justify-between">
          <p className="text-sm text-inn-text-secondary mb-2">
            Your profile helps Innuora provide personalized support. Update it anytime your situation changes.
          </p>
          <Button className="w-full md:w-auto justify-center text-nowrap" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
        <div className="grid gap-6 w-full">
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Display Name</span>
            <span className="col-span-2">{formValues.displayName}</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Age Group</span>
            <span className="col-span-2">{data.ageGroup.enum[formValues.ageGroup!]}</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Identity Connection</span>
            <span className="col-span-2">{data.identityConnection.enum[formValues.identityConnection!]}</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Social Pressure Sources</span>
            <ul className="list-disc list-inside col-span-2">
              {formValues.socialPressureSources.map((source) => (
                <li className="list-item" key={source}>
                  {data.socialPressure.enum[source]}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Emotional Concerns</span>
            <ul className="list-disc list-inside col-span-2">
              {formValues.emotionalConcerns.map((source) => (
                <li className="list-item" key={source}>
                  {data.emotionalConcerns.enum[source]}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Coping Mechanisms</span>
            <span className="col-span-2">{data.copingMechanism.enum[formValues.copingMechanism!]}</span>
          </div>

          <div className="grid grid-cols-3">
            <span className="text-sm text-inn-text-secondary">Emotional Aspirations</span>
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
    <div>
      <Form {...form}>
        <form className=" grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <TextField control={form.control} name="displayName" label="Display Name" />

          <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="age-group">
            <AccordionItem
              value="age-group"
              className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
            >
              <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
                Age Group
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
                Identity Connection
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
                Social Pressure
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
                  helperText="Select up to 4"
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="emotional-concerns"
              className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
            >
              <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
                Emotional Concerns
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
                  helperText="Select up to 4"
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="coping_mechanism"
              className="rounded-xl border border-inn-border-light bg-inn-bg-soft overflow-hidden"
            >
              <AccordionTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-inn-bg-secondary transition border-none font-semibold text-base">
                Coping Mechanism
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
                Emotional Aspirations
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
                  helperText="Select up to 3"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="submit"
              className="mt-4 justify-center col-span-2"
              disabled={!isValid || !isDirty || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={() => {
                // Reset form to original values
                form.reset(user?.profile ? UserProfileSchema.parse(user.profile) : defaultValues);
                setIsEditing(false);
              }}
              type="button"
              variant={"outline"}
              className="mt-4 justify-center"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserProfileForm;
