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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}
