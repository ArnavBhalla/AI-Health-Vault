import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';
import { UploadRecordRequest } from '@/lib/types';
import { StorageService } from '@/lib/services/storage';
import { base64ToArrayBuffer } from '@/lib/crypto/encryption';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body: UploadRecordRequest = await request.json();

    const { type, filename, ciphertext, wrappedKey, iv, metadata, source } = body;

    if (!type || !filename || !ciphertext || !wrappedKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 ciphertext to buffer and save to storage
    const ciphertextBuffer = Buffer.from(base64ToArrayBuffer(ciphertext));
    const ciphertextUrl = await StorageService.saveEncryptedFile(
      ciphertextBuffer,
      session.userId,
      filename
    );

    // Create record in database
    const record = await prisma.record.create({
      data: {
        userId: session.userId,
        type,
        filename,
        ciphertextUrl,
        wrappedKey,
        metadata: metadata || {},
        source: source || 'upload',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        event: 'upload',
        resourceType: 'record',
        resourceId: record.id,
        metadata: { filename, type },
        currentHash: '', // Will implement hash chain later
      },
    });

    return NextResponse.json({ record });
  } catch (error: any) {
    console.error('Upload error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
