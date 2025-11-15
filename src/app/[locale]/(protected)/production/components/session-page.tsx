"use client";

import { useState } from "react";

import { Container } from "@/components/chat-ui";
import CodeView from "@/components/code-view";
import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { processUserInput } from "../actions/conversation-actions";
import useSessionPhaseEvaluation from "../domains/phase/hook";
import { useActiveSessionStore } from "../stores/active-session-store";
import { ConversationMessage } from "../types/chat-message";
import MessageBubble from "./message-bubble";

const SessionPage: React.FC = () => {
  const [isProcessing, setProcessing] = useState(false);
  const session = useActiveSessionStore((s) => {
    if (!s.session) throw new Error("Session missing");
    return s.session;
  });

  useSessionPhaseEvaluation(session.id); // Run session phase evaluation check

  const handleUserInput = async (userInput: string) => {
    setProcessing(true);
    const sessionStore = useActiveSessionStore.getState();

    const userMessage: ConversationMessage = {
      id: generateMessageId(),
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    };

    const messagesWindow = [...session.messages].slice(-8);

    sessionStore.appendMessage(userMessage);

    const reflectionResults = await processUserInput(session.id, userInput, messagesWindow);

    console.log("Reflection Results: ", reflectionResults);

    if (reflectionResults.reflection) {
      const assistantMessage: ConversationMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: reflectionResults.reflection,
        timestamp: Date.now(),
      };
      sessionStore.appendMessage(assistantMessage);
    }

    setProcessing(false);
  };

  return (
    <div className="min-h-full h-auto w-full">
      <main className="relative h-screen w-screen bg-background">
        <div className="absolute top-6 left-6">
          <CodeView data={{ session }} />
        </div>

        <Container
          title={"Innuora"}
          subtitle={"Your emotional mirror"}
          messages={session.messages}
          isLoading={isProcessing}
          renderItem={(message) => <MessageBubble key={message.id} message={message} />}
          onUserInput={handleUserInput}
        />
      </main>
    </div>
  );
};

export default SessionPage;
