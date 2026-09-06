export const ADMIN_SESSION_STORAGE_KEYS = [
  "admin_access_token",
  "admin_refresh_token",
  "admin_role",
  "admin_name",
  "admin_email",
] as const;

export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  }

  return null;
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    ADMIN_SESSION_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  deleteCookie("admin_access_token");
  deleteCookie("admin_refresh_token");
  deleteCookie("admin_role");
}

export function setAdminSession(data: {
  accessToken: string;
  refreshToken: string;
  role?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  setCookie("admin_access_token", data.accessToken, 7);
  setCookie("admin_refresh_token", data.refreshToken, 30);

  if (data.role) {
    setCookie("admin_role", data.role, 30);
  }

  if (typeof window === "undefined") return;

  localStorage.setItem("admin_access_token", data.accessToken);
  localStorage.setItem("admin_refresh_token", data.refreshToken);

  if (data.role) {
    localStorage.setItem("admin_role", data.role);
  }
  localStorage.setItem("admin_name", data.name || "");
  localStorage.setItem("admin_email", data.email || "");
}

export function hasAdminSession(): boolean {
  if (typeof window === "undefined") return false;

  return Boolean(
    getCookie("admin_access_token") ||
    localStorage.getItem("admin_access_token"),
  );
}
