import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { cookies } from 'next/headers';
import { authOptions, prisma } from '@/lib/auth';
import { DEMO_MODE_COOKIE } from '@/lib/demoMode';
import { ensureSandboxUnlockedNotification } from '@/lib/sandboxNotification';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ isUnlocked: false, moonLevelsCompleted: 0 });
    }

    const userId = (session.user as any).id;
    const canUseDemoMode = Boolean((session.user as any)?.canUseDemoMode);
    const cookieStore = await cookies();
    const isDemoModeCookie = cookieStore.get(DEMO_MODE_COOKIE)?.value === 'true';
    const isDemoModeActive = canUseDemoMode && isDemoModeCookie;

    // Check completed missions on the Moon
    const completedMoonMissions = await prisma.missionProgress.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        missionId: {
          in: ['moon-1', 'moon-2', 'moon-3', '1', '2', '3', 'level-1', 'level-2', 'level-3', 'moon-1-tutorial', 'moon-2-tutorial', 'moon-3-tutorial']
        }
      },
      select: {
        missionId: true
      }
    });

    // Check how many unique Moon levels (1, 2, 3) are completed
    const completedLevels = new Set<number>();
    for (const m of completedMoonMissions) {
      const id = m.missionId.toLowerCase();
      if (id.includes('1')) completedLevels.add(1);
      if (id.includes('2')) completedLevels.add(2);
      if (id.includes('3')) completedLevels.add(3);
    }

    const isMoonCompleted = completedLevels.has(1) && completedLevels.has(2) && completedLevels.has(3);
    const isUnlocked = isMoonCompleted || isDemoModeActive;

    // If unlocked via Moon completion, check if a sandbox_unlocked notification exists; if not, create one retroactively
    if (isMoonCompleted) {
      await ensureSandboxUnlockedNotification(userId);
    }

    return NextResponse.json({
      isUnlocked,
      isDemoMode: isDemoModeActive,
      moonLevelsCompleted: completedLevels.size
    });
  } catch (error) {
    console.error('Fetch sandbox status error:', error);
    return NextResponse.json({ error: 'Internal Server Error', isUnlocked: false }, { status: 500 });
  }
}
