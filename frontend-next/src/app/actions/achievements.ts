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

export async function getUnlockedAchievements() {
  try {
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
