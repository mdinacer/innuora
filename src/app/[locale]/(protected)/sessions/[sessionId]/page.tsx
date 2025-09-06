"use client";

import React from "react";

import SessionFlowChat from "@/components/chat-ui/flow-chat/flow-chat.main";
import { mockChatMessages } from "@/lib/constants/mock-flow-chat-messages";

export default function SessionRoute() {
  return (
    <main className="h-screen w-screen standalone:w-full">
      <SessionFlowChat messages={mockChatMessages} />
    </main>
  );
}
