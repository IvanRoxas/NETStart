import { prisma } from "@/lib/auth";
import { calculateLevel } from "@/lib/leveling";

export async function addXPAndCheckLevelUp(userId: string, xpToAdd: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true }
  });
  
  if (!user) return null;
  
  const oldLevel = calculateLevel(user.xp);
  const newLevel = calculateLevel(user.xp + xpToAdd);
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpToAdd } }
  });
  
  if (newLevel > oldLevel) {
    await prisma.notification.create({
      data: {
        userId,
        notificationType: 'level_up',
        data: {
          badgeName: `Level ${newLevel} Reached!`,
          badgeIcon: '🌟',
          isLevelUp: true
        }
      }
    });
  }
  
  return updatedUser;
}
