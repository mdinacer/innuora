import { RoundCostTracker } from "./round-cost-tracker";

/**
 * Global registry to track active round cost trackers
 * This allows background processes to add their AI costs to the current round
 */
class RoundCostRegistry {
  private activeRounds = new Map<string, RoundCostTracker>();

  /**
   * Register a round tracker (called when round starts)
   */
  registerRound(roundId: string, tracker: RoundCostTracker): void {
    this.activeRounds.set(roundId, tracker);
  }

  /**
   * Track an AI call for a specific round (called by background processes)
   */
  trackAICallForRound(
    roundId: string,
    type: "memory" | "session_wellness",
    inputTokens: number,
    outputTokens: number,
    modelUsed: string
  ): boolean {
    const tracker = this.activeRounds.get(roundId);
    if (tracker) {
      tracker.trackAICall(type, inputTokens, outputTokens, modelUsed);
      return true;
    }
    return false;
  }

  /**
   * Unregister a round tracker (called when round ends)
   */
  unregisterRound(roundId: string): void {
    this.activeRounds.delete(roundId);
  }

  /**
   * Get active round IDs (for debugging)
   */
  getActiveRounds(): string[] {
    return Array.from(this.activeRounds.keys());
  }
}

export const roundCostRegistry = new RoundCostRegistry();

/**
 * Helper function for background processes to track their AI usage
 * Returns the round ID if tracking was successful, null otherwise
 */
export function trackBackgroundAICall(
  userId: string,
  sessionId: string,
  type: "memory" | "session_wellness",
  inputTokens: number,
  outputTokens: number,
  modelUsed: string
): string | null {
  // Try to find an active round for this user/session
  const activeRounds = roundCostRegistry.getActiveRounds();

  // Look for the most recent round for this session
  // In practice, there should only be one active round per session at a time
  const relevantRoundId = activeRounds.find((roundId) => roundId.includes(sessionId) || roundId.includes(userId));

  if (relevantRoundId) {
    const success = roundCostRegistry.trackAICallForRound(relevantRoundId, type, inputTokens, outputTokens, modelUsed);
    return success ? relevantRoundId : null;
  }

  // No active round found - this AI call happened outside a round
  console.warn(`Background AI call (${type}) could not be tracked - no active round found for session ${sessionId}`);
  return null;
}

/**
 * Helper to register a round tracker globally
 */
export function registerRoundTracker(roundId: string, tracker: RoundCostTracker): void {
  roundCostRegistry.registerRound(roundId, tracker);
}

/**
 * Helper to unregister a round tracker globally
 */
export function unregisterRoundTracker(roundId: string): void {
  roundCostRegistry.unregisterRound(roundId);
}
