/**
 * Session Synchronization Configuration
 * Centralized configuration for all sync operations
 */

import { SyncConfig } from "../session-sync.types";

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  localSync: {
    debounceMs: 1000,
    triggers: ["roundComplete", "sessionUpdate", "messageAdd"],
  },
  cloudSync: {
    debounceMs: 600000, // 10 minutes
    triggers: ["periodic", "browserEvent", "manual"],
    intervalMs: 600000, // 10 minutes
  },
};

/**
 * Manages sync configuration with validation
 */
export class SyncConfigManager {
  private config: SyncConfig;

  constructor(initialConfig: Partial<SyncConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_SYNC_CONFIG, initialConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Update configuration with validation
   */
  updateConfig(updates: Partial<SyncConfig>): void {
    const newConfig = this.mergeConfig(this.config, updates);
    this.validateConfig(newConfig);
    this.config = newConfig;
  }

  /**
   * Get specific sync timings
   */
  getLocalDebounce(): number {
    return this.config.localSync.debounceMs;
  }

  getCloudDebounce(): number {
    return this.config.cloudSync.debounceMs;
  }

  getCloudInterval(): number {
    return this.config.cloudSync.intervalMs;
  }

  /**
   * Private helper methods
   */
  private mergeConfig(base: SyncConfig, updates: Partial<SyncConfig>): SyncConfig {
    return {
      localSync: { ...base.localSync, ...updates.localSync },
      cloudSync: { ...base.cloudSync, ...updates.cloudSync },
    };
  }

  private validateConfig(config: SyncConfig): void {
    if (config.localSync.debounceMs < 0) {
      throw new Error("Local sync debounce time must be non-negative");
    }
    if (config.cloudSync.debounceMs < 0) {
      throw new Error("Cloud sync debounce time must be non-negative");
    }
    if (config.cloudSync.intervalMs < 0) {
      throw new Error("Cloud sync interval must be non-negative");
    }
  }
}
