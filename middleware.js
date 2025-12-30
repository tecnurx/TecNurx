// middleware.ts
import { NextResponse } from "next/server";

const PROTECTED_DASHBOARDS = [
  "/dashboard", // Customer
  "/engineer-dashboard", // Engineer / Service Partner
  "/admin-dashboard", // Future admin
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtected = PROTECTED_DASHBOARDS.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // 1. Protect all dashboards: no token → redirect to the most likely login
  if (isProtected && !token) {
    // Smart redirect: if trying engineer dashboard → service partner flow
    if (pathname.startsWith("/engineer-dashboard")) {
      return NextResponse.redirect(new URL("/service-partner", request.url));
    }
    // Default to customer login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and visiting any auth/login page → go to resolver
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/service-partner") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/create-password") ||
    pathname.startsWith("/verify-email");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/resolve-role", request.url));
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/engineer-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/login",
    "/register",
    "/service-partner/:path*",
    "/forgot-password",
    "/create-password/:path*",
    "/verify-email",
  ],
};
