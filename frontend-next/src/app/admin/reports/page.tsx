import { prisma } from '@/lib/auth';
import ReportsClient from './ReportsClient';

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
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
