import { prisma } from '@/lib/auth';
import { requireAdmin } from '@/app/admin/actions';
import ReportsClient from './ReportsClient';

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await requireAdmin();
  const role = (session.user as any).role || "SUPER_ADMIN";
  const adminId = (session.user as any).id;

  let whereClause: any = {};
  if (role === "TEACHER") {
    whereClause.user = {
      section: {
        teacherId: adminId
      }
    };
  }

  const reports = await prisma.report.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <ReportsClient initialReports={reports} />;
}
