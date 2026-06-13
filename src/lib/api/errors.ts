export class ApiEndpointPendingError extends Error {
  constructor(endpoint: string) {
    super(
      `API endpoint is not available yet. Backend endpoint required: ${endpoint}`
    );
    this.name = "ApiEndpointPendingError";
  }
}
