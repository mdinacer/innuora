import { nanoid } from "nanoid";

export const generateMessageId = (stepId?: string) => {
  const id = nanoid(10); // You can adjust the size if needed
  return stepId ? `msg_${stepId}_${id}` : `msg_${id}`;
};
