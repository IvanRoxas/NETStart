"use server";

import { prisma } from "@/lib/auth";
import { requireAdmin } from "@/app/admin/actions";

export async function getUserDetails(id: string) {
  await requireAdmin();

  if (!id || typeof id !== 'string') {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userAchievements: {
        include: { achievement: true }
      },
      inventory: {
        include: { shopItem: true }
      },
      missionProgresses: true,
      friendshipsSent: true,
      friendshipsReceived: true,
    }
  });

  if (!user) return null;

  // Filter out sensitive info just in case
  const { password, ...safeUser } = user;
  
  return safeUser;
}
