/**
 * Session Wellness Frequency Manager
 *
 * Intelligent frequency control for session wellness analysis to reduce token waste.
 * Uses message count thresholds and time intervals instead of checking after every message.
 */

interface WellnessCheckState {
  lastCheckMessageCount: number;
  lastCheckTimestamp: number;
  sessionStartTime: number;
}

export class SessionWellnessFrequencyManager {
  private checkStates = new Map<string, WellnessCheckState>();

  // Configuration constants
  private readonly MESSAGE_THRESHOLD = 8; // Check every 8 messages
  private readonly MIN_TIME_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes minimum
  private readonly EARLY_SESSION_THRESHOLD = 6; // Skip checks in first 6 messages
  private readonly CRISIS_OVERRIDE_THRESHOLD = 3; // Check every 3 messages during crisis

  /**
   * Determines if wellness analysis should run for this session
   */
  shouldCheckWellness(sessionId: string, currentMessageCount: number, hasCrisisIndicators: boolean = false): boolean {
    const now = Date.now();
    let state = this.checkStates.get(sessionId);

    // Initialize state for new sessions
    if (!state) {
      state = {
        lastCheckMessageCount: 0,
        lastCheckTimestamp: 0,
        sessionStartTime: now,
      };
      this.checkStates.set(sessionId, state);
    }

    // Skip wellness checks in early session (first few messages)
    if (currentMessageCount < this.EARLY_SESSION_THRESHOLD) {
      return false;
    }

    // Determine threshold based on crisis indicators
    const messageThreshold = hasCrisisIndicators ? this.CRISIS_OVERRIDE_THRESHOLD : this.MESSAGE_THRESHOLD;

    const messagesSinceLastCheck = currentMessageCount - state.lastCheckMessageCount;
    const timeSinceLastCheck = now - state.lastCheckTimestamp;

    // Check if enough messages have passed
    const hasEnoughMessages = messagesSinceLastCheck >= messageThreshold;

    // For the primary optimization, focus on message count
    // Time interval is a secondary safety check to prevent too frequent calls
    const timeSinceLastCheckMinutes = timeSinceLastCheck / (1000 * 60);
    const hasMinimumTimeGap = state.lastCheckTimestamp === 0 || timeSinceLastCheckMinutes >= 1; // 1 minute minimum

    // Perform check if message threshold is met and minimum time has passed
    if (hasEnoughMessages && hasMinimumTimeGap) {
      // Update state to record this check
      state.lastCheckMessageCount = currentMessageCount;
      state.lastCheckTimestamp = now;
      this.checkStates.set(sessionId, state);
      return true;
    }

    return false;
  }

  /**
   * Force a wellness check (for special circumstances)
   */
  forceCheck(sessionId: string, currentMessageCount: number): void {
    const now = Date.now();
    const state = this.checkStates.get(sessionId) || {
      lastCheckMessageCount: 0,
      lastCheckTimestamp: 0,
      sessionStartTime: now,
    };

    state.lastCheckMessageCount = currentMessageCount;
    state.lastCheckTimestamp = now;
    this.checkStates.set(sessionId, state);
  }

  /**
   * Get statistics about wellness check frequency for this session
   */
  getCheckStats(
    sessionId: string,
    currentMessageCount: number
  ): {
    messagesSinceLastCheck: number;
    timeSinceLastCheck: number;
    totalSessionTime: number;
    checksPerformed: number;
  } {
    const state = this.checkStates.get(sessionId);
    const now = Date.now();

    if (!state) {
      return {
        messagesSinceLastCheck: currentMessageCount,
        timeSinceLastCheck: 0,
        totalSessionTime: 0,
        checksPerformed: 0,
      };
    }

    return {
      messagesSinceLastCheck: currentMessageCount - state.lastCheckMessageCount,
      timeSinceLastCheck: now - state.lastCheckTimestamp,
      totalSessionTime: now - state.sessionStartTime,
      checksPerformed: state.lastCheckTimestamp > 0 ? 1 : 0,
    };
  }

  /**
   * Clean up state for completed sessions
   */
  cleanupSession(sessionId: string): void {
    this.checkStates.delete(sessionId);
  }

  /**
   * Get estimated token savings from frequency optimization
   */
  getTokenSavingsEstimate(
    sessionId: string,
    currentMessageCount: number
  ): {
    estimatedSavedChecks: number;
    estimatedTokensSaved: number;
  } {
    // Without optimization: check after every message (after message 6)
    const messagesEligibleForCheck = Math.max(0, currentMessageCount - this.EARLY_SESSION_THRESHOLD);
    const unoptimizedChecks = messagesEligibleForCheck;

    // With optimization: check every MESSAGE_THRESHOLD messages
    const optimizedChecks = Math.floor(messagesEligibleForCheck / this.MESSAGE_THRESHOLD);

    const savedChecks = unoptimizedChecks - optimizedChecks;
    const tokensPerCheck = 200; // Max tokens per wellness check
    const estimatedTokensSaved = savedChecks * tokensPerCheck;

    return {
      estimatedSavedChecks: savedChecks,
      estimatedTokensSaved,
    };
  }
}

// Singleton instance for use across the application
export const wellnessFrequencyManager = new SessionWellnessFrequencyManager();
