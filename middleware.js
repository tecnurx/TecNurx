// middleware.js
import { NextResponse } from "next/server";

const PROTECTED_DASHBOARDS = [
  "/dashboard", // Customer
  "/engineer-dashboard", // Engineer / Service Partner
  "/admin-dashboard", // Admin
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const staffToken = request.cookies.get("staff_jwt")?.value;

  const isProtected = PROTECTED_DASHBOARDS.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // 1. Protect all dashboards: no token → redirect to appropriate login
  if (isProtected) {
    // Allow access if there's a ?token= query param (Google redirect flow)
    if (request.nextUrl.searchParams.has("token")) {
      return NextResponse.next();
    }

    // Admin dashboard protection: requires staff_jwt or token
    if (pathname.startsWith("/admin-dashboard")) {
      if (!staffToken && !token) {
        const loginUrl = new URL("/not-even-admin-login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Engineer dashboard protection
    if (pathname.startsWith("/engineer-dashboard")) {
      if (staffToken && !token) {
        return NextResponse.redirect(new URL("/admin-dashboard", request.url));
      }
      if (!token) {
        const loginUrl = new URL("/not-engineer-login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Customer dashboard protection
    if (pathname.startsWith("/dashboard")) {
      if (staffToken && !token) {
        return NextResponse.redirect(new URL("/admin-dashboard", request.url));
      }
      if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected dashboards
    "/dashboard/:path*",
    "/engineer-dashboard/:path*",
    "/admin-dashboard/:path*",

    // All login pages
    "/login",
    "/not-engineer-login/:path*",
    "/not-even-admin-login",

    // Other auth pages
    "/register",
    "/service-partner/:path*",
    "/forgot-password",
    "/create-password/:path*",
    "/verify-email",

    // CRITICAL: Include resolve-role in matcher
    "/resolve-role",
  ],
};
