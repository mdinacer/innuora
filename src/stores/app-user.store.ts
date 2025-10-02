import { User as AuthUser } from "@supabase/supabase-js";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";
import { UserWithRelations } from "@/types/user.types";

type AuthUserData = Pick<AuthUser, "email" | "email_confirmed_at">;

export interface AppUserStoreState extends PersistedStoreBaseProps {
  user: UserWithRelations | null;
  authUser: AuthUserData | null;

  // Getters
  getCreditsBalance: () => number;

  // Setters
  setUser: (user: UserWithRelations | null) => void;
  setAuthUser: (data: AuthUserData | null) => void;

  // Updaters
  updateUser: (update: Partial<UserWithRelations> | ((user: UserWithRelations) => UserWithRelations)) => void;
  updateAuthUser: (update: Partial<AuthUserData> | ((data: AuthUserData) => AuthUserData)) => void;

  // Credits management
  setCreditsBalance: (balance: number) => void;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;

  // Clear
  clearUser: () => void;
  clearAll: () => void;
}

const initialState: Pick<AppUserStoreState, "user" | "authUser" | "hasHydrated"> = {
  user: null,
  authUser: null,
  hasHydrated: false,
};

export const useAppUserStore = create<AppUserStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Getters
      getCreditsBalance: () => {
        const user = get().user;
        return user?.creditsBalance ?? 0;
      },

      // Setters

      setUser: (user) => set({ user }),
      setAuthUser: (authUser) => set({ authUser }),

      // Updaters
      updateUser: (update) => {
        const current = get().user;
        if (!current) return;
        const newUser = typeof update === "function" ? update(current) : { ...current, ...update };
        set({ user: newUser });
      },
      updateAuthUser: (update) => {
        const current = get().authUser;
        if (!current) return;
        const newData = typeof update === "function" ? update(current) : { ...current, ...update };
        set({ authUser: newData });
      },

      // Credits management
      setCreditsBalance: (balance) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, creditsBalance: balance } });
      },
      deductCredits: (amount) => {
        const current = get().user;
        if (!current) return;
        const newBalance = Math.max(0, current.creditsBalance - amount);
        set({ user: { ...current, creditsBalance: newBalance } });
      },
      addCredits: (amount) => {
        const current = get().user;
        if (!current) return;
        const newBalance = current.creditsBalance + amount;
        set({ user: { ...current, creditsBalance: newBalance } });
      },

      // Clear
      clearUser: () => set({ user: null }),
      clearAll: () => set({ user: null, authUser: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "user-data-store",
      version: 1,
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        user: state.user,
        authUser: state.authUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
      },
    }
  )
);
