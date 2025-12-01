import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).set("auth_token", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0, // obriši cookie
  });

  return NextResponse.json({ message: "Logged out" });
}
