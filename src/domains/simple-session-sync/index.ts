import { CloudSyncService } from "@/domains/simple-session-sync/cloud-sync-service";
import { LocalSyncService } from "@/domains/simple-session-sync/local-sync-service";

export const localSyncService = LocalSyncService.getInstance();
export const cloudSyncService = CloudSyncService.getInstance();

export function startSyncServices() {
  cloudSyncService.startPeriodicSync();
}

export function stopSyncServices() {
  cloudSyncService.stopPeriodicSync();
  localSyncService.cleanup();
}
