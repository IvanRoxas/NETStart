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
    const role = (session.user as any).role || "SUPER_ADMIN";

    // Verify admin is active
    const liveAdmin = await prisma.systemAdmin.findUnique({
      where: { id: adminId },
      select: { isActive: true }
    });
    if (!liveAdmin || liveAdmin.isActive === false) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }

    // Role-based access control for Teachers
    if (role === "TEACHER") {
      const existingReport = await prisma.report.findUnique({
        where: { id },
        include: { user: { select: { section: { select: { teacherId: true } } } } }
      });
      if (!existingReport) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      if (existingReport.user?.section?.teacherId !== adminId) {
        return NextResponse.json({ error: "Forbidden: You may only resolve reports for students in your sections" }, { status: 403 });
      }
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status }
    });

    if (status === 'RESOLVED') {
      await logSystemAction({
        actorId: adminId,
        actorRole: role,
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
