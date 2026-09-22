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
            data: { badgeId: 'b_create_account', badgeName: 'Ready for Blast Off!', badgeImage: '/assets/planets/celestial/Planet 1.svg' }
          }
        });
      }
    }

    // Auto-sync unlocked achievements to showcasedBadges if user has open showcase slots (< 6)
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true }
    });

    let currentShowcased = [...(user.showcasedBadges || [])];
    let updatedShowcased = false;

    for (const ua of userAchievements) {
      if (currentShowcased.length >= 6) break;
      const code = ua.achievement.triggerCode.toLowerCase();
      if (!currentShowcased.includes(code) && !currentShowcased.includes(ua.achievement.id)) {
        currentShowcased.push(code);
        updatedShowcased = true;
      }
    }

    if (updatedShowcased) {
      await prisma.user.update({
        where: { id: user.id },
        data: { showcasedBadges: currentShowcased }
      });
      user.showcasedBadges = currentShowcased;
    }

    const missionProgress = await prisma.missionProgress.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: 1
    });

    const allCompletedMissions = await prisma.missionProgress.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      select: { missionId: true }
    });

    return NextResponse.json({ user, missionProgress, completedMissionIds: allCompletedMissions.map(m => m.missionId) });
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

    const userId = (session.user as any).id;

    const cleanName = name !== undefined ? (typeof name === 'string' ? name.trim() : name) : undefined;
    const cleanDisplayName = displayName !== undefined ? (typeof displayName === 'string' ? displayName.trim() : displayName) : undefined;

    // Validate username uniqueness (Usernames are unique, Display names allow duplicates)
    if (cleanName !== undefined && cleanName !== '') {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: {
            equals: cleanName,
            mode: 'insensitive'
          },
          id: {
            not: userId
          }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'This username is already taken. Please choose another.' },
          { status: 409 }
        );
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(cleanName !== undefined && { name: cleanName }),
        ...(cleanDisplayName !== undefined && { displayName: cleanDisplayName }),
        ...(status !== undefined && { status }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(banner !== undefined && { banner }),
        ...(showcasedBadges !== undefined && { showcasedBadges }),
        ...(activeTitle !== undefined && { activeTitle }),
      }
    });

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
              data: { badgeId: 'b_change_pfp', badgeName: 'A New Look', badgeImage: changePfpAch.iconUrl || '/assets/planets/celestial/Planet 3.svg' }
            }
          });

          // Auto-showcase if slots available
          const u = await prisma.user.findUnique({ where: { id: userId }, select: { showcasedBadges: true } });
          if (u && u.showcasedBadges.length < 6 && !u.showcasedBadges.includes('b_change_pfp')) {
            await prisma.user.update({
              where: { id: userId },
              data: { showcasedBadges: { push: 'b_change_pfp' } }
            });
          }
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
              data: { badgeId: 'b_change_bg', badgeName: 'Interior Designer', badgeImage: changeBgAch.iconUrl || '/assets/planets/celestial/Planet 8.svg' }
            }
          });

          // Auto-showcase if slots available
          const u = await prisma.user.findUnique({ where: { id: userId }, select: { showcasedBadges: true } });
          if (u && u.showcasedBadges.length < 6 && !u.showcasedBadges.includes('b_change_bg')) {
            await prisma.user.update({
              where: { id: userId },
              data: { showcasedBadges: { push: 'b_change_bg' } }
            });
          }
        }
      }
    }

    await logSystemAction({
      actorId: userId,
      actorRole: "STUDENT",
      action: "UPDATED_PROFILE",
      details: { 
        updatedFields: Object.keys(data).filter(k => data[k] !== undefined) 
      }
    });

    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
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
        xp: true,
        gears: true,
      }
    });

    return NextResponse.json({ user: finalUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'This display name is already taken. Please choose another.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// Trigger schema refresh
