import { prisma } from "@/db/client";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;
        if(!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }), { status: 400 };
        }
        
        const user = await prisma.user.findUnique({ where: { email } });

        if(!user) {
            return NextResponse.json({ message: 'Invalid email or password.' }), { status: 401 };
        }

        const isValidPassword = password === user.password;
        if(!isValidPassword) {
            return NextResponse.json({ message: 'Invalid email or password.' }), { status: 401 };
        }

        const token = signToken({ userId: user.id, email: user.email });

        (await cookies()).set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({ message: 'Login successful.', user: { id: user.id, name: user.name, email: user.email } }), { status: 200 };
    }
    catch (error) {
        console.error('Error during login:', error);
        return NextResponse.json({ message: 'Internal Server Error' }), { status: 500 };
    }
}