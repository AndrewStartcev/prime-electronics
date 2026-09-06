import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Публичные маршруты, не требующие авторизации
const publicRoutes = ["/login"];
const managerRestrictedRoutes = [
  "/users",
  "/settings",
  "/analytics",
  "/reports",
  "/transactions",
  "/deleted",
];

function parseRoleFromToken(token?: string): string | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { role?: unknown };

    return typeof decoded.role === "string" ? decoded.role.toUpperCase() : null;
  } catch {
    return null;
  }
}

function isManagerRole(role?: string | null): boolean {
  if (!role) return false;
  return role === "MANAGER" || role === "EDITOR";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем наличие токена в cookies
  const token = request.cookies.get("admin_access_token")?.value;
  const roleCookie = request.cookies.get("admin_role")?.value?.toUpperCase() || null;
  const tokenRole = parseRoleFromToken(token);
  const role = roleCookie || tokenRole;

  // Если это публичный маршрут
  if (publicRoutes.includes(pathname)) {
    // Если пользователь уже авторизован, редиректим на главную
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Если нет токена, редиректим на логин
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isManagerRole(role) &&
    managerRestrictedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Применяем middleware ко всем маршрутам кроме:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (search crawler rules)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
