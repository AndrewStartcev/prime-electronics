import { NextRequest, NextResponse } from "next/server";

const MANAGED_STATIC_PATHS = new Set([
  "/about",
  "/delivery",
  "/warranty",
  "/contacts",
  "/promotions",
  "/trade-in",
]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!MANAGED_STATIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/managed-static-page";
  url.searchParams.set("path", pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/about",
    "/delivery",
    "/warranty",
    "/contacts",
    "/promotions",
    "/trade-in",
  ],
};
