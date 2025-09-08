import { useCallback, useEffect, useMemo } from "react";

import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { getChatSummary } from "./chat-summary.action";
import { countCompleteRounds, getRecentMessages } from "./chat-summary.utils";

interface SessionSummaryConfig {
  unsummarizedRoundsThreshold: number; // Default: 4 rounds
  recentMessagesTokenBudget: number; // Default: 800 tokens
  maxRecentRounds: number; // Default: 4 rounds max
}

const DEFAULT_CONFIG: SessionSummaryConfig = {
  unsummarizedRoundsThreshold: 4,
  recentMessagesTokenBudget: 800,
  maxRecentRounds: 4,
};

function getLastSummarizedIndex(messages: OpenChatMessage[], lastSummarizedMessageId?: string): number {
  if (!lastSummarizedMessageId) return 0;

  const index = messages.findIndex((msg) => msg.id === lastSummarizedMessageId);
  return index === -1 ? 0 : index + 1; // +1 to start from the next message
}

interface Props {
  sessionId: string;
  config?: Partial<SessionSummaryConfig>;
}

export default function useSummarizeChat({ sessionId, config = {} }: Props) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const hasHydrated = useOpenChatSessionStore((state) => state.hasHydrated);
  const session = useOpenChatSessionStore((state) => state.sessions[sessionId]) as Session | undefined;

  const messages = useMemo(() => session?.messages ?? [], [session]);
  const currentSummaryData = useMemo(() => session?.chatSummary, [session]);

  const lastSummarizedIndex = useMemo(
    () => getLastSummarizedIndex(messages, currentSummaryData?.meta.lastSummarizedMessageId),
    [currentSummaryData?.meta.lastSummarizedMessageId, messages]
  );

  const unsummarizedMessages = useMemo(() => messages.slice(lastSummarizedIndex), [lastSummarizedIndex, messages]);

  const unsummarizedRoundsCount = useMemo(() => countCompleteRounds(unsummarizedMessages), [unsummarizedMessages]);

  const shouldSummarize = useMemo(() => {
    if (!hasHydrated || !session || session.messages.length === 0) return false;
    return unsummarizedRoundsCount >= finalConfig.unsummarizedRoundsThreshold;
  }, [finalConfig.unsummarizedRoundsThreshold, hasHydrated, session, unsummarizedRoundsCount]);

  const { messagesToSummarize, recentMessages } = useMemo(() => {
    if (!shouldSummarize || unsummarizedMessages.length === 0) {
      return { messagesToSummarize: [], recentMessages: unsummarizedMessages };
    }

    // Get recent messages to keep (token-aware)
    const recentMessages = getRecentMessages(
      unsummarizedMessages,
      finalConfig.recentMessagesTokenBudget,
      finalConfig.maxRecentRounds
    );

    // Messages to summarize = all unsummarized - recent messages
    const recentMessageIds = new Set(recentMessages.map((m) => m.id));
    const messagesToSummarize = unsummarizedMessages.filter((m) => !recentMessageIds.has(m.id));

    return { messagesToSummarize, recentMessages };
  }, [shouldSummarize, unsummarizedMessages, finalConfig]);

  const startSummarizing = useCallback(async () => {
    if (!session || !shouldSummarize || messagesToSummarize.length === 0) return;

    const summaryResult = await getChatSummary(messagesToSummarize, currentSummaryData?.text, "compact");

    if (!summaryResult) {
      throw new Error("Failed to get chat summary");
    }

    const { summary, modelTokenUsage } = summaryResult;

    if (modelTokenUsage) {
      useOpenChatSessionStore.getState().addTokenUsage(sessionId, modelTokenUsage);
    }

    // Update session with new summary (last message ID should be from messagesToSummarize, not recentMessages)
    const lastSummarizedMessage = messagesToSummarize[messagesToSummarize.length - 1];

    useOpenChatSessionStore.getState().updateSession(sessionId, (prev) => ({
      ...prev,
      chatSummary: {
        text: summary,
        meta: {
          createdAt: new Date(),
          lastSummarizedMessageId: lastSummarizedMessage.id,
        },
      },
    }));
  }, [session, shouldSummarize, messagesToSummarize, currentSummaryData?.text, sessionId]);

  useEffect(() => {
    if (!shouldSummarize) return;
    startSummarizing();
  }, [shouldSummarize, startSummarizing]);

  return useMemo(
    () => ({
      chatSummary: currentSummaryData,
      recentMessages: shouldSummarize ? recentMessages : unsummarizedMessages,
      isGeneratingSummary: shouldSummarize && messagesToSummarize.length > 0,
      unsummarizedRoundsCount,
    }),
    [
      currentSummaryData,
      shouldSummarize,
      recentMessages,
      unsummarizedMessages,
      messagesToSummarize.length,
      unsummarizedRoundsCount,
    ]
  );
}
