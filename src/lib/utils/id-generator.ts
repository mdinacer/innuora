import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10);

export const generateMessageId = (stepId?: string, sessionId?: string) => {
  const id = nanoid();
  const prefix = [sessionId, stepId].filter(Boolean).join("_");
  return prefix ? `msg_${prefix}_${id}` : `msg_${id}`;
};

export const generateId = (prefix: string) => {
  const id = nanoid(10); // You can adjust the size if needed
  return `${prefix}_${id}`;
};
