const TOKEN_STORAGE_KEY = "yts_youth_access_token";

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string) {
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
