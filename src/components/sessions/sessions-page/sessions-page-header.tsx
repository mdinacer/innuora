"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const SessionsPageHeader = () => {
  const { t } = useTranslation(["pages"], { keyPrefix: "sessions" });

  const { title, subtitle } = {
    title: t("title"),
    subtitle: t("subtitle"),
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl rtl:font-arabic md:text-4xl font-extrabold leading-tight tracking-tight mb-3">{title}</h1>
      <p className="text-lg text-mir-text-secondary rtl:font-arabic-body">{subtitle} </p>
    </div>
  );
};

export default SessionsPageHeader;
