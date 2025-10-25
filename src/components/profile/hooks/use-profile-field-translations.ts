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
  const { t } = useTranslation(["pages/account", "common"]);

  const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
  const buildEnum = <T extends string>(items: Array<{ value: T; label: string }>): Record<T, string> => {
    return items.reduce(
      (acc, item) => {
        acc[item.value] = item.label;
        return acc;
      },
      {} as Record<T, string>
    );
  };

  return useMemo(() => {
    const ageGroupList = toArray<{ label: string; value: AgeGroup }>(
      t("lists.age-group.list", { returnObjects: true, defaultValue: [] })
    );
    const identityConnectionList = toArray<{
      label: string;
      value: IdentityConnectionLevel;
      description: string;
    }>(t("lists.identity_connection.list", { returnObjects: true, defaultValue: [] }));
    const socialPressureList = toArray<{
      label: string;
      value: SocialPressureSource;
      description: string;
    }>(t("lists.social_pressure.list", { returnObjects: true, defaultValue: [] }));
    const emotionalConcernsList = toArray<{
      label: string;
      value: EmotionalConcern;
      description: string;
    }>(t("lists.emotional_concerns.list", { returnObjects: true, defaultValue: [] }));
    const copingMechanismList = toArray<{
      label: string;
      value: CopingMechanism;
      description: string;
    }>(t("lists.coping_mechanism.list", { returnObjects: true, defaultValue: [] }));
    const emotionalAspirationsList = toArray<{
      label: string;
      value: EmotionalAspirations;
      description: string;
    }>(t("lists.emotional_aspirations.list", { returnObjects: true, defaultValue: [] }));

    return {
      ageGroup: {
        list: ageGroupList,
        enum: buildEnum(ageGroupList),
      },
      identityConnection: {
        list: identityConnectionList,
        enum: buildEnum(identityConnectionList),
      },
      socialPressure: {
        list: socialPressureList,
        enum: buildEnum(socialPressureList),
      },
      emotionalConcerns: {
        list: emotionalConcernsList,
        enum: buildEnum(emotionalConcernsList),
      },
      copingMechanism: {
        list: copingMechanismList,
        enum: buildEnum(copingMechanismList),
      },
      emotionalAspirations: {
        list: emotionalAspirationsList,
        enum: buildEnum(emotionalAspirationsList),
      },
    };
  }, [t]);
}

/**
 * Hook to get profile field labels
 */
export function useProfileFieldLabels() {
  const { t } = useTranslation(["pages/account", "common"]);

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
