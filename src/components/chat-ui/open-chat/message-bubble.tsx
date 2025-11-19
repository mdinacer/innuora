"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ActivityIcon, BookOpenIcon, BookOpenTextIcon, NewspaperIcon } from "lucide-react";
import Markdown from "markdown-to-jsx";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Psychoeducation } from "@/domains/guidance-flow/reflection/types";
import { ConversationMessage } from "@/domains/guidance-flow/types/chat-message";
import { cn } from "@/lib/utils";

interface Props {
  message: ConversationMessage;
  className?: string;
}

const STYLES_MAP = {
  user: "bg-primary text-white rounded-[20px] rtl:rounded-tl-[6px] ltr:rounded-tr-[6px]",
  assistant: "bg-secondary rounded-[20px] ltr:rounded-tl-[6px] rtl:rounded-tr-[6px]",
  system: "bg-secondary rounded-[20px] rounded-tl-[6px]",
};

const BUTTON_BASE_STYLES =
  "inline-flex items-center w-full sm:w-auto justify-center gap-x-2 py-2 px-3.5 rounded-full font-medium text-sm cursor-pointer transition-all duration-200 ease-in border";

const PsychoEducationContent = ({ educationContent }: { educationContent: Psychoeducation }) => {
  const { subject, category, content, contextual_anchor } = educationContent;
  return (
    <>
      <DialogHeader className="flex flex-row items-center gap-x-4">
        <div className=" size-14 flex items-center justify-center bg-brand-500 rounded-lg">
          <BookOpenIcon />
        </div>
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <DialogDescription className="capitalize">{category?.replace(/-/g, " ")}</DialogDescription>
          <DialogTitle className="capitalize">{subject?.replace(/-/g, " ")}</DialogTitle>
        </div>
      </DialogHeader>
      <div className="grid gap-4 p-4">
        <h3 className=" text-xl font-bold">{contextual_anchor?.replace(/-/g, " ")}</h3>
        <p>{content}</p>
      </div>

      <div>
        <p>Read more</p>
        <Link
          target="_blank"
          referrerPolicy="origin"
          className={cn("", buttonVariants({ variant: "link" }))}
          href={"https://www.innuora.com/content/stress-management/overwhelm-management-guide/"}
        >
          <NewspaperIcon />
          Feeling Overwhelmed? A Step-by-Step Recovery Guide
        </Link>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};

const MessageBubble: React.FC<Props> = ({ message, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { role, content } = message;
  const isUser = role === "user";

  const messageContext =
    message.role === "user"
      ? content
      : `${message.content} ${message.follow_up_question ? `\n\n${message.follow_up_question}` : ""}`;

  const formattedDate = format(new Date(message.timestamp), "HH:mm");
  const messageStyle = STYLES_MAP[role];
  return (
    <>
      <div className={cn("mb-8 animate-slide-in-up duration-[600ms] ease-in delay-200", className)}>
        <div className={cn("flex flex-col gap-3 mb-4 md:flex-row items-start", isUser ? " md:flex-row-reverse" : "")}>
          <div
            className={cn(
              "size-9 rounded-lg flex items-center justify-center",
              "text-sm font-semibold rtl:font-sans shrink-0 text-white",
              isUser ? "bg-secondary" : "bg-primary"
            )}
          >
            {isUser ? "U" : "I"}
          </div>
          <div
            className={cn(
              "message-bubble",
              "w-full md:max-w-[75%] py-4 px-5 rounded-3xl leading-[1.5] relative",
              "[&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 [&>ul]:list-inside [&>ul]:list-disc [&_*>li]:my-4 ",
              messageStyle
            )}
          >
            {message.role === "user" ? (
              content
            ) : (
              <Markdown
                className="prose rtl:text-lg text-foreground [&>p]:mb-3 last:[&>p]:mb-0"
                options={{
                  forceBlock: true,
                  disableParsingRawHTML: true,
                }}
              >
                {messageContext}
              </Markdown>
            )}
            {message.role === "assistant" && (
              <div className="flex sm:flex-row flex-col gap-4 mt-3 sm:items-center sm:justify-end w-full">
                {message.psychoeducation && (
                  <button
                    onClick={() => setIsOpen(true)}
                    className={cn(
                      BUTTON_BASE_STYLES,
                      "bg-card text-card-foreground",
                      "hover:bg-brand-100 hover:border-brand-500 hover:-translate-y-[1px] hover:shadow-[0_8px_30px] hover:shadow-brand-200/20"
                    )}
                  >
                    <BookOpenTextIcon className="size-4 shrink-0" />
                    {/* <span className="pill-icon">📚</span> */}
                    <span className="text-inherit capitalize">{message.psychoeducation.subject}</span>
                  </button>
                )}
                {message.next_action && (
                  <button
                    className={cn(
                      BUTTON_BASE_STYLES,
                      "bg-card text-card-foreground",
                      "hover:bg-brand-100 hover:border-accent-500 hover:-translate-y-[1px] hover:shadow-[0_8px_30px] hover:shadow-accent-500/20"
                    )}
                  >
                    <ActivityIcon className="size-4 shrink-0" />
                    {/* <span className="pill-icon">✨</span> */}
                    <span className="capitalize">{message.next_action.type.replaceAll("_", " ")}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* {message.role === "assistant" && message.psychoeducation && (
          <PsychoEducationContent content={message.psychoeducation} />
        )} */}

        <div className={cn("message-time", " text-xs text-muted-foreground mt-2 text-center font-medium")}>
          {formattedDate}
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger> */}
        <DialogContent className="sm:max-w-xl">
          {message.role === "assistant" && message.psychoeducation && (
            <PsychoEducationContent educationContent={message.psychoeducation} />
          )}
          {/* <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4"></div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageBubble;
