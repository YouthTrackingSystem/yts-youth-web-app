export type ApiClientOptions = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type ApiClient = {
  request: <TResponse>(
    path: string,
    options?: ApiRequestOptions
  ) => Promise<TResponse>;
};
