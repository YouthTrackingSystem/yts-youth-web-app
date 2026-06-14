import { env } from "@/lib/env";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";
import { ApiError } from "./errors";
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

      const { body, skipAuth = false, ...fetchOptions } = requestOptions;
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");

      const token = getAccessToken();

      if (token && !skipAuth) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (body !== undefined && !(body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      const requestBaseUrl =
        typeof window === "undefined" ? baseUrl : "/api/youth-proxy";
      const response = await fetch(
        `${requestBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
        {
          ...fetchOptions,
          headers,
          body:
            body === undefined
              ? undefined
              : body instanceof FormData
                ? body
                : JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
          errors?: Record<string, string[]>;
        } | null;

        if (response.status === 401) {
          clearAccessToken();

          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.assign("/login");
          }
        }

        throw new ApiError(
          payload?.message ?? `API request failed with status ${response.status}.`,
          response.status,
          payload?.errors
        );
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      return response.json() as Promise<TResponse>;
    }
  };
}

export const apiClient = createApiClient();
