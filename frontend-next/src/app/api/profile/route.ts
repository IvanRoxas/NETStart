import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, prisma } from '@/lib/auth';
import { logSystemAction } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        image: true,
        banner: true,
        status: true,
        bio: true,
        createdAt: true,
        showcasedBadges: true,
        activeTitle: true,
        xp: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-sync B_CREATE_ACCOUNT if they somehow missed it (e.g., during a server error)
    const createAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_CREATE_ACCOUNT' } });
    if (createAch) {
      const hasCreateAch = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId: user.id, achievementId: createAch.id } }
      });
      if (!hasCreateAch) {
        await prisma.userAchievement.create({
          data: { userId: user.id, achievementId: createAch.id }
        });
        const { addXPAndCheckLevelUp } = await import('@/lib/xp');
        await addXPAndCheckLevelUp(user.id, createAch.xpReward);
        // Generate notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            notificationType: 'achievement_unlocked',
            data: { badgeId: 'b_create_account', badgeName: 'Ready for Blast Off!', badgeImage: '/Planet 1.svg' }
          }
        });
      }
    }

    const missionProgress = await prisma.missionProgress.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: 3
    });

    return NextResponse.json({ user, missionProgress });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { name, displayName, status, bio, image, banner, showcasedBadges, activeTitle } = data;

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
        ...(status !== undefined && { status }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(banner !== undefined && { banner }),
        ...(showcasedBadges !== undefined && { showcasedBadges }),
        ...(activeTitle !== undefined && { activeTitle }),
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        image: true,
        banner: true,
        status: true,
        bio: true,
        showcasedBadges: true,
        activeTitle: true,
      }
    });

    const userId = (session.user as any).id;
    if (image !== undefined) {
      const changePfpAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_CHANGE_PFP' } });
      if (changePfpAch) {
        const hasChangePfp = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: changePfpAch.id } }
        });
        if (!hasChangePfp) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: changePfpAch.id }
          });
          const { addXPAndCheckLevelUp } = await import('@/lib/xp');
          await addXPAndCheckLevelUp(userId, changePfpAch.xpReward);
          
          await prisma.notification.create({
            data: {
              userId,
              notificationType: 'achievement_unlocked',
              data: { badgeId: 'b_change_pfp', badgeName: 'A New Look', badgeImage: changePfpAch.iconUrl || '/Planet 3.svg' }
            }
          });
        }
      }
    }

    if (banner !== undefined) {
      const changeBgAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_CHANGE_BG' } });
      if (changeBgAch) {
        const hasChangeBg = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: changeBgAch.id } }
        });
        if (!hasChangeBg) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: changeBgAch.id }
          });
          const { addXPAndCheckLevelUp } = await import('@/lib/xp');
          await addXPAndCheckLevelUp(userId, changeBgAch.xpReward);
          
          await prisma.notification.create({
            data: {
              userId,
              notificationType: 'achievement_unlocked',
              data: { badgeId: 'b_change_bg', badgeName: 'Interior Designer', badgeImage: changeBgAch.iconUrl || '/Planet 8.svg' }
            }
          });
        }
      }
    }

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "STUDENT",
      action: "UPDATED_PROFILE",
      details: { 
        updatedFields: Object.keys(data).filter(k => data[k] !== undefined) 
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// Trigger schema refresh
