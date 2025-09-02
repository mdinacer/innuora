"use client";

import React from "react";
import { EllipsisVerticalIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ChatUIMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "menu-button",
            "size-9 bg-mir-bg-input",
            "flex items-center justify-center",
            "border-none rounded-xl cursor-pointer",
            "transition-all duration-300 ease-in",
            "hover:bg-mir-border-light"
          )}
        >
          <EllipsisVerticalIcon className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-mir-bg-card">
        <DropdownMenuItem onClick={() => {}}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatUIMenu;
