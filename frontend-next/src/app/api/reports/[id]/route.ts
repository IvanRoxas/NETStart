import { NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/adminAuth";
import { logSystemAction } from "@/lib/logger";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const session = await getServerSession(adminAuthOptions);
    if (!session?.user || (session.user as any).type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminId = (session.user as any).id;

    const report = await prisma.report.update({
      where: { id },
      data: { status }
    });

    if (status === 'RESOLVED') {
      await logSystemAction({
        actorId: adminId,
        actorRole: "ADMIN",
        action: "REPORT_RESOLVED",
        targetUserId: report.userId,
        details: { reportId: report.id, type: report.type }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
