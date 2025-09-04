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
