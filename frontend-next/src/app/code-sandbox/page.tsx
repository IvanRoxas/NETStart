import React from 'react';
import SandboxClient from '@/components/sandbox/SandboxClient';
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { DEMO_MODE_COOKIE } from '@/lib/demoMode';

export default async function CodeSandboxPage() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { canUseDemoMode: true },
  });
  const canUseDemoMode = Boolean(user?.canUseDemoMode);
  const cookieStore = await cookies();
  const isDemoModeCookie = cookieStore.get(DEMO_MODE_COOKIE)?.value === 'true';
  const isDemoMode = canUseDemoMode && isDemoModeCookie;

  const completedMoonMissions = await prisma.missionProgress.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      missionId: {
        in: ['moon-1', 'moon-2', 'moon-3', '1', '2', '3', 'level-1', 'level-2', 'level-3', 'moon-1-tutorial', 'moon-2-tutorial', 'moon-3-tutorial']
      }
    },
    select: { missionId: true }
  });

  const completedLevels = new Set<number>();
  for (const m of completedMoonMissions) {
    const id = m.missionId.toLowerCase();
    if (id.includes('1')) completedLevels.add(1);
    if (id.includes('2')) completedLevels.add(2);
    if (id.includes('3')) completedLevels.add(3);
  }

  const isMoonCompleted = completedLevels.has(1) && completedLevels.has(2) && completedLevels.has(3);
  const isUnlocked = isMoonCompleted || isDemoMode;

  if (!isUnlocked) {
    redirect('/modules?locked=sandbox');
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden bg-[#0d0418] relative">
      <SandboxClient />
    </div>
  );
}

