import { prisma } from "@/lib/auth";

export async function getUserAchievementsData(userId: string) {
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { triggerCode: 'asc' } // or whatever order
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId }
  });

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  return allAchievements.map(ach => ({
    ...ach,
    isUnlocked: unlockedIds.has(ach.id)
  }));
}
