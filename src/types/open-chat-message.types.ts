export type OpenChatMessageRole = "user" | "assistant" | "system";

export interface OpenChatMessage {
  readonly id: string;
  readonly role: OpenChatMessageRole;
  readonly content: string;
  readonly timestamp: number;
  readonly creditsUsed?: number; // Credits consumed for this message
}
