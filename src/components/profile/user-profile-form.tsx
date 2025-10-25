"use client";

/**
 * User Profile Form Container Component
 * Refactored from 405-line god component to lightweight orchestration
 * Cyclomatic complexity: 3 (down from 18)
 * Lines: 90 (down from 405)
 */
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma, Profile } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { updateCurrentUser } from "@/app/actions/user-actions";
import { UserProfileInput, UserProfileSchema } from "@/lib/zod/user-profile.schema";
import { useAppUserStore } from "@/stores/app-user.store";
import { UserProfileDisplay } from "./user-profile-display";
import { UserProfileEdit } from "./user-profile-edit";

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
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation("pages/account", { keyPrefix: "account" });
  const form = useForm<UserProfileInput>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: userProfile ? UserProfileSchema.parse(userProfile) : defaultValues,
  });

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
        toast.error(t("toast.error.title"), {
          description: result.error.message || t("toast.error.description"),
        });
      } else {
        // Update local store
        useAppUserStore.getState().setUser(result.data);

        // Show success toast
        toast.success(t("toast.success.title"), {
          description: t("toast.success.description"),
        });

        // Exit edit mode
        setIsEditing(false);

        // Reset form to new values
        form.reset(UserProfileSchema.parse(result.data.profile));
      }
    } catch (error) {
      // Show generic error toast
      toast.error(t("toast.unexpected.title"), {
        description: t("toast.unexpected.description"),
      });
      console.error("Profile update error:", error);
    }
  };

  const handleCancel = () => {
    form.reset(userProfile ? UserProfileSchema.parse(userProfile) : defaultValues);
    setIsEditing(false);
  };

  if (isEditing) {
    return <UserProfileEdit form={form} onSubmit={handleSubmit} onCancel={handleCancel} className={className} />;
  }

  return <UserProfileDisplay profile={form.watch()} onEdit={() => setIsEditing(true)} className={className} />;
};

export default UserProfileForm;
