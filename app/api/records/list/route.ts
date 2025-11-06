import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: any = { userId: session.userId };
    if (type) {
      where.type = type;
    }

    const records = await prisma.record.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        aiExplanations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    console.error('List records error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
