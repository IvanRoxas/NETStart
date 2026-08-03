import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/auth';
import { logSystemAction } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, description, attachments } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Attachments should be an array of strings (max 5)
    let validAttachments: string[] = [];
    if (Array.isArray(attachments)) {
      validAttachments = attachments.slice(0, 5); // Enforce max 5
    } else if (body.image) {
      // Fallback for old clients
      validAttachments = [body.image];
    }

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        type: type || 'bug',
        description,
        attachments: validAttachments,
        status: 'PENDING',
      }
    });

    await logSystemAction({
      actorId: session.user.id,
      actorRole: "STUDENT",
      action: "CREATED_REPORT",
      details: { reportId: report.id, type: report.type }
    });

    return NextResponse.json(
      { message: 'Report submitted successfully', reportId: report.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
