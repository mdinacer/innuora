/**
 * Custom hook for profile field translations
 * Eliminates 64 lines of repetitive translation boilerplate
 * Adds memoization for performance
 */

import { useMemo } from "react";
import {
  AgeGroup,
  CopingMechanism,
  EmotionalAspirations,
  EmotionalConcern,
  IdentityConnectionLevel,
  SocialPressureSource,
} from "@prisma/client";
import { useTranslation } from "react-i18next";

interface EnumTranslation<T extends string> {
  enum: Record<T, string>;
  list: Array<{
    label: string;
    value: T;
    description?: string;
  }>;
}

export interface ProfileFieldTranslations {
  ageGroup: EnumTranslation<AgeGroup>;
  identityConnection: EnumTranslation<IdentityConnectionLevel>;
  socialPressure: EnumTranslation<SocialPressureSource>;
  emotionalConcerns: EnumTranslation<EmotionalConcern>;
  copingMechanism: EnumTranslation<CopingMechanism>;
  emotionalAspirations: EnumTranslation<EmotionalAspirations>;
}

/**
 * Hook to get all profile field translations with memoization
 * Replaces 64 lines of repetitive translation code
 */
export function useProfileFieldTranslations(): ProfileFieldTranslations {
  const { t } = useTranslation(["pages", "common"]);

  return useMemo(
    () => ({
      ageGroup: {
        enum: (t("lists.age-group.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<AgeGroup, string>,
        list: (t("lists.age-group.list", { returnObjects: true, defaultValue: "" }) || []) as Array<{
          label: string;
          value: AgeGroup;
        }>,
      },
      identityConnection: {
        enum: (t("lists.identity_connection.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
          IdentityConnectionLevel,
          string
        >,
        list: (t("lists.identity_connection.list", { returnObjects: true, defaultValue: "" }) || []) as Array<{
          label: string;
          value: IdentityConnectionLevel;
          description: string;
        }>,
      },
      socialPressure: {
        enum: (t("lists.social_pressure.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
          SocialPressureSource,
          string
        >,
        list: (t("lists.social_pressure.list", { returnObjects: true, defaultValue: "" }) || []) as Array<{
          label: string;
          value: SocialPressureSource;
          description: string;
        }>,
      },
      emotionalConcerns: {
        enum: (t("lists.emotional_concerns.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
          EmotionalConcern,
          string
        >,
        list: (t("lists.emotional_concerns.list", { returnObjects: true, defaultValue: "" }) || []) as Array<{
          label: string;
          value: EmotionalConcern;
          description: string;
        }>,
      },
      copingMechanism: {
        enum: (t("lists.coping_mechanism.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
          CopingMechanism,
          string
        >,
        list: (t("lists.coping_mechanism.list", { returnObjects: true, defaultValue: "" }) || []) as Array<{
          label: string;
          value: CopingMechanism;
          description: string;
        }>,
      },
      emotionalAspirations: {
        enum: (t("lists.emotional_aspirations.enum", { returnObjects: true, defaultValue: "" }) || {}) as Record<
          EmotionalAspirations,
          string
        >,
        list: (t("lists.emotional_aspirations.list", { returnObjects: true, defaultValue: "" }) || []) as Array<{
          label: string;
          value: EmotionalAspirations;
          description: string;
        }>,
      },
    }),
    [t]
  );
}

/**
 * Hook to get profile field labels
 */
export function useProfileFieldLabels() {
  const { t } = useTranslation(["pages", "common"]);

  return useMemo(
    () => ({
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
    }),
    [t]
  );
}
