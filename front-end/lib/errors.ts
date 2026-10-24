// src/lib/errors.ts
export type ApiErrorCode =
  | "BAD_REQUEST"
  | "INVALID_JSON"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: unknown;

  constructor(
    message: string,
    status = 500,
    code: ApiErrorCode = "INTERNAL_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
  }
}
export class InvalidJsonError extends AppError {
  constructor(message = "Invalid JSON body", details?: unknown) {
    super(message, 400, "INVALID_JSON", details);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
  }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}
export class ValidationError extends AppError {
  constructor(message = "Validation error", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}
