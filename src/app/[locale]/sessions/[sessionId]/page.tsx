"use client";

import React from "react";

import SessionFlowChat from "@/components/chat-ui/flow-chat/flow-chat.main";
import { mockChatMessages } from "@/constants/mock-flow-chat-messages";

export default function SessionRoute() {
  return (
    <main className="h-screen w-screen">
      <SessionFlowChat messages={mockChatMessages} />
    </main>
  );
}
