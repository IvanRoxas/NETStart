"use server";

import { prisma } from "@/lib/auth";
import { requireAdmin, assertCanAccessStudent } from "@/app/admin/actions";

export async function getUserDetails(id: string) {
  const session = await requireAdmin();

  if (!id || typeof id !== 'string') {
    return null;
  }

  await assertCanAccessStudent(session, id);

  let user: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      user = await prisma.user.findUnique({
    where: { id },
    include: {
      section: {
        select: {
          id: true,
          name: true,
          gradeLevel: true,
          strand: true,
          schoolYear: true,
        }
      },
      userAchievements: {
        include: { achievement: true }
      },
      inventory: {
        include: { shopItem: true }
      },
      missionProgresses: {
        orderBy: { startedAt: 'desc' }
      },
      interventionLogs: {
        orderBy: { timestamp: 'desc' },
        take: 20
      },
      friendshipsSent: true,
      friendshipsReceived: true,
    }
  });

      break;
    } catch (err: any) {
      if (attempt === 2) throw err;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  if (!user) return null;

  // Filter out sensitive info just in case
  const { password, ...safeUser } = user;
  
  return safeUser;
}
