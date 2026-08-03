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

    return NextResponse.json({ user });
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
