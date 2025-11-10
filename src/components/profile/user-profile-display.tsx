/**
 * User Profile Display Component (View Mode)
 * Separated from edit mode for better maintainability
 * Cyclomatic complexity: 4 (down from 18)
 */

import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserProfileInput } from "@/lib/zod/user-profile.schema";
import { useProfileFieldLabels, useProfileFieldTranslations } from "./hooks/use-profile-field-translations";
import { ProfileFieldList, ProfileFieldRow } from "./profile-field-row";

interface UserProfileDisplayProps {
  profile: UserProfileInput;
  onEdit: () => void;
  className?: string;
}

export const UserProfileDisplay = React.memo<UserProfileDisplayProps>(({ profile, onEdit, className }) => {
  const fields = useProfileFieldLabels();
  const data = useProfileFieldTranslations();

  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
      <div className="flex md:flex-row flex-col gap-y-2 items-center justify-between">
        <p className="text-sm text-muted-foreground mb-2">{fields.description}</p>
        <Button
          size="lg"
          variant="primary"
          className="w-full md:w-auto shadow-lg hover:-translate-y-0.5"
          onClick={onEdit}
        >
          {fields.actions.edit}
        </Button>
      </div>

      <div className="grid gap-6 w-full">
        <ProfileFieldRow label={fields.displayName} value={profile.displayName} />

        <ProfileFieldRow label={fields.ageGroup} value={profile.ageGroup ? data.ageGroup.enum[profile.ageGroup] : ""} />

        <ProfileFieldRow
          label={fields.identityConnection}
          value={profile.identityConnection ? data.identityConnection.enum[profile.identityConnection] : ""}
        />

        <ProfileFieldList
          label={fields.socialPressure.title}
          items={profile.socialPressureSources.map((source) => data.socialPressure.enum[source])}
        />

        <ProfileFieldList
          label={fields.emotionalConcerns.title}
          items={profile.emotionalConcerns.map((concern) => data.emotionalConcerns.enum[concern])}
        />

        <ProfileFieldRow
          label={fields.copingMechanism}
          value={profile.copingMechanism ? data.copingMechanism.enum[profile.copingMechanism] : ""}
        />

        <ProfileFieldList
          label={fields.emotionalAspirations.title}
          items={profile.emotionalAspirations.map((aspiration) => data.emotionalAspirations.enum[aspiration])}
        />
      </div>
    </div>
  );
});

UserProfileDisplay.displayName = "UserProfileDisplay";
