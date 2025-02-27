import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth");

  // Protected routes
  const protectedPaths = [
    "/dashboard",
    "/dashboard/add",
    "/admin/facilities", // Added exact path
    "/admin/facilities/add",
    "/dashboard/edit",
  ];

  // Check if the request path matches a protected route or subpath
  if (protectedPaths.some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`))) {
    if (!authCookie || authCookie.value !== "true") {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow request to proceed if authenticated or not a protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/facilities/:path*", // Still covers subpaths
    "/admin/facilities",       // Explicitly covers base path
    "/dashboard/edit/:path*",
  ],
};