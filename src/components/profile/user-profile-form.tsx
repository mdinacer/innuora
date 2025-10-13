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
