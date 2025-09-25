"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, Globe, Mail, User, UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppUserStore } from "@/stores/app-user.store";

export default function ProfileSettings() {
  const {
    t,
    i18n: { language },
  } = useTranslation(["pages", "common"]);
  const [locale, setLocale] = useState<AppLocales>(language as AppLocales);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const user = useAppUserStore((state) => state.user);
  const authUser = useAppUserStore((state) => state.authUser);

  const memberSince = authUser?.email_confirmed_at || user?.createdAt || null;

  const content = useMemo(
    () => ({
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
    }),
    [memberSince, t]
  );

  if (!user || !authUser) return null;

  const { profile } = user;
  const { email, email_confirmed_at: emailConfirmedAt } = authUser;
  const emailConfirmed = !!emailConfirmedAt;

  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-inn-bg-accent to-inn-bg-flame rounded-full flex items-center justify-center text-2xl font-semibold">
            {profile ? profile.displayName?.charAt(0).toUpperCase() : <UserIcon className="size-8" />}
          </div>
          {/* <button className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors">
            <Camera className="h-3 w-3 " />
          </button> */}
        </div>

        {/* Basic Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold ">{profile?.displayName || content.anonymousUser}</h3>
            {emailConfirmed && (
              <Badge variant="outline" className="text-xs">
                {content.verified}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm  mb-3">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm ">
            <Calendar className="h-4 w-4" />
            <span>{content.memberSince}</span>
          </div>
        </div>

        {/* Edit Button */}
        <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? content.cancel : content.editProfile}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Profile Details */}
      <div className="space-y-6">
        {/* Display Name */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="display-name" className="text-sm font-medium text-inn-text-secondary flex items-center gap-2">
            <User className="h-4 w-4" />
            {content.displayName}
          </label>
          <div className="col-span-2">
            {isEditing ? (
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={content.enterDisplayName}
              />
            ) : (
              <span className="">{profile?.displayName || content.notSet}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-sm font-medium text-inn-text-secondary flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {content.emailAddress}
          </div>
          <div className="col-span-2">
            <span className="">{email}</span>
            <p className="text-xs text-gray-500 mt-1">{content.emailVerificationNotice}</p>
          </div>
        </div>

        {/* Language */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="language" className="text-sm font-medium text-inn-text-secondary flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {content.language}
          </label>
          <div className="col-span-2">
            {isEditing ? (
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as AppLocales)}
                id="language"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["en", "ar", "fr"].map((lang) => (
                  <option key={lang} value={lang}>
                    {t(lang, { ns: "common", keyPrefix: "languages" })}
                  </option>
                ))}
              </select>
            ) : (
              <span className="">{t(locale, { ns: "common", keyPrefix: "languages" })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Save Changes */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            {content.cancel}
          </Button>
          <Button onClick={() => setIsEditing(false)}>{content.saveChanges}</Button>
        </div>
      )}

      {/* Account Information */}
      <div className="rounded-lg p-6">
        <h4 className="font-medium  mb-4">{content.accountInformation}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="">{content.userId}</span>
            <span className="ml-2 font-mono text-xs">*****</span>
          </div>
          <div>
            <span className="">{content.accountType}</span>
            <span
              className={cn("ml-2 capitalize", user.role === "admin" ? "text-inn-bg-accent" : "text-inn-bg-secondary")}
            >
              {user.role}
            </span>
          </div>
          <div>
            <span className="">{content.accountStatus}</span>
            <Badge variant="default" className="ml-2 text-xs">
              Active
            </Badge>
          </div>
          <div>
            <span className="">{content.verification}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {emailConfirmed ? content.emailVerified : content.emailNotVerified}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
