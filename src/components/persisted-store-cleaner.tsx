"use client";

import { useEffect } from "react";

import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";

const PersistedStoreCleaner = () => {
  useEffect(() => {
    const handleExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      alert("Are you sure you want to leave?");
      const options = useEncryptedSessionStore.persist.clearStorage();
      console.log("Cleaning up persisted store", options);
      return (event.returnValue = "Are you sure you want to leave?");
    };

    window.addEventListener("beforeunload", handleExit);
    return () => window.removeEventListener("beforeunload", handleExit);
  }, []);
  return null;
};

export default PersistedStoreCleaner;
