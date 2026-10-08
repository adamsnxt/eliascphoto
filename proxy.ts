import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function hasValidRegisterGate(value: string | undefined) {
  const key = process.env.REGISTER_ACCESS_KEY;
  if (!value || !key) return false;

  const [expiresAt, signature, extra] = value.split(".");
  const expiresAtNumber = Number(expiresAt);
  if (
    extra !== undefined ||
    !Number.isSafeInteger(expiresAtNumber) ||
    expiresAtNumber <= Date.now() ||
    !signature
  ) {
    return false;
  }

  const expected = createHmac("sha256", key).update(expiresAt).digest();
  const received = Buffer.from(signature, "hex");
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

function isDevelopmentLanIpv4(hostname: string) {
  if (process.env.NODE_ENV !== "development") return false;

  const octets = hostname.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function proxy(request: NextRequest) {
  const hostHeader =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;
  const hostname = hostHeader.split(",")[0].trim().split(":")[0].toLowerCase();
  const pathname = request.nextUrl.pathname;
  const isDashboardHost =
    hostname.startsWith("dash.") || isDevelopmentLanIpv4(hostname);
  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isRegisterPath =
    pathname === "/register" || pathname.startsWith("/register/");

  if (false) {
    const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);

    if (isRegisterPath) {
      if (
        pathname !== "/register" ||
        !hasValidRegisterGate(request.cookies.get("registerGate")?.value)
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

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

  if (isDashboardPath || pathname === "/login" || isRegisterPath) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
