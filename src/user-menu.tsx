"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  ChevronDownIcon,
  CogIcon,
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  User2Icon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "./lib/utils";
import { useAppUserStore } from "./stores/app-user.store";

const ITEMS = [
  { label: "Account", icon: User2Icon, href: "/settings/account" },
  { label: "My Sessions", icon: CalendarIcon, href: "/sessions" },
  { label: "Billing & Credits", icon: CreditCardIcon, href: "/billing" },
  { label: "Settings", icon: CogIcon, href: "/settings" },
];

interface Props {
  className?: string;
}

const UserMenu: React.FC<Props> = () => {
  const user = useAppUserStore((state) => state.user);
  const authUser = useAppUserStore((state) => state.authUser);
  const [open, setOpen] = useState(false);

  const initials = user?.profile?.displayName?.charAt(0) || "?";
  const fullName = user?.profile?.displayName || "User";

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`${fullName} menu`}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-2xl border border-inn-border-light",
            "bg-inn-bg-card px-2 sm:px-3 py-2 hover:border-inn-bg-accent transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-inn-bg-accent focus-visible:ring-offset-2"
          )}
        >
          <div
            className="sm:size-8 size-6 rounded-full bg-gradient-to-br from-inn-bg-accent to-inn-bg-flame flex items-center justify-center text-sm font-bold text-white"
            role="img"
            aria-label={`User avatar for ${fullName}`}
          >
            {initials}
          </div>
          <div className="sr-only sm:not-sr-only grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{fullName}</span>
            <span className="text-muted-foreground truncate text-xs">{authUser?.email}</span>
          </div>
          <ChevronDownIcon className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "min-w-[280px] rounded-2xl border border-inn-border-light bg-inn-bg-card",
          "shadow-[0_8px_30px] shadow-inn-bg-accent/25 focus:outline-none"
        )}
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div
            className="flex p-4 items-center justify-between  rounded-lg bg-inn-bg-soft"
            role="status"
            aria-label="Credit balance"
          >
            <span className="text-xs text-inn-text-secondary">Credits Balance</span>
            <span
              className="bg-inn-bg-accent/15 text-inn-bg-accent inline-flex items-center py-0.5 px-2 
                           text-xs font-semibold rounded-md"
              aria-live="polite"
            >
              {user?.creditsBalance ?? 0}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup role="menu">
          {ITEMS.map((item) => (
            <DropdownMenuItem
              key={item.label}
              asChild
              className="sm:hover:bg-inn-bg-secondary text-sm font-medium px-3 py-2.5 rounded-xl focus-visible:bg-inn-bg-secondary"
            >
              <Link href={item.href} aria-label={`Go to ${item.label}`} className="flex items-center gap-x-3">
                <item.icon className="size-[18px]" aria-hidden="true" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="sm:hover:bg-inn-bg-secondary text-sm font-medium px-3 py-2.5 rounded-xl"
          role="menuitem"
        >
          <HelpCircleIcon className="size-[18px]" aria-hidden="true" />
          Help & Support
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" className="text-sm font-medium px-3 py-2.5 rounded-xl" role="menuitem">
          <LogOutIcon className="size-[18px]" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
