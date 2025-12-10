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

    // 2) AUTH & LIVE API routes – always allow (NOVO: Dodana iznimka za LIVE rutu)
    if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/measurements/live") // <--- DODAJTE OVU LINIJU
    ) {
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

  if (pathname.startsWith("/api")) {
        // ... (Logika provjere tokena ostaje ovdje za sve druge /api rute)
        
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        // ... (provjera dekodiranja tokena)
        
        return NextResponse.next();
    }

    return NextResponse.next();
  }

  

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/measurements/:path*", "/api/:path*"],
};
