/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";

import { useCallback, useState } from "react";

import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";

export default function EncryptionRoute() {
  const [encrypted, setEncrypted] = useState<EncryptedBlob | null>(null);
  const [decrypted, setDecrypted] = useState<unknown | null>(null);

  const handleEncryptData = useCallback(async () => {
    try {
      const contentKey = await getStoredContentKey();
      if (!contentKey) {
        throw new Error("No content key found");
      }
      const payload = {
        messages: mockSession.messages,
        memoryStore: mockSession.memoryStore,
        continuitySummary: mockSession.continuitySummary,
        aggregatedAnalysis: mockSession.aggregatedAnalysis,
        analysisSnapshots: mockSession.analysisSnapshots,
      };
      const encryptedBlob: EncryptedBlob = await encryptObjectWithKey(payload, contentKey);
      setEncrypted(encryptedBlob);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDecryptData = useCallback(async () => {
    if (!encrypted) return;
    try {
      const contentKey = await getStoredContentKey();
      if (!contentKey) {
        throw new Error("No content key found");
      }
      const decryptedBlob = await decryptObjectWithKey<Session>(encrypted, contentKey);
      setDecrypted(decryptedBlob);
    } catch (error) {
      console.error(error);
    }
  }, [encrypted]);

  return (
    <main className="h-screen w-screen">
      <div className=" max-w-4xl w-full relative mx-auto h-full flex items-center justify-center">
        <CodeView
          data={{
            encrypted,
            decrypted,
            // session: mockSession,
          }}
        />
        <div className="grid gap-4">
          <Button disabled={!!encrypted} onClick={handleEncryptData}>
            {!encrypted ? "Encrypt data" : "Data Encrypted"}
          </Button>
          <Button disabled={!encrypted} onClick={handleDecryptData}>
            {!encrypted ? "Decrypt data" : "Data Decrypted"}
          </Button>
        </div>
      </div>
    </main>
  );
}

// Mock data
const mockSession = {
  id: "Session ID",
  title: "First Reflection",
  subtitle: "Testing encrypted persistence",
  createdAt: new Date(),
  updatedAt: new Date(),
  messages: [
    {
      id: "msg_1",
      role: "user",
      content: "I feel like I’m not enough at work.",
      timestamp: Date.now(),
    },
    {
      id: "msg_2",
      role: "assistant",
      content: "It sounds like you’re carrying a lot of self-pressure.",
      timestamp: Date.now(),
    },
  ],
  memoryStore: [
    "I feel like I’m not enough at work.",
    "It sounds like you’re carrying a lot of self-pressure.",
    "I feel like I’m not enough at work.",
    "It sounds like you’re carrying a lot of self-pressure.",
    "I feel like I’m not enough at work.",
    "It sounds like you’re carrying a lot of self-pressure.",
  ],
  continuitySummary: {
    text: "Exploring themes of self-worth and workplace stress.",
    updatedAt: new Date(),
    lastMessageIndex: 1,
  },
  aggregatedAnalysis: {
    intensity: "moderate",
    crisis: "none",
    distortions: ["all_or_nothing", "emotional_reasoning"],
    themes: ["self-worth", "work pressure"],
    core_beliefs: ["I’m not enough"],
    silent_rules: ["I should always perform perfectly"],
  },
  analysisSnapshots: [
    {
      intensity: "low",
      crisis: "none",
      distortions: [],
      themes: [],
      core_beliefs: [],
      silent_rules: [],
    },
    {
      intensity: "moderate",
      crisis: "none",
      distortions: ["mind_reading"],
      themes: ["perfectionism"],
      core_beliefs: ["I must prove myself"],
      silent_rules: [],
    },
  ],
  modelCode: "M3",
  persistOnCloud: true,
  autoUpdateTitle: true,
  metadata: {
    tokenUsage: [
      {
        type: "summary",
        model: "M3",
        mode: "free",
        version: "2025-09",
        usage: {
          completion_tokens: 150,
          prompt_tokens: 80,
          total_tokens: 230,
        },
        timestamp: new Date().toISOString(),
        costUSD: 0,
      },
    ],
    messageCount: 2,
    tokenCount: 230,
    costUSD: 0,
  },
};
