export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export class ApiEndpointPendingError extends Error {
  constructor(endpoint: string) {
    super(`API endpoint is not available yet: ${endpoint}`);
    this.name = "ApiEndpointPendingError";
  }
}
