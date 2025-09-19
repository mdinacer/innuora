export type SyncStatus = "synced" | "syncing" | "error" | "pending";

export interface SyncStatusDetailed {
  local: SyncStatus;
  cloud: SyncStatus | "disabled";
}

export interface SyncTimestamps {
  local: Date | null;
  cloud: Date | null;
}

export interface SyncConfig {
  localSync: {
    debounceMs: number;
    triggers: ("roundComplete" | "sessionUpdate" | "messageAdd")[];
  };
  cloudSync: {
    debounceMs: number;
    triggers: ("periodic" | "browserEvent" | "manual")[];
    intervalMs: number;
  };
}
