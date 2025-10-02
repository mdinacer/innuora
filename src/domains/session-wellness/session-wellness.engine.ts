import { getActiveSessionDuration } from "@/domains/active-session/active-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { SessionWellness } from "./session-wellness.types";

export class SessionWellnessEngine {
  /**
   * Evaluates whether a session should be concluded based on multiple factors
   */
  evaluateSessionWellness(
    session: Session,
    recentAnalyses: TherapeuticAnalysis[],
    lastUserMessage: string
  ): SessionWellness {
    const { durationMinutes, isExtended } = getActiveSessionDuration(session);
    const messageCount = session.messages.length;

    // Safety check - never suggest conclusion during crisis or high intensity
    const latestAnalysis = recentAnalyses[recentAnalyses.length - 1];
    if (latestAnalysis) {
      if (latestAnalysis.crisis !== "none" || latestAnalysis.intensity === "high") {
        return {
          suggest_conclusion: false,
          should_end: false,
          reasons: [],
          loop_assessment: "none",
          confidence: "high",
        };
      }
    }

    // Check for length-based conclusion
    if (this.shouldConcludeByLength(messageCount, durationMinutes)) {
      return {
        suggest_conclusion: true,
        should_end: messageCount > 50, // Hard limit
        reasons: ["length"],
        loop_assessment: "none",
        confidence: isExtended ? "high" : "medium",
      };
    }

    // Check for progress-based conclusion
    if (this.shouldConcludeByProgress(recentAnalyses, lastUserMessage)) {
      return {
        suggest_conclusion: true,
        should_end: false,
        reasons: ["productive_loop_complete"],
        loop_assessment: "productive",
        confidence: "medium",
      };
    }

    // Check for repetition patterns (potential unproductive loop)
    if (this.shouldConcludeByRepetition(recentAnalyses)) {
      return {
        suggest_conclusion: true,
        should_end: false,
        reasons: ["unproductive_loop"],
        loop_assessment: "unproductive",
        confidence: "medium",
      };
    }

    // Check for fatigue indicators
    if (this.shouldConcludeByFatigue(recentAnalyses, durationMinutes)) {
      return {
        suggest_conclusion: true,
        should_end: false,
        reasons: ["length"],
        loop_assessment: "none",
        confidence: "low",
      };
    }

    // Check for natural conversation end
    if (this.shouldConcludeByNaturalEnd(lastUserMessage)) {
      return {
        suggest_conclusion: true,
        should_end: false,
        reasons: ["natural_end"],
        loop_assessment: "none",
        confidence: "high",
      };
    }

    return {
      suggest_conclusion: false,
      should_end: false,
      reasons: [],
      loop_assessment: "none",
      confidence: "low",
    };
  }

  private shouldConcludeByLength(messageCount: number, durationMinutes: number): boolean {
    // Suggest conclusion if:
    // - More than 20 message exchanges (40 total messages)
    // - OR more than 60 minutes of active conversation
    return messageCount > 40 || durationMinutes > 60;
  }

  //TODO: check the necessity of the lastUserMessage prop
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private shouldConcludeByProgress(recentAnalyses: TherapeuticAnalysis[], lastUserMessage: string): boolean {
    if (recentAnalyses.length < 2) return false;

    const latest = recentAnalyses[recentAnalyses.length - 1];
    const previous = recentAnalyses[recentAnalyses.length - 2];

    // Check if user reached a state of understanding or resolution based on analysis patterns
    // Look for signs of therapeutic progress: engaged state + low intensity + reduced distortions
    const hasProgressIndicators =
      latest.therapeutic_readiness === "engaged" &&
      latest.intensity === "low" &&
      latest.distortions.length < previous.distortions.length;

    return hasProgressIndicators;
  }

  private shouldConcludeByRepetition(recentAnalyses: TherapeuticAnalysis[]): boolean {
    if (recentAnalyses.length < 4) return false;

    // Check if last 3 analyses show similar themes without progression
    const recentThemes = recentAnalyses.slice(-3).flatMap((analysis) => analysis.themes.map((t) => t.theme));

    // If same themes keep appearing, might be circling
    const uniqueThemes = new Set(recentThemes);
    return recentThemes.length > 6 && uniqueThemes.size <= 2;
  }

  private shouldConcludeByFatigue(recentAnalyses: TherapeuticAnalysis[], durationMinutes: number): boolean {
    if (recentAnalyses.length < 3 || durationMinutes < 30) return false;

    const latest = recentAnalyses[recentAnalyses.length - 1];

    // Look for fatigue indicators:
    // - User in overwhelm state after extended session
    // - Decreased therapeutic readiness
    return (
      durationMinutes > 45 && (latest.process_module === "overwhelm" || latest.therapeutic_readiness === "resistant")
    );
  }

  private shouldConcludeByNaturalEnd(lastUserMessage: string): boolean {
    // Use message length and structure as natural end indicators
    // Very short messages or messages with gratitude tone patterns
    const messageLength = lastUserMessage.trim().length;
    const wordCount = lastUserMessage.trim().split(/\s+/).length;

    // Natural end indicators: very short responses, single words, or brief statements
    return messageLength < 20 || wordCount <= 3;
  }
}
