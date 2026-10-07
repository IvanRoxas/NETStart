"use server";

import { prisma } from "@/lib/auth";
import { Prisma } from "@prisma/client";
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

  // Live verification of active status against DB
  const adminId = (session.user as any).id;
  const admin = await prisma.systemAdmin.findUnique({
    where: { id: adminId },
    select: { isActive: true, role: true }
  });

  if (!admin || admin.isActive === false) {
    throw new Error("Unauthorized. Your account is inactive or has been deactivated.");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if ((session.user as any).role !== "SUPER_ADMIN") {
    throw new Error("Forbidden. Super Admin privileges required.");
  }
  return session;
}

export async function assertCanAccessStudent(adminSession: any, studentId: string) {
  const adminId = (adminSession.user as any).id;
  const role = (adminSession.user as any).role || "SUPER_ADMIN";

  if (role === "SUPER_ADMIN") return true;

  // Teacher check: student must belong to a section assigned to this teacher
  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      section: {
        teacherId: adminId
      }
    },
    select: { id: true }
  });

  if (!student) {
    throw new Error("Forbidden: You can only view or manage students in your assigned sections.");
  }
  return true;
}

export async function getUsers(searchQuery?: string, sectionId?: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  let whereClause: any = {};
  
  if (role === "TEACHER") {
    if (sectionId && sectionId !== "ALL") {
      const ownedSection = await prisma.section.findFirst({
        where: { id: sectionId, teacherId: adminId }
      });
      if (!ownedSection) {
        throw new Error("Forbidden: You can only filter by your assigned sections.");
      }
      whereClause.sectionId = sectionId;
    } else {
      whereClause.section = { teacherId: adminId };
    }
  } else {
    if (sectionId && sectionId !== "ALL") {
      if (sectionId === "UNASSIGNED") {
        whereClause.sectionId = null;
      } else {
        whereClause.sectionId = sectionId;
      }
    }
  }

  if (searchQuery) {
    const searchFilter = {
      OR: [
        { email: { contains: searchQuery, mode: 'insensitive' as const } },
        { displayName: { contains: searchQuery, mode: 'insensitive' as const } }
      ]
    };
    whereClause = { ...whereClause, ...searchFilter };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      isVerified: true,
      isBanned: true,
      hasTakenAptitudeTest: true,
      canUseDemoMode: true,
      xp: true,
      gears: true,
      createdAt: true,
      displayName: true,
      sectionId: true,
      section: {
        select: {
          id: true,
          name: true,
          gradeLevel: true,
          strand: true,
          schoolYear: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return users;
}

export async function toggleUserBan(userId: string, currentStatus: boolean) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
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
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;
  
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true }
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: (session.user as any).role || "ADMIN",
    action: "VERIFIED_USER",
    targetUserId: userId,
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function editGamificationStats(userId: string, actionType: 'ADD' | 'REMOVE' | 'SET', target: 'XP' | 'GEARS' | 'LEVEL', value: number) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;
  
  if (value < 0 || value > 1_000_000 || !Number.isInteger(value)) {
    throw new Error("Value must be a positive integer between 0 and 1,000,000.");
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
      updates.xp = LEVEL_THRESHOLDS[8].cumulativeXp;
    } else {
      updates.xp = LEVEL_THRESHOLDS[value - 2].cumulativeXp;
    }
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updates
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: (session.user as any).role || "ADMIN",
    action: "EDITED_GAMIFICATION",
    targetUserId: userId,
    details: { target, actionType, value }
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteUser(userId: string) {
  // Only Super Admins are allowed to delete accounts
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;
  
  await prisma.user.delete({
    where: { id: userId }
  });
  
  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: "DELETED_USER",
    targetUserId: userId,
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function adminResetAptitudeTest(userId: string) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      hasTakenAptitudeTest: false,
      logicScore: null,
      patternRecognitionScore: null,
      taskDecompositionScore: null,
      recommendedLearningPath: null,
      aptitudeResult: Prisma.DbNull
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: (session.user as any).role || "ADMIN",
    action: "ADMIN_RESET_APTITUDE_TEST",
    targetUserId: userId,
    details: { event: 'Reset student aptitude diagnostic status', targetUserId: userId }
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function adminSetAptitudeStatus(userId: string, targetStatus: boolean) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;

  if (!targetStatus) {
    return adminResetAptitudeTest(userId);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      hasTakenAptitudeTest: true,
      logicScore: 85,
      patternRecognitionScore: 90,
      taskDecompositionScore: 85,
      recommendedLearningPath: "Fullstack Systems (Admin Set)"
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: (session.user as any).role || "ADMIN",
    action: "ADMIN_SET_APTITUDE_STATUS_TRUE",
    targetUserId: userId,
    details: { event: 'Manually set aptitude test completed', targetUserId: userId }
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function assignStudentToSection(userId: string, sectionId: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  // Validate the target section exists
  const section = await prisma.section.findUnique({
    where: { id: sectionId }
  });

  if (!section) {
    throw new Error("Target section not found.");
  }

  // Teachers may only assign students to sections they teach, and cannot take students already assigned to another teacher
  if (role === "TEACHER") {
    if (section.teacherId !== adminId) {
      throw new Error("Forbidden: You can only assign students to your own sections.");
    }
    const currentStudent = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        section: {
          select: { teacherId: true, name: true }
        }
      }
    });
    if (currentStudent?.section?.teacherId && currentStudent.section.teacherId !== adminId) {
      throw new Error(`Forbidden: This student is already enrolled in another teacher's section (${currentStudent.section.name}).`);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { sectionId }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: "ASSIGNED_STUDENT_SECTION",
    targetUserId: userId,
    details: { sectionId, sectionName: section.name }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/sections');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function toggleUserDemoModePrivilege(userId: string, currentStatus: boolean) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { canUseDemoMode: !currentStatus }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: currentStatus ? "REVOKED_DEMO_MODE_PRIVILEGE" : "GRANTED_DEMO_MODE_PRIVILEGE",
    targetUserId: userId,
    details: { canUseDemoMode: !currentStatus }
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, canUseDemoMode: updatedUser.canUseDemoMode };
}

export async function removeStudentFromSection(userId: string) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  await prisma.user.update({
    where: { id: userId },
    data: { sectionId: null }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: "REMOVED_STUDENT_SECTION",
    targetUserId: userId,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/sections');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
