import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcrypt';
import { RegisterRequest } from '@/lib/types';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name, publicKey, encryptedPrivateKey } = body;

    // Validate input
    if (!email || !password || !publicKey || !encryptedPrivateKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        publicKey,
        encryptedPrivateKey,
      },
    });

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        publicKey: user.publicKey,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
