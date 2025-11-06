import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/session';
import { AIService } from '@/lib/services/ai';
import { AIExplainRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body: AIExplainRequest = await request.json();
    const { recordId } = body;

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

    // Check if explanation already exists
    const existing = await prisma.aIExplanation.findFirst({
      where: { recordId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return NextResponse.json({ explanation: existing });
    }

    // Generate AI explanation
    const metadata = record.metadata as any;
    const aiResponse = await AIService.explainLab(metadata);

    // Save explanation
    const explanation = await prisma.aIExplanation.create({
      data: {
        recordId,
        userId: session.userId,
        summary: aiResponse.summary,
        trend: aiResponse.trend,
        severity: aiResponse.severity,
        education: aiResponse.education,
        model: aiResponse.model,
        wasDeidentified: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        event: 'analyze',
        resourceType: 'record',
        resourceId: recordId,
        metadata: { model: aiResponse.model },
        currentHash: '',
      },
    });

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error('AI explain error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
