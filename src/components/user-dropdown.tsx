"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { ChevronDownIcon, CogIcon, GlobeLockIcon, LogOutIcon, UserCircleIcon, UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useUserDataStore } from "@/stores/user-data.store";

interface Props {
  user: User;
}

const getInitials = (name: string) => {
  const names = name.split(" ");
  const initials = names.map((n) => n.charAt(0).toUpperCase());
  return initials.join("");
};

const UserDropdown: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { profile } = useUserDataStore();

  const handleSignout = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
    router.push("/");
  }, [router]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={
            "flex items-center gap-3 rounded-2xl border border-inn-border-light bg-inn-bg-card px-4 py-2 transition hover:shadow-subtle focus:outline-none focus:ring-2 focus:ring-inn-bg-accent focus:ring-opacity-20"
          }
          aria-expanded="false"
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-inn-bg-accent flex items-center justify-center text-white font-semibold text-sm">
            {profile?.displayName ? getInitials(profile.displayName) : <UserIcon />}
          </div>
          <span className="hidden sm:block font-medium text-sm">{profile?.displayName}</span>

          <ChevronDownIcon
            className={cn("size-4 text-inn-text-secondary transition-transform", { "rotate-180": open })}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
          "rounded-2xl mt-2 border border-inn-border-light bg-inn-bg-card shadow-[0_8px_30px] shadow-black/15 py-2 z-50  px-4"
        )}
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="px-4 py-3">
            <p className="font-medium">{profile?.displayName}</p>
            <p className="text-sm text-inn-text-secondary">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserCircleIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CogIcon />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuItem>
            <GlobeLockIcon />
            Privacy
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleSignout}>
          <LogOutIcon className="text-inherit" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
