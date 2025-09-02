"use client";

import { useCallback, useState } from "react";

import OpenChat from "@/components/chat-ui/open-chat";

type BaseMessage = {
  role: "assistant" | "user";
  content: string;
};

export default function ChatRoute() {
  const [messages, setMessages] = useState<BaseMessage[]>([]);

  const handleUserInput = useCallback((value: string): Promise<string> => {
    console.log(value);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          "It sounds like the weight is piling up. What feels heaviest for you right now—the doubt, the exhaustion, or both together?"
        );
      }, 3000);
    });
  }, []);
  return (
    <main className="h-screen w-screen">
      <OpenChat
        onUserMessageSent={handleUserInput}
        messages={messages}
        onAddMessage={(message) => setMessages((prev) => [...prev, message])}
      />
    </main>
  );
}
