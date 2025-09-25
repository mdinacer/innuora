"use client";

import { User } from "@supabase/supabase-js";

import useLoadUserData from "@/hooks/use-load-user-data";

const DataLoader = ({ user }: { user: User }) => {
  useLoadUserData({ authUser: user });
  return <div className="absolute top-0 left-0">{user.id}</div>;
};

export default DataLoader;
