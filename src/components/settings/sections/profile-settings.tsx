"use client";

import { format } from "date-fns";
import { Calendar, Mail, Shield, UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/mir-ui/badge";
import UserProfileForm from "@/components/profile/user-profile-form";
import { cn } from "@/lib/utils";
import { useAppUserStore } from "@/stores/app-user.store";

export default function ProfileSettings() {
  const { t } = useTranslation(["pages", "common"]);
  const user = useAppUserStore((state) => state.user);
  const authUser = useAppUserStore((state) => state.authUser);

  const memberSince = authUser?.email_confirmed_at || user?.createdAt || null;

  // Simple translation lookups - no need for useMemo
  const content = {
    anonymousUser: t("settings.profile.anonymousUser"),
    verified: t("settings.profile.verified"),
    memberSince: t("settings.profile.memberSince", { date: memberSince ? format(memberSince, "PP") : " - " }),
    displayName: t("settings.profile.displayName"),
    enterDisplayName: t("settings.profile.enterDisplayName"),
    notSet: t("settings.profile.notSet"),
    emailAddress: t("settings.profile.emailAddress"),
    emailVerificationNotice: t("settings.profile.emailVerificationNotice"),
    language: t("settings.profile.language"),
    cancel: t("settings.profile.cancel"),
    editProfile: t("settings.profile.editProfile"),
    saveChanges: t("settings.profile.saveChanges"),
    accountInformation: t("settings.profile.accountInformation"),
    userId: t("settings.profile.userId"),
    accountType: t("settings.profile.accountType"),
    accountStatus: t("settings.profile.accountStatus"),
    active: t("settings.profile.active"),
    verification: t("settings.profile.verification"),
    emailVerified: t("settings.profile.emailVerified"),
    emailNotVerified: t("settings.profile.emailNotVerified"),
  };

  if (!user || !authUser) return null;

  const { profile } = user;
  const { email } = authUser;

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-6">
          <UserIcon className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Profile Information</h3>
        </div>

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-inn-bg-accent to-inn-bg-flame rounded-full flex items-center justify-center text-2xl font-semibold shadow-lg">
            {profile ? profile.displayName?.charAt(0).toUpperCase() : <UserIcon className="size-8 text-white" />}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-semibold">{profile?.displayName || content.anonymousUser}</h4>
            </div>
            <div className="flex items-center gap-2 text-sm text-inn-text-secondary mb-2">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-inn-text-secondary">
              <Calendar className="h-4 w-4" />
              <span>{content.memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <UserProfileForm />
      </div>

      {/* Email Information */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{content.emailAddress}</h3>
        </div>

        <div className="rounded-xl border border-inn-border-light bg-inn-bg-soft p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">{email}</p>
              <p className="text-xs text-inn-text-secondary">{content.emailVerificationNotice}</p>
            </div>
            <Badge variant="success" className="text-xs">
              {content.verified}
            </Badge>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{content.accountInformation}</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-inn-border-light p-4">
            <div>
              <h4 className="font-semibold mb-1">{content.accountType}</h4>
              <p className="text-sm text-inn-text-secondary">Your current account type</p>
            </div>
            <Badge
              variant={user.role === "admin" ? "destructive" : "default"}
              className={cn(
                "text-xs capitalize",
                user.role === "admin" ? "bg-inn-bg-flame hover:bg-inn-bg-flame-dark" : "bg-inn-bg-accent"
              )}
            >
              {user.role}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-inn-border-light p-4">
            <div>
              <h4 className="font-semibold mb-1">{content.accountStatus}</h4>
              <p className="text-sm text-inn-text-secondary">Your account is active and verified</p>
            </div>
            <Badge variant="success" className="text-xs">
              {content.active}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
