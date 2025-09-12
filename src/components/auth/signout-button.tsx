"use client";

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";

interface Props {
  scope?: "global" | "local" | "others";
}

const SignoutButton: React.FC<Props> = ({ scope = "global" }) => {
  const { t } = useTranslation("common");
  const handleSignout = useCallback(async () => {
    const supabase = createClient();

    await supabase.auth.signOut({ scope });
  }, [scope]);
  return (
    <Button
      onClick={handleSignout}
      type="button"
      className="sm:inline-flex hidden items-center gap-2 rounded-2xl border border-mir-border-light px-4 py-2 text-sm font-medium text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
    >
      {t("signout", { defaultValue: "Sign out" })}
    </Button>
  );
};

export default SignoutButton;
