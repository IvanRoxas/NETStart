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

    // Validate eligibility to prevent arbitrary achievement and currency forging
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, hasTakenAptitudeTest: true }
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    if (triggerCode === 'B_VERIFY_ACCOUNT' && !dbUser.isVerified) {
      return { success: false, error: "Requirement not met: User is not verified" };
    }

    if (triggerCode === 'B_APTITUDE_TEST' && !dbUser.hasTakenAptitudeTest) {
      return { success: false, error: "Requirement not met: Aptitude test not completed" };
    }

    const RESTRICTED_TRIGGERS = new Set([
      'B_COMPLETE_MOON',
      'B_COMPLETE_MARS',
      'B_COMPLETE_VENUS',
      'B_COMPLETE_MERCURY',
      'B_COMPLETE_JUPITER',
      'B_COMPLETE_SATURN',
      'B_COMPLETE_EARTH',
      'B_COMPLETE_ALL_PLANETS',
      'B_FIRST_MISSION',
    ]);

    if (RESTRICTED_TRIGGERS.has(triggerCode)) {
      return { success: false, error: "This achievement can only be unlocked through curriculum progression" };
    }

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

    if (achievement.xpReward > 0) {
      const { addXPAndCheckLevelUp } = await import('@/lib/xp');
      await addXPAndCheckLevelUp(userId, achievement.xpReward);
    }

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
      { triggerCode: 'B_CREATE_ACCOUNT', name: 'Ready for Blast Off!', iconUrl: '/assets/global/badges/milestones/CreateAccount.svg', description: 'Create your NETStart account to begin your journey.', xpReward: 0 },
      { triggerCode: 'B_VERIFY_ACCOUNT', name: 'Verified Explorer', iconUrl: '/assets/global/badges/milestones/AccountVerified.svg', description: 'Verify your email address to confirm your account.', xpReward: 0 },
      { triggerCode: 'B_CHANGE_PFP', name: 'A New Look', iconUrl: '/assets/global/badges/milestones/ChangeProfileIcon.svg', description: 'Change your profile picture to customize your astronaut.', xpReward: 0 },
      { triggerCode: 'B_APTITUDE_TEST', name: 'Aptitude Tested', iconUrl: '/assets/global/badges/milestones/Aptitude Test.svg', description: 'Complete the aptitude test to discover your skills.', xpReward: 0 },
      { triggerCode: 'B_FIRST_MISSION', name: 'First Mission', iconUrl: '/assets/global/badges/milestones/FirstMission.svg', description: 'Complete your very first coding mission.', xpReward: 0 },
      { triggerCode: 'B_BUY_REWARD', name: 'First Purchase', iconUrl: '/assets/global/badges/milestones/FirstPurchase.svg', description: 'Buy your first item from the rewards shop.', xpReward: 0 },
      { triggerCode: 'B_CHANGE_BG', name: 'Interior Designer', iconUrl: '/assets/global/badges/milestones/ChangeBackground.svg', description: 'Customize your profile with a new background.', xpReward: 0 },
      { triggerCode: 'B_REACH_LVL5', name: 'Level 5 Reached', iconUrl: '/assets/global/badges/milestones/Level 5.svg', description: 'Earn enough experience to reach Level 5.', xpReward: 0 },
      { triggerCode: 'B_REACH_LVL10', name: 'Level 10 Reached', iconUrl: '/assets/global/badges/milestones/Level 10.svg', description: 'Earn enough experience to reach Level 10.', xpReward: 0 },
      // Planetary Expeditions
      { triggerCode: 'B_COMPLETE_MOON', name: 'Moon Pioneer', iconUrl: '/assets/global/badges/planets/CompleteMoon.svg', description: 'Complete all missions on The Moon.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_MERCURY', name: 'Mercury Logician', iconUrl: '/assets/global/badges/planets/CompleteMercury.svg', description: 'Complete all missions on Mercury.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_VENUS', name: 'Venus Navigator', iconUrl: '/assets/global/badges/planets/CompleteVenus.svg', description: 'Complete all missions on Venus.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_MARS', name: 'Mars Conqueror', iconUrl: '/assets/global/badges/planets/CompleteMars.svg', description: 'Complete all missions on Mars.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_JUPITER', name: 'Jupiter Architect', iconUrl: '/assets/global/badges/planets/CompleteJupiter.svg', description: 'Complete all missions on Jupiter.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_SATURN', name: 'Saturn Engineer', iconUrl: '/assets/global/badges/planets/CompleteSaturn.svg', description: 'Complete all missions on Saturn.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_EARTH', name: 'Earth Master', iconUrl: '/assets/global/badges/planets/CompleteEarth.svg', description: 'Complete all missions on Earth.', xpReward: 0 },
      { triggerCode: 'B_COMPLETE_ALL_PLANETS', name: 'Grand Celestial Master', iconUrl: '/assets/global/badges/planets/CompleteAllPlanets.svg', description: 'Complete all planets in the solar system constellation.', xpReward: 0 }
    ];

    // Clean up B_FIRST_PLANET if previously seeded
    await prisma.achievement.deleteMany({
      where: { triggerCode: 'B_FIRST_PLANET' }
    });

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
      } else {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: {
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl,
            xpReward: 0
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
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const u = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
      userId = u?.id;
    }
    if (!session?.user || !userId) {
      return { success: false, unlockedCodes: [] };
    }

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

        if (createAch.xpReward > 0) {
          const { addXPAndCheckLevelUp } = await import('@/lib/xp');
          await addXPAndCheckLevelUp(userId, createAch.xpReward);
        }

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

    // Retroactively check and award planetary achievements if all 3 missions completed
    const planetRequirements = [
      { triggerCode: 'B_COMPLETE_MOON', prefixes: ['moon'] },
      { triggerCode: 'B_COMPLETE_MARS', prefixes: ['mars', 'html'] },
      { triggerCode: 'B_COMPLETE_VENUS', prefixes: ['venus', 'css'] },
      { triggerCode: 'B_COMPLETE_MERCURY', prefixes: ['mercury', 'javascript', 'js'] },
      { triggerCode: 'B_COMPLETE_JUPITER', prefixes: ['jupiter', 'java'] },
      { triggerCode: 'B_COMPLETE_SATURN', prefixes: ['saturn', 'cpp'] },
      { triggerCode: 'B_COMPLETE_EARTH', prefixes: ['earth', 'python'] },
    ];

    const completedMissions = await prisma.missionProgress.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { missionId: true }
    });

    let completedPlanetsCount = 0;
    for (const pr of planetRequirements) {
      const count = completedMissions.filter(m =>
        pr.prefixes.some(pfx => m.missionId.toLowerCase().startsWith(pfx))
      ).length;

      if (count >= 3) {
        completedPlanetsCount++;
        const ach = await prisma.achievement.findUnique({ where: { triggerCode: pr.triggerCode } });
        if (ach) {
          const hasAch = await prisma.userAchievement.findUnique({
            where: { userId_achievementId: { userId, achievementId: ach.id } }
          });
          if (!hasAch) {
            await prisma.userAchievement.create({
              data: { userId, achievementId: ach.id }
            });
            await prisma.notification.create({
              data: {
                userId,
                notificationType: 'achievement_unlocked',
                data: {
                  badgeId: ach.id,
                  badgeName: ach.name,
                  badgeImage: ach.iconUrl,
                  description: ach.description
                }
              }
            });
          }
        }
      }
    }

    if (completedPlanetsCount === 7) {
      const allAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_COMPLETE_ALL_PLANETS' } });
      if (allAch) {
        const hasAllAch = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: allAch.id } }
        });
        if (!hasAllAch) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: allAch.id }
          });
          await prisma.notification.create({
            data: {
              userId,
              notificationType: 'achievement_unlocked',
              data: {
                badgeId: allAch.id,
                badgeName: allAch.name,
                badgeImage: allAch.iconUrl,
                description: allAch.description
              }
            }
          });
        }
      }
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    });

    const unlockedCodes = userAchievements
      .map(ua => ua.achievement?.triggerCode)
      .filter(Boolean) as string[];
    const userAchievementsDetails = userAchievements
      .filter(ua => Boolean(ua.achievement))
      .map(ua => ({
        triggerCode: ua.achievement?.triggerCode || '',
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
