import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { recordId } = await request.json();

    if (!recordId) {
      return NextResponse.json(
        { error: 'Missing recordId' },
        { status: 400 }
      );
    }

    // Get record with AI explanations
    const record = await prisma.record.findUnique({
      where: { id: recordId },
      include: {
        aiExplanations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!record || record.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        event: 'access',
        resourceType: 'record',
        resourceId: recordId,
        metadata: { action: 'export' },
        currentHash: '',
      },
    });

    // Return record data for export
    // Note: Client will need to decrypt the ciphertext if they want the original file
    return NextResponse.json({
      record: {
        id: record.id,
        type: record.type,
        filename: record.filename,
        metadata: record.metadata,
        ciphertextUrl: record.ciphertextUrl,
        wrappedKey: record.wrappedKey,
        createdAt: record.createdAt,
        aiExplanation: record.aiExplanations[0] || null,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to export record' },
      { status: 500 }
    );
  }
}
