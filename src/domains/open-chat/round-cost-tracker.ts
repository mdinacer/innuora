import { calculateAIMessageCost } from "@/app/actions/credit-actions";
import { ModelCode } from "@/domains/ai-conversation/ai-models";

/**
 * Tracks all AI costs during a complete conversation round
 */
export interface RoundAICall {
  type: "analysis" | "response" | "memory" | "session_wellness";
  inputTokens: number;
  outputTokens: number;
  modelUsed: string;
  timestamp: Date;
}

export interface RoundCostSummary {
  roundId: string;
  userId: string;
  sessionId: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCredits: number;
  aiCalls: RoundAICall[];
  breakdown: {
    analysis: { input: number; output: number };
    response: { input: number; output: number };
    memory: { input: number; output: number };
    session_wellness: { input: number; output: number };
  };
  startTime: Date;
  endTime: Date;
  durationMs: number;
}

export class RoundCostTracker {
  private roundId: string;
  private userId: string;
  private sessionId: string;
  private modelCode: ModelCode;
  private aiCalls: RoundAICall[] = [];
  private startTime: Date;

  constructor(userId: string, sessionId: string, modelCode: ModelCode) {
    this.roundId = `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = userId;
    this.sessionId = sessionId;
    this.modelCode = modelCode;
    this.startTime = new Date();
  }

  /**
   * Track an AI call during this round
   */
  trackAICall(type: RoundAICall["type"], inputTokens: number, outputTokens: number, modelUsed: string): void {
    this.aiCalls.push({
      type,
      inputTokens,
      outputTokens,
      modelUsed,
      timestamp: new Date(),
    });
  }

  /**
   * Get current token totals
   */
  getCurrentTotals(): { inputTokens: number; outputTokens: number; totalTokens: number } {
    const inputTokens = this.aiCalls.reduce((sum, call) => sum + call.inputTokens, 0);
    const outputTokens = this.aiCalls.reduce((sum, call) => sum + call.outputTokens, 0);
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }

  /**
   * Finalize the round and calculate total cost
   */
  async finalizeRound(): Promise<RoundCostSummary> {
    const endTime = new Date();
    const { inputTokens, outputTokens, totalTokens } = this.getCurrentTotals();

    // Calculate credits based on total round usage
    const totalCredits = await calculateAIMessageCost(this.modelCode, inputTokens, outputTokens);

    // Build breakdown by AI call type
    const breakdown = {
      analysis: { input: 0, output: 0 },
      response: { input: 0, output: 0 },
      memory: { input: 0, output: 0 },
      session_wellness: { input: 0, output: 0 },
    };

    this.aiCalls.forEach((call) => {
      breakdown[call.type].input += call.inputTokens;
      breakdown[call.type].output += call.outputTokens;
    });

    return {
      roundId: this.roundId,
      userId: this.userId,
      sessionId: this.sessionId,
      totalInputTokens: inputTokens,
      totalOutputTokens: outputTokens,
      totalTokens,
      totalCredits,
      aiCalls: [...this.aiCalls],
      breakdown,
      startTime: this.startTime,
      endTime,
      durationMs: endTime.getTime() - this.startTime.getTime(),
    };
  }

  /**
   * Get round ID for tracking
   */
  getRoundId(): string {
    return this.roundId;
  }
}
