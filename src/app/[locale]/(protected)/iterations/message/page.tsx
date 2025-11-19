"use client";

import { AssistantChatMessage } from "@/domains/guidance-flow/types/chat-message";
import MessageBubble from "../../production/components/message-bubble";

export default function Page() {
  return (
    <main className=" min-h-screen w-screen bg-background flex items-center justify-center">
      <MessageBubble message={mockAssistantMessage} />
    </main>
  );
}

const mockAssistantMessage: AssistantChatMessage = {
  id: "msg_001",
  role: "assistant",
  content:
    "It sounds like you're carrying more than you let on. That quiet heaviness usually shows up when you've been holding everything together for too long.",

  psychoeducation: {
    category: "perfectionism",
    subject: "rest and perfectionism",
    content:
      "Perfectionism often keeps us in a cycle of doing, making it hard to feel like we deserve rest. When we redefine what 'enough' means, we can start to find space for ourselves.",
    contextual_anchor: "It’s like there’s always one more thing to fix.",
  },

  follow_up_question: "How does it feel to hold onto that belief now?",

  next_action: {
    type: "cognitive_work",
    label: "Write one sentence about what 'good enough' means for you tonight.",
    rationale: "This can help you reflect on your standards and create space for self-compassion.",
    confidence: 0.7,
  },

  // BaseChatMessage fields depending on your implementation
  timestamp: Date.now(),
};
const mockAssistantMessage2: AssistantChatMessage = {
  id: "msg_001",
  role: "assistant",
  content:
    "It sounds like you're carrying more than you let on. That quiet heaviness usually shows up when you've been holding everything together for too long.",

  psychoeducation: {
    category: "perfectionism",
    subject: "rest and perfectionism",
    content:
      "Perfectionism often keeps us in a cycle of doing, making it hard to feel like we deserve rest. When we redefine what 'enough' means, we can start to find space for ourselves.",
    contextual_anchor: "It’s like there’s always one more thing to fix.",
  },

  follow_up_question: "How does it feel to hold onto that belief now?",

  next_action: {
    type: "micro_task",
    label: "Take one deep breath and let your shoulders relax for a moment.",
    rationale: "A small physical release can offer a brief pause in the constant doing.",
    confidence: 0.75,
  },

  // BaseChatMessage fields depending on your implementation
  timestamp: Date.now(),
};
