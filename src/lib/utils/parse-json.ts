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
    console.error("JSON parsing error:", error, "\nInput text:", text);
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}
