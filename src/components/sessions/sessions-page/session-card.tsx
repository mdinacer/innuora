"use client";

import React from "react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { format } from "date-fns";
import { ChevronRightIcon, EllipsisVerticalIcon, PencilIcon, TextIcon, TrashIcon } from "lucide-react";

import { Session } from "@/types/open-chat-session.types";

interface Props {
  session: Session;
}

const SessionCard: React.FC<Props> = ({ session }) => {
  return (
    <div className="rounded-2xl flex flex-col border border-mir-bg-light bg-mir-bg-card p-6 shadow-subtle transition hover:shadow-md cursor-pointer group">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs text-mir-text-secondary">{format(session.createdAt, "PPP")}</span>

        <button>
          <EllipsisVerticalIcon className="size-5" />
        </button>
      </div>
      <Separator />
      <div className="flex items-start gap-4 justify-end mb-4">
        <button className="flex items-center  gap-2 text-xs text-mir-text-secondary hover:text-mir-bg-accent transition-all">
          <PencilIcon className="size-5" />
        </button>
        <button className="flex items-center  gap-2 text-xs text-mir-text-secondary hover:text-mir-bg-accent transition-all">
          <TrashIcon className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <TextIcon className="size-5 text-mir-bg-accent" />
        <h3 className="font-semibold capitalize text-mir-text-primary  group-hover:text-mir-bg-accent transition">
          {session.title}
        </h3>
      </div>
      <p className="text-sm text-mir-text-secondary mb-4 line-clamp-2">{session.subtitle}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-mir-text-secondary">{format(session.createdAt, "PPP")}</span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-mir-bg-accent hover:text-mir-text-primary">
          <ChevronRightIcon className="size-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
