import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, prisma } from '@/lib/auth';
import { logSystemAction } from '@/lib/logger';
import { addXPAndCheckLevelUp } from '@/lib/xp';
import { getTitleDefinition, evaluateTitleUnlocks } from '@/lib/titlesData';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email;

    if (!session || (!sessionUserId && !sessionEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: sessionUserId ? { id: sessionUserId } : { email: sessionEmail! },
        select: {
          id: true,
          name: true,
          displayName: true,
          email: true,
          image: true,
          banner: true,
          border: true,
          status: true,
          bio: true,
          createdAt: true,
          showcasedBadges: true,
          activeTitle: true,
          xp: true,
          hasTakenAptitudeTest: true,
          logicScore: true,
          patternRecognitionScore: true,
          taskDecompositionScore: true,
          recommendedLearningPath: true,
          canUseDemoMode: true,
        }
      });
    } catch (err: any) {
      console.warn("Extended user fields select failed, falling back to base fields:", err?.message);
      user = await prisma.user.findFirst({
        where: sessionUserId ? { id: sessionUserId } : { email: sessionEmail! },
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
          hasTakenAptitudeTest: true,
          logicScore: true,
          patternRecognitionScore: true,
          taskDecompositionScore: true,
          recommendedLearningPath: true,
        }
      });
      if (user) {
        try {
          const rawRes: any = await prisma.$queryRaw`SELECT border, can_use_demo_mode FROM users WHERE user_id = ${user.id} LIMIT 1`;
          if (rawRes && rawRes[0]) {
            if (rawRes[0].border !== undefined) user.border = rawRes[0].border;
            (user as any).canUseDemoMode = Boolean(rawRes[0].can_use_demo_mode);
          }
        } catch (_) {
          user.border = null;
          (user as any).canUseDemoMode = false;
        }
      }
    }

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

    const validTriggerCodes = new Set(
      userAchievements
        .map(ua => (ua.achievement?.triggerCode || '').toLowerCase())
        .filter(Boolean)
    );
    const validAchievementIds = new Set(
      userAchievements
        .map(ua => (ua.achievement?.id || '').toLowerCase())
        .filter(Boolean)
    );

    // Filter out phantom/deleted badges from showcasedBadges
    let currentShowcased = (user.showcasedBadges || []).filter((rawCode: string) => {
      const c = (rawCode || '').toLowerCase();
      return validTriggerCodes.has(c) || validAchievementIds.has(c);
    });

    let updatedShowcased = currentShowcased.length !== (user.showcasedBadges || []).length;

    for (const ua of userAchievements) {
      if (currentShowcased.length >= 6) break;
      const code = (ua.achievement?.triggerCode || '').toLowerCase();
      if (code && !currentShowcased.includes(code) && !currentShowcased.includes(ua.achievement.id)) {
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

    // Compute actual stats for syncing across dashboard, profile, and badges page
    const completedMissions = await prisma.missionProgress.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        NOT: {
          missionId: {
            startsWith: "daily-",
          },
        },
      },
      select: {
        missionId: true,
      },
    });

    const completedMissionSet = new Set(completedMissions.map(m => m.missionId.toLowerCase()));

    // Planets and their mission identifiers (3 levels per planet)
    const planetDefinitions = [
      { id: 'moon', levels: [['moon-1', '1', 'level-1', 'html-1', 'moon-1-tutorial'], ['moon-2', '2', 'level-2', 'html-2', 'moon-2-tutorial'], ['moon-3', '3', 'level-3', 'html-3', 'moon-3-tutorial']] },
      { id: 'mars', levels: [['mars-1', 'html-1-mars', 'html-1', 'mars-1-html'], ['mars-2', 'html-2-mars', 'html-2', 'mars-2-html'], ['mars-3', 'html-3-mars', 'html-3', 'mars-3-html']] },
      { id: 'venus', levels: [['venus-1', 'css-1-venus', 'css-1', 'venus-1-css'], ['venus-2', 'css-2-venus', 'css-2', 'venus-2-css'], ['venus-3', 'css-3-venus', 'css-3', 'venus-3-css']] },
      { id: 'mercury', levels: [['mercury-1', 'js-1-mercury', 'javascript-1', 'js-1', 'mercury-1-js'], ['mercury-2', 'js-2-mercury', 'javascript-2', 'js-2', 'mercury-2-js'], ['mercury-3', 'js-3-mercury', 'javascript-3', 'js-3', 'mercury-3-js']] },
      { id: 'jupiter', levels: [['jupiter-1', 'java-1', 'jupiter-1-java'], ['jupiter-2', 'java-2', 'jupiter-2-java'], ['jupiter-3', 'java-3', 'jupiter-3-java']] },
      { id: 'saturn', levels: [['saturn-1', 'cpp-1', 'saturn-1-cpp'], ['saturn-2', 'cpp-2', 'saturn-2-cpp'], ['saturn-3', 'cpp-3', 'saturn-3-cpp']] },
      { id: 'earth', levels: [['earth-1', 'python-1', 'earth-1-python'], ['earth-2', 'python-2', 'earth-2-python'], ['earth-3', 'python-3', 'earth-3-python']] },
    ];

    let perfectModulesCount = 0;
    let planetsExploredCount = 0;
    let frontendCompletedLevels = 0;
    let backendCompletedLevels = 0;

    planetDefinitions.forEach(planet => {
      const levelCompletion = planet.levels.map(levelVariants => 
        levelVariants.some(v => completedMissionSet.has(v.toLowerCase()))
      );
      const isExplored = levelCompletion.some(Boolean);
      const isPerfect = levelCompletion.every(Boolean);

      if (isExplored) planetsExploredCount++;
      if (isPerfect) perfectModulesCount++;

      const completedInPlanet = levelCompletion.filter(Boolean).length;
      if (['moon', 'mars', 'venus', 'mercury'].includes(planet.id)) {
        frontendCompletedLevels += completedInPlanet;
      } else {
        backendCompletedLevels += completedInPlanet;
      }
    });

    const frontendPct = Math.round((frontendCompletedLevels / 12) * 100);
    const backendPct = Math.round((backendCompletedLevels / 9) * 100);

    const stats = {
      perfectModulesCount,
      planetsExploredCount,
      unlockedBadgesCount: userAchievements.length,
      completedMissionsCount: completedMissions.length,
      frontendProgress: frontendPct,
      backendProgress: backendPct,
      frontendTrackPercent: frontendPct,
      backendTrackPercent: backendPct,
    };

    const userToReturn = user ? { ...user } : null;
    if (userToReturn?.status) {
      try {
        const parsed = JSON.parse(userToReturn.status);
        if (parsed && typeof parsed === 'object') {
          userToReturn.status = parsed.userStatus || '';
        }
      } catch {}
    }

    return NextResponse.json({ 
      user: userToReturn, 
      missionProgress, 
      stats, 
      completedMissionIds: completedMissions.map(m => m.missionId) 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const dbU = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      userId = dbU?.id;
    }

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { name, displayName, status, bio, image, banner, border, showcasedBadges, activeTitle } = data;

    const cleanName = name !== undefined ? (typeof name === 'string' ? name.trim() : name) : undefined;
    const cleanDisplayName = displayName !== undefined ? (typeof displayName === 'string' ? displayName.trim() : displayName) : undefined;
    const cleanBorder = border !== undefined ? (typeof border === 'string' ? border.trim() : border) : undefined;
    const cleanBio = bio !== undefined ? (typeof bio === 'string' ? bio.trim() : bio) : undefined;

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

    // Validate title eligibility
    let cleanActiveTitle = activeTitle !== undefined ? (typeof activeTitle === 'string' ? activeTitle.trim() : null) : undefined;
    if (cleanActiveTitle && cleanActiveTitle !== 'Novice Explorer') {
      const titleDef = getTitleDefinition(cleanActiveTitle);
      if (titleDef.id !== 'title-novice-explorer') {
        const u = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, hasTakenAptitudeTest: true, isVerified: true }
        });
        const userAchs = await prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true }
        });
        const triggerCodes = new Set(userAchs.map(a => a.achievement?.triggerCode?.toUpperCase()).filter(Boolean) as string[]);
        const { getXPDetails } = await import('@/lib/leveling');
        const userLvl = getXPDetails(u?.xp || 0).level;
        const unlocks = evaluateTitleUnlocks({
          level: userLvl,
          xp: u?.xp || 0,
          isVerified: !!u?.isVerified,
          hasTakenAptitudeTest: !!u?.hasTakenAptitudeTest,
          unlockedTriggerCodes: triggerCodes,
        });

        if (!unlocks[titleDef.id]) {
          return NextResponse.json(
            { error: 'You have not unlocked this title yet.' },
            { status: 403 }
          );
        }
      }
    }

    // Validate showcased badges
    let cleanShowcasedBadges: string[] | undefined = undefined;
    if (showcasedBadges !== undefined) {
      if (Array.isArray(showcasedBadges)) {
        const userAchs = await prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true }
        });
        const validCodes = new Set(userAchs.map(a => a.achievement?.triggerCode?.toLowerCase()).filter(Boolean) as string[]);
        const validIds = new Set(userAchs.map(a => a.achievement?.id?.toLowerCase()).filter(Boolean) as string[]);
        
        cleanShowcasedBadges = showcasedBadges
          .slice(0, 6)
          .filter(b => typeof b === 'string')
          .map(b => b.trim())
          .filter(b => validCodes.has(b.toLowerCase()) || validIds.has(b.toLowerCase()));
      }
    }

    let cleanStatus: string | undefined = undefined;
    if (status !== undefined) {
      cleanStatus = typeof status === 'string' ? status.trim() : status;
      try {
        const currentU = await prisma.user.findUnique({
          where: { id: userId },
          select: { status: true },
        });
        if (currentU?.status) {
          const parsed = JSON.parse(currentU.status);
          if (parsed && typeof parsed === 'object') {
            cleanStatus = JSON.stringify({ ...parsed, userStatus: cleanStatus });
          }
        }
      } catch {}
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(cleanName !== undefined && { name: cleanName }),
          ...(cleanDisplayName !== undefined && { displayName: cleanDisplayName }),
          ...(cleanStatus !== undefined && { status: cleanStatus }),
          ...(cleanBio !== undefined && { bio: cleanBio }),
          ...(image !== undefined && { image }),
          ...(banner !== undefined && { banner }),
          ...(cleanBorder !== undefined && { border: cleanBorder }),
          ...(cleanShowcasedBadges !== undefined && { showcasedBadges: cleanShowcasedBadges }),
          ...(cleanActiveTitle !== undefined && { activeTitle: cleanActiveTitle }),
        }
      });
    } catch (updateErr: any) {
      if (updateErr?.message?.includes('border')) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            ...(cleanName !== undefined && { name: cleanName }),
            ...(cleanDisplayName !== undefined && { displayName: cleanDisplayName }),
            ...(cleanStatus !== undefined && { status: cleanStatus }),
            ...(cleanBio !== undefined && { bio: cleanBio }),
            ...(image !== undefined && { image }),
            ...(banner !== undefined && { banner }),
            ...(cleanShowcasedBadges !== undefined && { showcasedBadges: cleanShowcasedBadges }),
            ...(cleanActiveTitle !== undefined && { activeTitle: cleanActiveTitle }),
          }
        });
        if (cleanBorder !== undefined) {
          try {
            await prisma.$executeRaw`UPDATE users SET border = ${cleanBorder} WHERE user_id = ${userId}`;
          } catch (_) {}
        }
      } else {
        throw updateErr;
      }
    }

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

    let finalUser: any = null;
    try {
      finalUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          banner: true,
          border: true,
          status: true,
          bio: true,
          showcasedBadges: true,
          activeTitle: true,
          xp: true,
          gears: true,
        }
      });
    } catch (finalErr: any) {
      if (finalErr?.message?.includes('border')) {
        finalUser = await prisma.user.findUnique({
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
        if (finalUser) {
          try {
            const rawRes: any = await prisma.$queryRaw`SELECT border FROM users WHERE user_id = ${userId} LIMIT 1`;
            if (rawRes && rawRes[0]) finalUser.border = rawRes[0].border;
          } catch (_) {
            finalUser.border = null;
          }
        }
      } else {
        throw finalErr;
      }
    }

    const returnUser = finalUser ? { ...finalUser } : null;
    if (returnUser?.status) {
      try {
        const parsed = JSON.parse(returnUser.status);
        if (parsed && typeof parsed === 'object') {
          returnUser.status = parsed.userStatus || '';
        }
      } catch {}
    }

    return NextResponse.json({ user: returnUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'This display name is already taken. Please choose another.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

