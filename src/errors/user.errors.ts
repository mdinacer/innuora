export class UserNotFoundError extends Error {
  constructor(userId?: string) {
    super(`User ${userId ? `with ID ${userId}` : ""} not found`);
    this.name = "UserNotFoundError";
  }
}

export class UserCreationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(`Failed to create user: ${message}`);
    this.name = "UserCreationError";
    this.cause = cause;
  }
}

export class UserUpdateError extends Error {
  constructor(message: string, cause?: unknown) {
    super(`Failed to update user: ${message}`);
    this.name = "UserUpdateError";
    this.cause = cause;
  }
}

export class UserDeletionError extends Error {
  constructor(message: string, cause?: unknown) {
    super(`Failed to delete user: ${message}`);
    this.name = "UserDeletionError";
    this.cause = cause;
  }
}
