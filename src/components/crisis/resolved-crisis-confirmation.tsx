"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useCrisisStore } from "@/stores/crisis-store";
import { Button } from "../ui/button";

const ResolvedCrisisConfirmation = () => {
  const { t } = useTranslation(["pages/crisis"]);
  const router = useRouter();
  const getLastEvent = useCrisisStore((state) => state.getLastEvent);

  const lastEvent = useMemo(() => getLastEvent(), [getLastEvent]);

  const handleResolvedCrisisConfirmation = () => {
    const crisisStoreState = useCrisisStore.getState();
    if (lastEvent) {
      crisisStoreState.updateEvent(lastEvent.id, { resolvedAt: Date.now() });
    }
    crisisStoreState.setCrisisState("none");
    crisisStoreState.setCrisisLevel("none");

    router.push("/sessions");
  };
  return (
    <div className="text-center pt-2">
      <Button
        variant={"link"}
        onClick={handleResolvedCrisisConfirmation}
        className="text-base text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-dotted"
      >
        {t("crisis.exit")}
      </Button>
    </div>
  );
};

export default ResolvedCrisisConfirmation;
