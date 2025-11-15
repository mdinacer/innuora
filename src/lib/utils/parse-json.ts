import { z } from "zod";

/**
 * Extracts a JSON string from a larger text input.
 * Handles optional ```json blocks or raw JSON embedded in text.
 */
function extractJsonString(text: string): string {
  let content = text;

  // Remove ```json markdown if present
  if (text.includes("```json")) {
    content = text.replace(/```json\s*|\s*```/g, "");
  }

  const jsonStartIndex = content.indexOf("{");
  const jsonEndIndex = content.lastIndexOf("}");

  if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
    throw new Error("Malformed JSON: Unable to locate JSON boundaries.");
  }

  return content.slice(jsonStartIndex, jsonEndIndex + 1).trim();
}

/**
 * Parses a JSON object from a string.
 * Throws if parsing fails or if the result is not a plain object.
 */
export function parseJsonObject<T extends Record<string, any>>(text: string): T {
  try {
    const jsonString = extractJsonString(text);
    const parsedObject = JSON.parse(jsonString);

    if (typeof parsedObject !== "object" || parsedObject === null || Array.isArray(parsedObject)) {
      throw new Error("Parsed value is not a valid object.");
    }

    return parsedObject as T;
  } catch (error: any) {
    console.error("JSON parsing error:", error, "\nInput text:", text.slice(0, 200));
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

type ParseOptions<T> = {
  schema?: z.ZodType<T>;
};

export function parseJsonObjectWithValidation<T extends Record<string, any>>(
  text: string,
  options: ParseOptions<T>
): T {
  try {
    const jsonString = extractJsonString(text);
    const parsedObject = JSON.parse(jsonString);

    if (options?.schema) {
      return options.schema.parse(parsedObject);
    }

    if (typeof parsedObject !== "object" || parsedObject === null || Array.isArray(parsedObject)) {
      throw new Error("Parsed value is not a valid object.");
    }

    return parsedObject as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // SECURITY: Truncate input to avoid logging sensitive AI responses
    const truncatedInput = text.length > 200 ? `${text.substring(0, 200)}... (${text.length} chars total)` : text;

    console.error("JSON parsing error:", message, "\nInput (truncated):", truncatedInput.slice(0, 200));
    throw new Error(`Failed to parse JSON: ${message}`);
  }
}
