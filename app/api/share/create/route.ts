import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';
import { CreateShareLinkRequest } from '@/lib/types';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body: CreateShareLinkRequest = await request.json();
    const { recordIds, expiresInHours, maxViews } = body;

    if (!recordIds || recordIds.length === 0) {
      return NextResponse.json(
        { error: 'No records specified' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('base64url');

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expiresInHours || 24));

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        userId: session.userId,
        token,
        recordIds: JSON.stringify(recordIds),
        wrappedKeys: '{}', // TODO: Implement key wrapping for recipient
        expiresAt,
        maxViews,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        event: 'share',
        resourceType: 'share_link',
        resourceId: shareLink.id,
        metadata: { recordCount: recordIds.length, expiresInHours },
        currentHash: '',
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`;

    return NextResponse.json({ shareLink, shareUrl });
  } catch (error: any) {
    console.error('Create share error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
