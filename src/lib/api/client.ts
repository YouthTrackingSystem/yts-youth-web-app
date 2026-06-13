import { env } from "@/lib/env";
import type { ApiClient, ApiClientOptions, ApiRequestOptions } from "./types";

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? env.NEXT_PUBLIC_API_BASE_URL;

  return {
    async request<TResponse>(
      path: string,
      requestOptions: ApiRequestOptions = {}
    ): Promise<TResponse> {
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
      }

      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");

      if (requestOptions.body !== undefined) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${baseUrl}${path}`, {
        ...requestOptions,
        headers,
        body:
          requestOptions.body === undefined
            ? undefined
            : JSON.stringify(requestOptions.body),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}.`);
      }

      return response.json() as Promise<TResponse>;
    }
  };
}

export const apiClient = createApiClient();
