// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get("userRole")?.value;

  // Public routes - allow access
  if (pathname === "/" || !pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!userRole) {
    return NextResponse.redirect(new URL("/log-in", request.url));
  }

  // Role-based route restrictions
  const roleRoutes = {
    admin: ["/dashboard"], // Admin can access everything
    receptionist: ["/dashboard/bookings", "/dashboard/guests"],
    housekeeper: ["/dashboard/housekeeping", "/dashboard/inventory"],
  };

  if (userRole !== "admin") {
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes];
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
