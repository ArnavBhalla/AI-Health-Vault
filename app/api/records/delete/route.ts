import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';
import { deleteFile } from '@/lib/services/storage';

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

    // Get record to verify ownership and get file path
    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record || record.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    try {
      await deleteFile(record.ciphertextUrl);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete record from database (cascades to AI explanations)
    await prisma.record.delete({
      where: { id: recordId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        event: 'delete',
        resourceType: 'record',
        resourceId: recordId,
        currentHash: '',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}
