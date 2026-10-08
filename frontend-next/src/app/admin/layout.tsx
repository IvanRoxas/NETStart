import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '@/lib/adminAuth';

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(adminAuthOptions);
  const isTeacher = (session?.user as any)?.role === 'TEACHER';

  const iconPng = isTeacher ? '/favicon-teacher-32.png' : '/favicon-admin-32.png';
  const fullPng = isTeacher ? '/favicon-teacher.png' : '/favicon-admin.png';
  const consoleTitle = isTeacher ? 'Teacher Console' : 'Admin Console';

  return {
    title: {
      default: consoleTitle,
      template: `${consoleTitle} | %s`,
    },
    icons: {
      icon: [
        { url: iconPng, sizes: '32x32', type: 'image/png' },
        { url: fullPng, sizes: '390x394', type: 'image/png' },
      ],
      shortcut: iconPng,
      apple: fullPng,
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(adminAuthOptions);
  const role = (session?.user as any)?.role as ("SUPER_ADMIN" | "TEACHER" | undefined);
  const displayName = ((session?.user as any)?.displayName || session?.user?.name) as (string | undefined);

  return (
    <ClientLayout initialRole={role} initialDisplayName={displayName}>
      {children}
    </ClientLayout>
  );
}
