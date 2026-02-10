// // middleware.js
// import { NextResponse } from "next/server";

// const PROTECTED_DASHBOARDS = [
//   "/dashboard", // Customer
//   "/engineer-dashboard", // Engineer / Service Partner
//   "/admin-dashboard", // Future admin
// ];

// export function middleware(request) {
//   const { pathname } = request.nextUrl;
//   const token = request.cookies.get("token")?.value;

//   const isProtected = PROTECTED_DASHBOARDS.some((prefix) =>
//     pathname.startsWith(prefix)
//   );

//   // 1. Protect all dashboards: no token → redirect to the most likely login
//   if (isProtected && !token) {
//     // Smart redirect: if trying engineer dashboard → service partner flow
//     if (pathname.startsWith("/engineer-dashboard")) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//     // Default to customer login
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // 2. If already logged in and visiting any auth/login page → go to resolver
//   // const isAuthPage =
//   //   pathname.startsWith("/login") ||
//   //   pathname.startsWith("/register") ||
//   //   pathname.startsWith("/service-partner") ||
//   //   pathname.startsWith("/forgot-password") ||
//   //   pathname.startsWith("/create-password") ||
//   //   pathname.startsWith("/verify-email");

//   // if (isAuthPage && token) {
//   //   return NextResponse.redirect(new URL("/resolve-role", request.url));
//   // }

//   // // Allow everything else
//   // return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/engineer-dashboard/:path*",
//     "/admin-dashboard/:path*",
//     "/login",
//     "/register",
//     "/service-partner/:path*",
//     "/forgot-password",
//     "/create-password/:path*",
//     "/verify-email",
//   ],
// };

//TODO: NEW ONE---------------------------------------------

// middleware.js
// import { NextResponse } from "next/server";

// const PROTECTED_DASHBOARDS = [
//   "/dashboard", // Customer
//   "/engineer-dashboard", // Engineer / Service Partner
//   "/admin-dashboard", // Admin
// ];

// // All login/auth pages across the app
// const AUTH_PAGES = [
//   "/login", // Customer login
//   "/not-engineer-login", // Engineer login
//   "/not-even-admin-login", // Admin login
//   "/register",
//   "/service-partner",
//   "/forgot-password",
//   "/create-password",
//   "/verify-email",
// ];

// export function middleware(request) {
//   const { pathname } = request.nextUrl;
//   const token = request.cookies.get("token")?.value;

//   const isProtected = PROTECTED_DASHBOARDS.some((prefix) =>
//     pathname.startsWith(prefix),
//   );

//   // 1. Protect all dashboards: no token → redirect to appropriate login
//   if (isProtected && !token) {
//     //for google auth callback with token in URL, clean it immediately and set cookie/localStorage
//     if (request.nextUrl.searchParams.has("token")) {
//       const cleanUrl = request.nextUrl.clone();
//       cleanUrl.searchParams.delete("token");
//       return NextResponse.redirect(cleanUrl);
//     }

//     // Smart redirect based on which dashboard they're trying to access
//     if (pathname.startsWith("/engineer-dashboard")) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     if (pathname.startsWith("/admin-dashboard")) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     // Default to customer login with redirect parameter
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // 2. If already logged in and visiting ANY login/auth page → go to resolver
//   const isAuthPage = AUTH_PAGES.some((authPath) =>
//     pathname.startsWith(authPath),
//   );

//   // CRITICAL: Don't redirect if already on resolve-role (prevents infinite loop)
//   const isResolvePage = pathname.startsWith("/resolve-role");

//   if (isAuthPage && token && !isResolvePage) {
//     console.log(
//       `User with token visited ${pathname}, redirecting to resolve-role`,
//     );
//     return NextResponse.redirect(new URL("/resolve-role", request.url));
//   }

//   // 3. Allow everything else (including resolve-role itself)
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Protected dashboards
//     "/dashboard/:path*",
//     "/engineer-dashboard/:path*",
//     "/admin-dashboard/:path*",

//     // All login pages
//     "/login",
//     "/not-engineer-login",
//     "/not-even-admin-login",

//     // Other auth pages
//     "/register",
//     "/service-partner/:path*",
//     "/forgot-password",
//     "/create-password/:path*",
//     "/verify-email",

//     // CRITICAL: Include resolve-role in matcher
//     "/resolve-role",
//   ],
// };

// ! NEW ONE AGAIN ---------------------------------------------------

import { NextResponse } from "next/server";

const PROTECTED_DASHBOARDS = [
  "/dashboard",
  "/engineer-dashboard",
  "/admin-dashboard",
];

const AUTH_PAGES = [
  "/login",
  "/not-engineer-login",
  "/not-even-admin-login",
  "/register",
  "/service-partner",
  "/forgot-password",
  "/create-password",
  "/verify-email",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  let token = request.cookies.get("token")?.value;

  const isProtected = PROTECTED_DASHBOARDS.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthPage = AUTH_PAGES.some((authPath) =>
    pathname.startsWith(authPath),
  );

  const isResolvePage = pathname.startsWith("/resolve-role");

  // ────────────────────────────────────────────────
  // Handle Google OAuth callback (token in URL)
  // ────────────────────────────────────────────────
  const urlToken = request.nextUrl.searchParams.get("token");

  if (urlToken) {
    // Set the cookie immediately
    const response = NextResponse.next(); // or redirect later

    // Set cookie — adjust maxAge, path, secure as needed
    response.cookies.set("token", urlToken, {
      httpOnly: true, // more secure
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Clean the URL (remove ?token=...)
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("token");

    // Redirect to clean URL — now with cookie set
    return NextResponse.redirect(cleanUrl);
  }

  // ────────────────────────────────────────────────
  // Normal protection logic
  // ────────────────────────────────────────────────
  if (isProtected && !token) {
    if (pathname.startsWith("/engineer-dashboard")) {
      return NextResponse.redirect(new URL("/not-engineer-login", request.url));
    }

    if (pathname.startsWith("/admin-dashboard")) {
      return NextResponse.redirect(
        new URL("/not-even-admin-login", request.url),
      );
    }

    // Customer default
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && token && !isResolvePage) {
    console.log(
      `User with token visited ${pathname} → redirecting to /resolve-role`,
    );
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
    "/not-engineer-login",
    "/not-even-admin-login",
    "/register",
    "/service-partner/:path*",
    "/forgot-password",
    "/create-password/:path*",
    "/verify-email",
    "/resolve-role",
  ],
};
