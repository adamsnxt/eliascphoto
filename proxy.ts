import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hostHeader =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;
  const hostname = hostHeader.split(",")[0].trim().split(":")[0].toLowerCase();
  const pathname = request.nextUrl.pathname;
  const isDashboardHost = hostname.startsWith("dash.");
  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboardHost) {
    const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);

    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/") {
      if (request.method !== "POST" && hasRefreshToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.rewrite(url);
    }

    if (!hasRefreshToken) {
      if (request.headers.has("next-action")) {
        return new NextResponse(null, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isDashboardPath) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/dashboard${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isDashboardPath || pathname === "/login") {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
