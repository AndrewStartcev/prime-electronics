import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "prime-electronics.ru";

const isContentPath = (pathname: string) =>
  pathname.startsWith("/catalog/") ||
  pathname.startsWith("/product/") ||
  pathname.startsWith("/blog/");

const shouldSkipPath = (pathname: string) =>
  pathname.startsWith("/_next/") ||
  pathname.startsWith("/api/") ||
  pathname === "/favicon.ico" ||
  pathname === "/robots.txt" ||
  pathname === "/sitemap.xml" ||
  (!isContentPath(pathname) && /\.[a-z0-9]+$/i.test(pathname));

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host")?.split(":")[0] || url.hostname;
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const lowerPathname = url.pathname.toLowerCase();

  let shouldRedirect = false;

  if (host === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    url.port = "";
    if (forwardedProto) {
      url.protocol = `${forwardedProto}:`;
    }
    shouldRedirect = true;
  }

  if (!shouldSkipPath(url.pathname) && url.pathname !== lowerPathname) {
    url.pathname = lowerPathname;
    shouldRedirect = true;
  }

  return shouldRedirect
    ? NextResponse.redirect(url, { status: 301 })
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
