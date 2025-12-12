"use client";

import type { ConversationMessage } from "../types/continuous-memory.types";

interface MessageListProps {
  messages: ConversationMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs mt-2 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
