import { Profile, User, UserConfig } from "@prisma/client";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

export interface UserDataStoreState extends PersistedStoreBaseProps {
  user: User | null;
  config: UserConfig | null;
  profile: Profile | null;

  // Getters
  getUser: () => User | null;
  getConfig: () => UserConfig | null;
  getProfile: () => Profile | null;

  getUserData: () => {
    user: User | null;
    config: UserConfig | null;
    profile: Profile | null;
  };

  // Setters
  setUser: (user: User | null) => void;
  setConfig: (config: UserConfig | null) => void;
  setProfile: (profile: Profile | null) => void;
  setData: (data: { user: User | null; config: UserConfig | null; profile: Profile | null }) => void;

  // Updaters
  updateUser: (update: Partial<User> | ((user: User) => User)) => void;
  updateConfig: (update: Partial<UserConfig> | ((config: UserConfig) => UserConfig)) => void;
  updateProfile: (update: Partial<Profile> | ((profile: Profile) => Profile)) => void;

  // Clear
  clearUser: () => void;
  clearAll: () => void;
}

const initialState: Pick<UserDataStoreState, "user" | "config" | "profile" | "hasHydrated"> = {
  user: null,
  config: null,
  profile: null,
  hasHydrated: false,
};

export const useUserDataStore = create<UserDataStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Getters
      getUser: () => get().user,
      getConfig: () => get().config,
      getProfile: () => get().profile,

      getUserData: () => ({
        user: get().user,
        config: get().config,
        profile: get().profile,
      }),

      // Setters
      setUser: (user) => set({ user }),
      setConfig: (config) => set({ config }),
      setProfile: (profile) => set({ profile }),
      setData: (data) => set(data),

      // Updaters
      updateUser: (update) => {
        const current = get().user;
        if (!current) return;
        const newUser = typeof update === "function" ? update(current) : { ...current, ...update };
        set({ user: newUser });
      },
      updateConfig: (update) => {
        const current = get().config;
        if (!current) return;
        const newConfig = typeof update === "function" ? update(current) : { ...current, ...update };
        set({ config: newConfig });
      },
      updateProfile: (update) => {
        const current = get().profile;
        if (!current) return;
        const newProfile = typeof update === "function" ? update(current) : { ...current, ...update };
        set({ profile: newProfile });
      },

      // Clear
      clearUser: () => set({ user: null }),
      clearAll: () => set({ user: null, config: null, profile: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "user-data-store",
      version: 1,
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        user: state.user,
        config: state.config,
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
      },
    }
  )
);
