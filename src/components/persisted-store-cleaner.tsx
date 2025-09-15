"use client";

import { useEffect } from "react";

import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";

const PersistedStoreCleaner = () => {
  useEffect(() => {
    const handleExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      alert("Are you sure you want to leave?");
      const options = useOpenChatSessionStore.persist.clearStorage();
      console.log("Cleaning up persisted store", options);
      return (event.returnValue = "Are you sure you want to leave?");
    };

    window.addEventListener("beforeunload", handleExit);
    return () => window.removeEventListener("beforeunload", handleExit);
  }, []);
  return null;
};

export default PersistedStoreCleaner;
