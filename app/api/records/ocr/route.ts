import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';
import { OCRService } from '@/lib/services/ocr';
import { readFile } from '@/lib/services/storage';

/**
 * OCR endpoint for extracting metadata from uploaded files
 * Note: For true end-to-end encryption, OCR should be done client-side
 * This is a server-side implementation for MVP purposes
 */
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

    // Get record
    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record || record.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Read the encrypted file
    // Note: In a true E2E encrypted system, this would need to be decrypted client-side
    // For MVP, we'll work with the encrypted file or require a plaintext version
    // For now, we'll assume the file needs to be decrypted server-side for OCR

    // For this MVP, we'll return a message that OCR requires the plaintext file
    // In production, this should be done client-side before encryption
    return NextResponse.json(
      {
        error: 'OCR requires client-side processing for E2E encryption',
        message: 'Please process the file before upload or use manual metadata entry',
      },
      { status: 501 }
    );

    // TODO: Implement client-side OCR or server-side with temporary decryption
  } catch (error: any) {
    console.error('OCR error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'OCR failed' },
      { status: 500 }
    );
  }
}
