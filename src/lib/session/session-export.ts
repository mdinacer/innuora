/**
 * Session Export Utilities
 *
 * Handles session data export in various formats (JSON, Markdown)
 * for data portability and GDPR compliance.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { OpenChatMessage } from "@/types/open-chat-message.types";

export interface SessionExportData {
  sessionId: string;
  title: string;
  subtitle?: string;
  messages: OpenChatMessage[];
  metadata?: {
    messageCount: number;
    createdAt: string;
    exportedAt: string;
  };
}

/**
 * Export session as JSON file
 */
export function exportSessionAsJSON(data: SessionExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `session-${data.sessionId}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export session as Markdown file
 */
export function exportSessionAsMarkdown(data: SessionExportData): void {
  const markdown = generateMarkdown(data);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `session-${data.sessionId}-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Markdown content from session data
 */
function generateMarkdown(data: SessionExportData): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${data.title}`);
  if (data.subtitle) {
    lines.push(`*${data.subtitle}*`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // Metadata
  if (data.metadata) {
    lines.push("## Session Information");
    lines.push("");
    lines.push(`- **Session ID**: ${data.sessionId}`);
    lines.push(`- **Message Count**: ${data.metadata.messageCount}`);
    lines.push(`- **Created**: ${new Date(data.metadata.createdAt).toLocaleString()}`);
    lines.push(`- **Exported**: ${new Date(data.metadata.exportedAt).toLocaleString()}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Messages
  lines.push("## Conversation");
  lines.push("");

  data.messages.forEach((message) => {
    const role = message.role === "user" ? "**You**" : "**AI Assistant**";
    const timestamp = new Date(message.timestamp).toLocaleTimeString();

    lines.push(`### ${role} (${timestamp})`);
    lines.push("");
    lines.push(message.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Export session as plain text file
 */
export function exportSessionAsText(data: SessionExportData): void {
  const text = generatePlainText(data);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `session-${data.sessionId}-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate plain text content from session data
 */
function generatePlainText(data: SessionExportData): string {
  const lines: string[] = [];

  // Header
  lines.push(data.title);
  lines.push("=".repeat(data.title.length));
  if (data.subtitle) {
    lines.push(data.subtitle);
  }
  lines.push("");

  // Metadata
  if (data.metadata) {
    lines.push("Session Information:");
    lines.push(`  Session ID: ${data.sessionId}`);
    lines.push(`  Message Count: ${data.metadata.messageCount}`);
    lines.push(`  Created: ${new Date(data.metadata.createdAt).toLocaleString()}`);
    lines.push(`  Exported: ${new Date(data.metadata.exportedAt).toLocaleString()}`);
    lines.push("");
  }

  lines.push("Conversation:");
  lines.push("-".repeat(50));
  lines.push("");

  // Messages
  data.messages.forEach((message, index) => {
    const role = message.role === "user" ? "You" : "AI Assistant";
    const timestamp = new Date(message.timestamp).toLocaleTimeString();

    lines.push(`[${role}] ${timestamp}`);
    lines.push(message.content);
    lines.push("");

    if (index < data.messages.length - 1) {
      lines.push("-".repeat(50));
      lines.push("");
    }
  });

  return lines.join("\n");
}

/**
 * Prepare session data for export
 */
export function prepareSessionExport(
  sessionId: string,
  title: string,
  subtitle: string | undefined,
  messages: OpenChatMessage[],
  createdAt?: string
): SessionExportData {
  return {
    sessionId,
    title,
    subtitle,
    messages,
    metadata: {
      messageCount: messages.length,
      createdAt: createdAt || new Date().toISOString(),
      exportedAt: new Date().toISOString(),
    },
  };
}
