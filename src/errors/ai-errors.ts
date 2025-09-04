export class AiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "AiClientError";
  }
}

export class EmptyResponseError extends AiClientError {
  constructor() {
    super("AI returned empty content", "EMPTY_RESPONSE");
  }
}

export class NetworkError extends AiClientError {
  constructor(message: string) {
    super(`Network error: ${message}`, "NETWORK_ERROR");
  }
}

export class OpenAiError extends AiClientError {
  constructor(message: string) {
    super(`OpenAI API error: ${message}`, "OPENAI_ERROR");
  }
}

export class OpenRouterError extends AiClientError {
  constructor(message: string) {
    super(`OpenRouter API error: ${message}`, "OPENROUTER_ERROR");
  }
}
