import { verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value;

    const publicPaths = ['/api/auth/login', '/api/auth/register', '/login', '/register','/'];

    const { pathname } = req.nextUrl;

    if(pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
        if(!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyToken(token!);
        if(!decoded) {
                return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        return NextResponse.next();
            
    }
   

    if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/measurements/:path*",
    "/api/:path*"
  ],
};



