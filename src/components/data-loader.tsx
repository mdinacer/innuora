"use client";

import { User } from "@supabase/supabase-js";

import useLoadUserData from "@/hooks/use-load-user-data";

const DataLoader = ({ user }: { user: User }) => {
  useLoadUserData({ authUser: user });
  return null;
};

export default DataLoader;
