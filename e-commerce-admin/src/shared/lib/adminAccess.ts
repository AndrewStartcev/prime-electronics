export type AdminRole =
  | "ADMIN"
  | "MANAGER"
  | "EDITOR"
  | "USER"
  | "CUSTOMER"
  | string;

export const MANAGER_RESTRICTED_ROUTE_PREFIXES = [
  "/users",
  "/settings",
  "/analytics",
  "/reports",
  "/transactions",
  "/deleted",
] as const;

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return atob(padded);
  } catch {
    return null;
  }
}

export function parseRoleFromJwt(token?: string | null): AdminRole | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payloadRaw = decodeBase64Url(parts[1]);
  if (!payloadRaw) return null;

  try {
    const payload = JSON.parse(payloadRaw) as { role?: unknown };
    if (typeof payload.role === "string" && payload.role.trim()) {
      return payload.role.toUpperCase();
    }
  } catch {
    return null;
  }

  return null;
}

export function isManagerRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase();
  return normalized === "MANAGER" || normalized === "EDITOR";
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  return role.toUpperCase() === "ADMIN";
}

export function canDeleteProducts(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canDeleteBrands(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canDeleteCategories(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canDeleteCatalogEntities(role?: string | null): boolean {
  return isAdminRole(role);
}

export function canAccessAdminRoute(
  pathname: string,
  role?: string | null,
): boolean {
  if (isAdminRole(role)) return true;
  if (!isManagerRole(role)) return true;

  return !MANAGER_RESTRICTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getStoredAdminRole(): AdminRole | null {
  if (typeof window === "undefined") return null;

  const storedRole = localStorage.getItem("admin_role");
  if (storedRole?.trim()) {
    return storedRole.toUpperCase();
  }

  const token =
    localStorage.getItem("admin_access_token") ||
    getCookie("admin_access_token");
  return parseRoleFromJwt(token);
}
import { getCookie } from "./adminSession";
