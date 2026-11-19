// middleware.js
import { NextResponse } from "next/server";

const PROTECTED_DASHBOARDS = [
  "/dashboard", // Customer
  "/engineer-dashboard", // Engineer / Service Partner
  "/admin-dashboard", // Admin
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js internals, static assets and media files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Secret preview bypass handling (e.g. ?preview=launch2026 or ?exit_preview=true)
  const secretKey = process.env.PREVIEW_SECRET || "launch2026";
  const previewParam = request.nextUrl.searchParams.get("preview");
  const exitParam = request.nextUrl.searchParams.get("exit_preview");

  if (previewParam === secretKey) {
    // Redirect to clean URL without query param and set preview cookie
    const cleanUrl = new URL(pathname, request.url);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set("preview_mode", "true", {
      path: "/",
      httpOnly: false, // allow client-side detection for exit badge
      sameSite: "lax",
    });
    return response;
  }

  if (exitParam === "true") {
    // Exit preview mode
    const cleanUrl = new URL("/", request.url);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.delete("preview_mode");
    return response;
  }

  const isPreviewMode = request.cookies.get("preview_mode")?.value === "true";
  const isMaintenanceActive = process.env.MAINTENANCE_MODE !== "false";

  // 3. Maintenance / Coming Soon mode (when active and not in preview mode)
  if (isMaintenanceActive && !isPreviewMode) {
    if (pathname === "/coming-soon") {
      return NextResponse.next();
    }
    // Rewrite all routes (including /login, /dashboard, /, etc.) to the coming-soon page
    return NextResponse.rewrite(new URL("/coming-soon", request.url));
  }

  // 4. Standard Site Middleware (active when in preview mode or MAINTENANCE_MODE=false)
  const token = request.cookies.get("token")?.value;
  const staffToken = request.cookies.get("staff_jwt")?.value;

  const isProtected = PROTECTED_DASHBOARDS.some((prefix) =>
    pathname.startsWith(prefix)
  );

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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
