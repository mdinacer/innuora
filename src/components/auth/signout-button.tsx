"use client";

import React, { useCallback } from "react";
import { LogOutIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { signOut } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { clearStoredContentKey } from "@/lib/crypto/webcrypto-crypto";

interface Props {
  scope?: "global" | "local" | "others";
}

const SignoutButton: React.FC<Props> = ({ scope = "global" }) => {
  const { t } = useTranslation("common", { keyPrefix: "actions" });
  const handleSignout = useCallback(async () => {
    await clearStoredContentKey();
    sessionStorage.clear();
    await signOut(scope);
  }, [scope]);
  return (
    <Button
      onClick={handleSignout}
      type="button"
      className="sm:inline-flex hidden items-center gap-2 rounded-2xl border border-inn-border-light px-4 py-2 text-sm font-medium text-inn-text-primary bg-transparent hover:text-destructive-foreground hover:bg-destructive/20  hover:border-destructive/70 transition-all"
    >
      <LogOutIcon className="size-4 shrink-0" />
      <span className=" sr-only sm:not-sr-only rtl:font-arabic-body">{t("signout", { defaultValue: "Sign out" })}</span>
    </Button>
  );
};

export default SignoutButton;
