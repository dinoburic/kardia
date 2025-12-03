import { verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  const publicPages = ["/", "/login", "/register"];

  // 1) Public pages – always allow
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // 2) AUTH API routes – always allow
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 3) Protected dashboard pages
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/measurements")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // 4) Protected API routes (NOT auth)
  if (pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/measurements/:path*", "/api/:path*"],
};
