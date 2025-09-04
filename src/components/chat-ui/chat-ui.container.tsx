"use client";

import { useEffect, useRef } from "react";

import { Header, Indicator, MessagesContainer } from "@/components/chat-ui";
import { Input } from "@/components/chat-ui/open-chat";
import { cn } from "@/lib/utils";
import FlowChatHeroCard from "./flow-chat/flow-chat.hero-card";

const DecorativeOrbs = () => (
  <div
    className={cn(
      "decorative-shapes",
      "max-[480px]:rounded-none",
      "absolute top-20 right-0 z-[1]",
      "size-[200px]",
      "overflow-hidden rounded-bl-3xl"
    )}
  >
    <div
      className={cn(
        "shape-1",
        "absolute -top-[50px] -right-[50px]",
        "size-[120px]",
        "rounded-full bg-mir-bg-accent opacity-10"
      )}
    />

    <div
      className={cn(
        "shape-2",
        "absolute top-[20px] right-[30px]",
        "size-[80px]",
        "rounded-full bg-mir-bg-accent opacity-15"
      )}
    />
  </div>
);

interface OpenChatContainerProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  messages: T[];
  isLoading?: boolean;
  renderItem: (message: T, index: number) => React.ReactNode;
  onUserInput?: (value: string) => void;
}

const ChatUIContainer = <T,>({
  className,
  messages = [],
  isLoading = false,
  onUserInput,
  renderItem,
}: OpenChatContainerProps<T>) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages]);

  return (
    <div
      className={cn(
        "max-[480px]:m-0 max-[480px]:h-screen max-[480px]:rounded-none w-full",
        "relative flex flex-col max-w-xl mx-auto h-[calc(100vh-40px)]",
        "mt-5 mb-5",
        "rounded-3xl",
        "bg-mir-bg-card",
        "shadow-[0_8px_30px] shadow-black/12 dark:shadow-black/40",
        "overflow-hidden relative",
        "transition-all duration-300 ease-in",
        className
      )}
    >
      <DecorativeOrbs />
      <Header className=" absolute top-0 inset-x-0 bg-gradient-to-b from-mir-bg-card    to-transparent backdrop-blur-lg backdrop-saturate-150" />
      <MessagesContainer ref={messagesContainerRef} className="pt-[120px] pb-[100px] flex flex-col">
        {messages.length === 0 && <FlowChatHeroCard />}
        {messages.map(renderItem)}
        <Indicator isVisible={isLoading} />
      </MessagesContainer>
      {onUserInput && <Input onSendMessage={onUserInput} className="absolute bottom-0 inset-x-0" />}
    </div>
  );
};

export default ChatUIContainer;
