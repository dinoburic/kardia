import { prisma } from '@/db/client';
import { hashPassword } from '@/lib/hash';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if(!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }), { status: 400 };
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if(existingUser) {
            return NextResponse.json({ message: 'Email already exists.' }), { status: 400 };
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                createdAt: new Date()
            },
        });

        return NextResponse.json({ message: 'User registered successfully.', user: { id: user.id, name: user.name, email: user.email } }), { status: 201 };
    }
    catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }), { status: 500 };
    }


}