// Custom errors for user input service
export class UserInputServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "UserInputServiceError";
  }
}

export class AnalysisError extends UserInputServiceError {
  constructor(message: string = "Failed to analyze user input") {
    super(message, "ANALYSIS_FAILED");
  }
}

export class InvalidInputError extends UserInputServiceError {
  constructor(message: string = "Invalid user input provided") {
    super(message, "INVALID_INPUT");
  }
}

// Custom error classes
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

export class NetworkError extends AiClientError {
  constructor(message: string) {
    super(`Network error: ${message}`, "NETWORK_ERROR");
  }
}

// Custom error classes for better error handling
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class SessionError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "SessionError";
  }
}
