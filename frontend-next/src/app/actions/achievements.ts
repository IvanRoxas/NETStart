"use server";

import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { logSystemAction } from "@/lib/logger";

export async function unlockAchievement(triggerCode: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    const achievement = await prisma.achievement.findUnique({
      where: { triggerCode }
    });

    if (!achievement) {
      return { success: false, error: "Achievement not found" };
    }

    const existingRecord = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id
        }
      }
    });

    if (existingRecord) {
      // Already unlocked
      return { success: true, message: "Already unlocked" };
    }

    const isImage = achievement.iconUrl && (
      achievement.iconUrl.startsWith('/') ||
      achievement.iconUrl.startsWith('data:') ||
      achievement.iconUrl.startsWith('http')
    );

    await prisma.$transaction([
      prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id
        }
      }),
      prisma.notification.create({
        data: {
          userId,
          notificationType: 'achievement_unlocked',
          data: {
            badgeId: achievement.id,
            badgeName: achievement.name,
            badgeIcon: isImage ? undefined : achievement.iconUrl,
            badgeImage: isImage ? achievement.iconUrl : undefined,
            description: achievement.description
          }
        }
      })
    ]);

    const { addXPAndCheckLevelUp } = await import('@/lib/xp');
    await addXPAndCheckLevelUp(userId, achievement.xpReward);

    if (achievement.gearsReward > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { gears: { increment: achievement.gearsReward } }
      });
    }

    await logSystemAction({
      actorId: userId,
      actorRole: "STUDENT",
      action: "GRANTED_ACHIEVEMENT",
      details: { achievementId: achievement.id, name: achievement.name }
    });

    // Check if we can automatically showcase this badge
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { showcasedBadges: true }
    });

    if (user && user.showcasedBadges.length < 6 && !user.showcasedBadges.includes(achievement.triggerCode.toLowerCase())) {
      await prisma.user.update({
        where: { id: userId },
        data: { showcasedBadges: { push: achievement.triggerCode.toLowerCase() } }
      });
    }

    return { success: true, message: "Achievement unlocked" };
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function ensureDefaultAchievements() {
  try {
    const defaultBadges = [
      { triggerCode: 'B_CREATE_ACCOUNT', name: 'Ready for Blast Off!', iconUrl: '/assets/global/badges/milestones/CreateAccount.svg', description: 'Create an account', xpReward: 100 },
      { triggerCode: 'B_VERIFY_ACCOUNT', name: 'Verified Explorer', iconUrl: '/assets/global/badges/milestones/AccountVerified.svg', description: 'Verify your account', xpReward: 100 },
      { triggerCode: 'B_CHANGE_PFP', name: 'A New Look', iconUrl: '/assets/global/badges/milestones/ChangeProfileIcon.svg', description: 'Change your profile picture', xpReward: 100 },
      { triggerCode: 'B_APTITUDE_TEST', name: 'Aptitude Tested', iconUrl: '/assets/global/badges/milestones/Aptitude Test.svg', description: 'Take the aptitude test', xpReward: 100 },
      { triggerCode: 'B_FIRST_MISSION', name: 'First Mission', iconUrl: '/assets/global/badges/milestones/FirstMission.svg', description: 'Complete your first mission', xpReward: 100 },
      { triggerCode: 'B_FIRST_PLANET', name: 'First Planet', iconUrl: '◆', description: 'Complete your first planet', xpReward: 100 },
      { triggerCode: 'B_BUY_REWARD', name: 'Shopaholic', iconUrl: '/assets/global/badges/milestones/FirstPurchase.svg', description: 'Buy something from the rewards shop', xpReward: 100 },
      { triggerCode: 'B_CHANGE_BG', name: 'Interior Designer', iconUrl: '/assets/global/badges/milestones/ChangeBackground.svg', description: 'Change your profile background', xpReward: 100 },
      { triggerCode: 'B_REACH_LVL5', name: 'Level 5 Reached', iconUrl: '/assets/global/badges/milestones/Level 5.svg', description: 'Reach Level 5', xpReward: 100 },
      { triggerCode: 'B_REACH_LVL10', name: 'Level 10 Reached', iconUrl: '/assets/global/badges/milestones/Level 10.svg', description: 'Reach Level 10', xpReward: 100 }
    ];

    for (const badge of defaultBadges) {
      const existing = await prisma.achievement.findUnique({
        where: { triggerCode: badge.triggerCode }
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl,
            xpReward: badge.xpReward,
            gearsReward: 0,
            triggerCode: badge.triggerCode
          }
        });
      }
    }
  } catch (error) {
    console.error("Error seeding default achievements:", error);
  }
}

export async function getUnlockedAchievements() {
  try {
    await ensureDefaultAchievements();
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return { success: false, unlockedCodes: [] };
    }
    const userId = (session.user as any).id;

    // Auto-sync B_CREATE_ACCOUNT
    const createAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_CREATE_ACCOUNT' } });
    if (createAch) {
      const hasCreateAch = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: createAch.id } }
      });
      if (!hasCreateAch) {
        await prisma.userAchievement.create({
          data: { userId: userId, achievementId: createAch.id }
        });

        const { addXPAndCheckLevelUp } = await import('@/lib/xp');
        await addXPAndCheckLevelUp(userId, createAch.xpReward);

        // Also create a notification so the popup shows
        await prisma.notification.create({
          data: {
            userId: userId,
            notificationType: 'achievement_unlocked',
            data: {
              badgeId: createAch.id,
              badgeName: createAch.name,
              badgeImage: createAch.iconUrl
            }
          }
        });
      }
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    });

    const unlockedCodes = userAchievements.map(ua => ua.achievement.triggerCode);
    const userAchievementsDetails = userAchievements.map(ua => ({
      triggerCode: ua.achievement.triggerCode,
      achievementId: ua.achievementId,
      unlockedAt: ua.unlockedAt
    }));
    const allDbAchievements = await prisma.achievement.findMany();

    return { success: true, unlockedCodes, userAchievementsDetails, allDbAchievements };
  } catch (error) {
    console.error("Error fetching unlocked achievements:", error);
    return { success: false, unlockedCodes: [], userAchievementsDetails: [], allDbAchievements: [] };
  }
}
