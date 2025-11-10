import { User as AuthUser } from "@supabase/supabase-js";
import { format } from "date-fns";
import { CalendarIcon, CreditCardIcon, ShieldIcon, UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import initTranslations, { AppLocales } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { UserWithRelations } from "@/types/user.types";
import UserProfileForm from "./user-profile-form";

interface Props {
  className?: string;
  authUser: AuthUser;
  user: UserWithRelations;
  locale?: AppLocales;
}

const AccountPage: React.FC<Props> = async ({ className, authUser, user, locale = "en" }) => {
  const { t } = await initTranslations(locale, ["pages/account"]);

  const { title, subtitle, sections } = {
    title: t("account.title"),
    subtitle: t("account.subtitle"),
    sections: {
      profile: {
        title: t("account.sections.profile.title"),
        memberSince: t("account.sections.profile.memberSince", {
          date: format(new Date(authUser.email_confirmed_at || user.createdAt), "PP"),
        }),
        noDisplayName: t("account.placeholders.noDisplayName"),
      },
      email: {
        title: t("account.sections.email.title"),
        immutableNotice: t("account.sections.email.immutableNotice"),
        verified: t("account.sections.email.verified"),
      },
      account: {
        title: t("account.sections.account.title"),
        typeLabel: t("account.sections.account.typeLabel"),
        typeDescription: t("account.sections.account.typeDescription"),
        statusLabel: t("account.sections.account.statusLabel"),
        statusDescription: t("account.sections.account.statusDescription"),
      },
    },
  };
  return (
    <div className={cn("max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12", className)}>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* <!-- Profile Information --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="size-5 text-primary shrink-0" />
            <h3 className="text-xl font-bold">{sections.profile.title}</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold shadow-lg">
              {user.profile?.displayName?.charAt(0) || <UserIcon />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold">{user.profile?.displayName || sections.profile.noDisplayName}</h4>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CreditCardIcon className="size-4 shrink-0" />
                <span>{authUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="size-4 shrink-0" />
                <span>{sections.profile.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        <UserProfileForm
          userProfile={user.profile!}
          className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg"
        />

        {/* <!-- Email Information --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="size-5 text-primary shrink-0" />

            <h3 className="text-xl font-bold">{sections.email.title}</h3>
          </div>

          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium mb-1">{authUser.email}</p>
                <p className="text-xs text-muted-foreground">{sections.email.immutableNotice}</p>
              </div>
              <Badge variant={"success"}>{sections.email.verified}</Badge>
            </div>
          </div>
        </div>

        {/* <!-- Account Information --> */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ShieldIcon className="size-5 text-primary shrink-0" />

            <h3 className="text-xl font-bold">{sections.account.title}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border p-4 gap-3">
              <div>
                <h4 className="font-semibold mb-1">{sections.account.typeLabel}</h4>
                <p className="text-sm text-muted-foreground">{sections.account.typeDescription}</p>
              </div>
              <Badge className="uppercase" variant={"info"}>
                {user.role}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border p-4 gap-3">
              <div>
                <h4 className="font-semibold mb-1">{sections.account.statusLabel}</h4>
                <p className="text-sm text-muted-foreground">{sections.account.statusDescription}</p>
              </div>
              <Badge className="uppercase" variant={"success"}>
                {user.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
