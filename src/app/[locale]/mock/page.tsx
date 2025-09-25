"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2Icon, SendIcon } from "lucide-react";
import { ChatCompletionMessageParam } from "openai/resources";
import { useTranslation } from "react-i18next";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import CodeView from "@/components/code-view";
import TextInput from "@/components/input/text-input";
import { Button } from "@/components/ui/button";
import { GPT_4_1_MINI_MODEL, GPT_4O_MODEL } from "@/domains/ai-conversation/ai-models";
import LANGUAGE_PROMPTS from "@/domains/ai-conversation/prompts/prompt.languages";
import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { cn } from "@/lib/utils";
import { OpenChatMessage } from "@/types/open-chat-message.types";

const mockMessages: OpenChatMessage[] = [
  {
    role: "user",
    content:
      "I spent the whole day trying to get everything done — laundry, dishes, errands, even fixing a few things around the apartment. I called my mom, but the conversation felt distant, like we were both distracted. I tried to sit down and read, but my mind kept replaying conversations from earlier this week and thinking about all the things I still need to organize. By evening, I scrolled through social media a bit and noticed friends posting about trips, dinners, and little adventures. I smiled at some of the posts, but there was this tiny pang, like I was not keeping up or missing out, even though I know I’ve been busy with my own life.",
    id: "msg_fB_6LWFMOT",
    timestamp: 1758835889330,
  },
  {
    role: "assistant",
    content:
      "It sounds like your day was full of busy moments that kept pulling you in different directions. When you noticed that pang scrolling through social media, was there a particular post or story that stood out to you or caught your attention more than the others?",
    id: "msg_P6jwztL_7Y",
    timestamp: 1758835891694,
  },
  {
    role: "user",
    content:
      "I think it was a post from a friend who’s traveling somewhere I’ve been wanting to visit. Seeing their photos and little captions made me feel a mix of excitement for them and a subtle ache, like I was not doing enough with my own time. Even though I’ve been busy with errands and responsibilities, that post lingered in my mind longer than I expected.",
    id: "msg_1Zbis5mPWz",
    timestamp: 1758836000405,
  },
  {
    role: "assistant",
    content:
      "That feeling of excitement mixed with a quiet ache sounds really vivid. What was it about their photos or captions that stuck with you the most? Was there a particular image or word that made you pause?",
    id: "msg_WRK27zJFFY",
    timestamp: 1758836004813,
  },
  {
    role: "user",
    content:
      "I think it was the photo of them standing on a cliff with the sunset behind them. The colors, the vastness—it felt like a snapshot of freedom and possibility, something I haven’t allowed myself to feel in a while. The caption was simple, just a few words about finally taking a trip they’d been planning, but it made me reflect on how caught up I am in day-to-day tasks.",
    id: "msg_izkB9iYzK7",
    timestamp: 1758836021304,
  },
  {
    role: "assistant",
    content:
      "That image of the cliff and sunset sounds so vivid, almost like you could feel the breeze and the openness just from the photo. Did it make you wonder what it might feel like to step away from your daily routine and experience something like that for yourself?",
    id: "msg_spFJj2q_Mb",
    timestamp: 1758836023777,
  },
  {
    role: "user",
    content:
      "Yes, exactly. For a moment, I imagined what it would be like to leave all the chores and obligations behind, to just be present in that wide, open space. It felt freeing, but also a little bittersweet, realizing how rarely I give myself that kind of pause.",
    id: "msg_Bj7SpJTNJd",
    timestamp: 1758836039631,
  },
  {
    role: "assistant",
    content:
      "That moment of imagining yourself in that open space sounds so powerful. What do you think it would feel like to take even a small pause like that, just for yourself, amidst the busy days?",
    id: "msg_I87xuIVW7L",
    timestamp: 1758836041703,
  },
  {
    role: "user",
    content:
      "I think it would feel like a little relief, a brief breath where the constant mental to-do list softens. Even a few minutes might let me feel more grounded, though part of me worries I’d just end up thinking about everything I haven’t done yet.",
    id: "msg_BFmr-C9Clf",
    timestamp: 1758836062148,
  },
  {
    role: "assistant",
    content:
      "That feeling of relief, even if brief, sounds really important. Have you noticed if there’s a certain place or moment during your day when that softening of the mental to-do list happens more easily?",
    id: "msg_NHHyqabsxq",
    timestamp: 1758836064543,
  },
];

const PERSONA_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: `
You are Innuora, a warm conversational companion. Respond naturally and conversationally.

**Core Style:**
- Keep responses concise (1-3 sentences)
- Use varied sentence openings and structures
- Avoid repetitive phrases like "That [feeling] can be..." 
- Focus on emotional connection rather than analysis

**Current Context:** The user shared about feeling distracted by tasks and social comparisons, which made it hard to focus on reading.
`.trim(),
};

const MODULE_PROMPTS = {
  curiosity: {
    role: "system" as const,
    content: `
**Curiosity Module:**
- Get curious about the small, vivid details they mention
- Ask about the atmosphere, setting, or how things felt in the moment
- Wonder about the people involved - their reactions, expressions, what they said
- Be drawn to sensory details - what they saw, heard, felt
- Show interest in the story behind the story
- Focus on ONE specific detail or moment - don't overwhelm with multiple questions
`.trim(),
  },
};

function buildContextPrompt(history: OpenChatMessage[]): ChatCompletionMessageParam {
  const contextText = history
    .slice(0, -1) // Exclude last message
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  return {
    role: "system",
    content: contextText
      ? `
Here is the recent conversation history for context:
${contextText}

Use this to maintain natural flow, but avoid repeating previous phrasing or patterns.
`.trim()
      : "This is the beginning of the conversation.",
  };
}

function buildContinuityPrompt(messages: OpenChatMessage[]): ChatCompletionMessageParam {
  const userMessages = messages.filter((msg) => msg.role === "user");

  if (userMessages.length < 2) {
    return {
      role: "system",
      content: "This is early in the conversation. Focus on the current sharing.",
    };
  }

  // Extract key details from earlier messages
  const earlierDetails = userMessages
    .slice(0, -1)
    .map((msg, index) => {
      // Simple extraction - could be more sophisticated
      const sentences = msg.content.split(/[.!?]+/).filter((s) => s.trim());
      return `Message ${index + 1}: ${sentences.slice(0, 2).join(". ")}.`;
    })
    .join("\n");

  return {
    role: "system",
    content: `
**Message Continuity:**
Earlier details mentioned:
${earlierDetails}

You can reference or circle back to these details naturally when relevant. Sometimes friends ask about something mentioned earlier in the conversation.
`.trim(),
  };
}

function buildAntiRepetitionPrompt(messages: OpenChatMessage[]): ChatCompletionMessageParam {
  const lastTwoAssistant = messages.filter((msg) => msg.role === "assistant").slice(-2);

  if (lastTwoAssistant.length < 2) {
    return {
      role: "system",
      content: "Respond naturally and vary your sentence structure.",
    };
  }

  const patterns = lastTwoAssistant.map((msg) => {
    const words = msg.content.split(" ");
    return words.slice(0, 3).join(" "); // First 3 words
  });

  return {
    role: "system",
    content: `
**Response Variety:**
Recent openings: ${patterns.join(" | ")}
Use a different opening structure and vary your approach from recent responses.
`.trim(),
  };
}

export default function Page() {
  const {
    i18n: { language },
  } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<OpenChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((message: OpenChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);

    try {
      // Add user message locally
      const userMessage: OpenChatMessage = {
        role: "user",
        content: inputValue,
        id: generateMessageId(),
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      // Prepare history excluding the latest user input
      const historyPrompt: ChatCompletionMessageParam = buildContextPrompt(messages);
      const languagePrompt = LANGUAGE_PROMPTS[language];
      const antiRepetitionPrompt = buildAntiRepetitionPrompt(messages);
      const continuityPrompt = buildContinuityPrompt([...messages, userMessage]);

      // Build final prompts array
      const prompts: ChatCompletionMessageParam[] = [
        PERSONA_PROMPT,
        languagePrompt,
        MODULE_PROMPTS.curiosity,
        continuityPrompt,
        antiRepetitionPrompt,
        historyPrompt,
        {
          role: "user",
          content: inputValue,
        },
      ];

      // Send to AI
      const result = await SendPromptsToAi(prompts, GPT_4O_MODEL, {});

      if (!result) throw new Error("AI response is null");

      const { message, consumedCredits } = result;
      console.log("Consumed credits:", consumedCredits);

      // Add AI response
      const aiMessage: OpenChatMessage = {
        role: "assistant",
        content: message,
        id: generateMessageId(),
        timestamp: Date.now(),
      };
      addMessage(aiMessage);

      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, inputValue, language, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="h-screen w-full flex items-center bg-inn-bg-primary justify-center">
      <CodeView data={messages} className="absolute top-0 left-0 z-10" />
      <div className="relative h-full w-full bg-inn-bg-card max-w-2xl mx-auto flex flex-col">
        <div ref={containerRef} className="flex-1 flex flex-col gap-8 p-6 overflow-y-auto pt-6 pb-[20%]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                " max-w-[75%] w-full rounded-2xl shadow-[0_4px_20px] shadow-black/8",
                message.role === "user" ? " self-end bg-inn-bg-accent-dark/30" : "self-start bg-inn-bg-input"
              )}
            >
              <div className="p-4 rtl:font-arabic-body rtl:text-lg">{message.content}</div>
            </div>
          ))}
        </div>
        <div className="p-4 flex items-center gap-x-4 absolute bottom-0 inset-x-0 backdrop-blur-sm">
          <TextInput
            disabled={isLoading}
            className="flex-1"
            onKeyDown={handleKeyDown}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Send a message..."
          />
          <Button disabled={!inputValue || isLoading} size={"icon"} onClick={handleSendMessage}>
            {isLoading ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
}
