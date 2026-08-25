"use server";

import { prisma } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { LEVEL_THRESHOLDS } from "@/lib/leveling";

import { logSystemAction } from "@/lib/logger";

export async function requireAdmin() {
  const session = await getServerSession(adminAuthOptions);
  
  if (!session?.user || (session.user as any).type !== "admin") {
    throw new Error("Unauthorized. Admin access required.");
  }
  return session;
}

export async function getUsers(searchQuery?: string) {
  await requireAdmin();

  let whereClause: any = {};
  if (searchQuery) {
    whereClause = {
      OR: [
        { email: { contains: searchQuery, mode: 'insensitive' } }
      ]
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      isVerified: true,
      isBanned: true,
      xp: true,
      gears: true,
      createdAt: true,
      displayName: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return users;
}

export async function toggleUserBan(userId: string, currentStatus: boolean) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !currentStatus }
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: currentStatus ? "UNBANNED_USER" : "BANNED_USER",
    targetUserId: userId,
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function forceVerifyUser(userId: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true }
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "VERIFIED_USER",
    targetUserId: userId,
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function editGamificationStats(userId: string, actionType: 'ADD' | 'REMOVE' | 'SET', target: 'XP' | 'GEARS' | 'LEVEL', value: number) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  
  if (value < 0 || !Number.isInteger(value)) {
    throw new Error("Value must be a positive integer.");
  }
  
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true, gears: true } });
  if (!user) throw new Error("User not found");

  const updates: any = {};
  
  if (target === 'GEARS') {
    if (actionType === 'ADD') updates.gears = user.gears + value;
    else if (actionType === 'REMOVE') updates.gears = Math.max(0, user.gears - value);
    else if (actionType === 'SET') updates.gears = value;
  } else if (target === 'XP') {
    if (actionType === 'ADD') updates.xp = user.xp + value;
    else if (actionType === 'REMOVE') updates.xp = Math.max(0, user.xp - value);
    else if (actionType === 'SET') updates.xp = value;
  } else if (target === 'LEVEL') {
    if (value <= 1) {
      updates.xp = 0;
    } else if (value >= 10) {
      updates.xp = LEVEL_THRESHOLDS[8].nextLevelAt;
    } else {
      updates.xp = LEVEL_THRESHOLDS[value - 2].nextLevelAt;
    }
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updates
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "EDITED_GAMIFICATION",
    targetUserId: userId,
    details: { target, actionType, value }
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  
  await prisma.user.delete({
    where: { id: userId }
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "DELETED_USER",
    targetUserId: userId,
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function adminResetAptitudeTest(userId: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        hasTakenAptitudeTest: false,
        logicScore: null,
        patternRecognitionScore: null,
        recommendedLearningPath: null,
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: "ADMIN",
        action: "ADMIN_RESET_APTITUDE_TEST",
        targetUserId: userId,
        details: `Reset aptitude test status and diagnostic scores for user ID: ${userId}`
      }
    });
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function adminSetAptitudeStatus(userId: string, targetStatus: boolean) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  if (!targetStatus) {
    return adminResetAptitudeTest(userId);
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        hasTakenAptitudeTest: true,
        logicScore: 85,
        patternRecognitionScore: 90,
        recommendedLearningPath: "Fullstack Systems (Admin Set)"
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: "ADMIN",
        action: "ADMIN_SET_APTITUDE_STATUS_TRUE",
        targetUserId: userId,
        details: `Manually set aptitude test completed for user ID: ${userId}`
      }
    });
  });

  revalidatePath('/admin');
  return { success: true };
}
