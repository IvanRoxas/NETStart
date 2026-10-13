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

  // Teacher check: student must belong to a section assigned to this teacher OR be unassigned (eligible for enrollment)
  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      OR: [
        { section: { teacherId: adminId } },
        { sectionId: null }
      ]
    },
    select: { id: true, sectionId: true }
  });

  if (!student) {
    throw new Error("Forbidden: You can only view or manage students in your assigned sections or unassigned candidates.");
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
      if (sectionId === "UNASSIGNED") {
        whereClause.sectionId = null;
      } else {
        const ownedSection = await prisma.section.findFirst({
          where: { id: sectionId, teacherId: adminId }
        });
        if (!ownedSection) {
          throw new Error("Forbidden: You can only filter by your assigned sections.");
        }
        whereClause.sectionId = sectionId;
      }
    } else {
      // By default: show teacher's enrolled students AND unassigned students available to enroll
      whereClause.OR = [
        { section: { teacherId: adminId } },
        { sectionId: null }
      ];
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

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    const searchFilter = {
      OR: [
        { email: { contains: q, mode: 'insensitive' as const } },
        { displayName: { contains: q, mode: 'insensitive' as const } },
        { studentId: { contains: q, mode: 'insensitive' as const } }
      ]
    };
    if (whereClause.OR) {
      whereClause = {
        AND: [
          { OR: whereClause.OR },
          searchFilter
        ]
      };
    } else {
      whereClause = { ...whereClause, ...searchFilter };
    }
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      studentId: true,
      isVerified: true,
      isBanned: true,
      hasTakenAptitudeTest: true,
      canUseDemoMode: true,
      logicScore: true,
      patternRecognitionScore: true,
      taskDecompositionScore: true,
      recommendedLearningPath: true,
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
          teacherId: true,
          teacher: {
            select: {
              displayName: true,
              username: true
            }
          }
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
  return toggleUserVerification(userId, true);
}

export async function toggleUserVerification(userId: string, targetStatus?: boolean) {
  const session = await requireAdmin();
  await assertCanAccessStudent(session, userId);
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVerified: true, email: true, displayName: true }
  });

  if (!user) {
    throw new Error("Student not found.");
  }

  const newStatus = typeof targetStatus === "boolean" ? targetStatus : !user.isVerified;

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: newStatus }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: newStatus ? "VERIFIED_USER" : "UNVERIFIED_USER",
    targetUserId: userId,
    details: { isVerified: newStatus, email: user.email }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/sections');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, isVerified: newStatus };
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

  return await prisma.$transaction(async (tx) => {
    // 1. Validate target section
    const targetSection = await tx.section.findUnique({
      where: { id: sectionId },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        }
      }
    });

    if (!targetSection) {
      throw new Error("Target section not found.");
    }

    if (targetSection.isArchived) {
      throw new Error(`Cannot enroll students into an archived section ("${targetSection.name}").`);
    }

    // 2. Validate student state
    const currentStudent = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        isBanned: true,
        sectionId: true,
        section: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            teacher: { select: { username: true, displayName: true } }
          }
        }
      }
    });

    if (!currentStudent) {
      throw new Error("Student account not found.");
    }

    if (currentStudent.isBanned) {
      throw new Error("Cannot enroll a banned student account into a section.");
    }

    // 3. Teacher authorization & Cross-Teacher Conflict Resolution
    if (role === "TEACHER") {
      if (targetSection.teacherId !== adminId) {
        throw new Error("Forbidden: You can only enroll students into your own assigned sections.");
      }

      // Check if student is already enrolled in another teacher's section
      if (currentStudent.sectionId && currentStudent.section?.teacherId && currentStudent.section.teacherId !== adminId) {
        const otherTeacher = currentStudent.section.teacher?.displayName || currentStudent.section.teacher?.username || "another instructor";
        throw new Error(`Enrollment Conflict: ${currentStudent.displayName || currentStudent.email} is already enrolled in section "${currentStudent.section.name}" managed by ${otherTeacher}. Please contact the instructor or an administrator to reassign this student.`);
      }

      // If student is already in this section, no-op
      if (currentStudent.sectionId === sectionId) {
        return { success: true, message: "Student is already enrolled in this section." };
      }
    }

    // 4. Atomic assignment
    const previousSectionId = currentStudent.sectionId;
    const previousSectionName = currentStudent.section?.name || null;
    const previousTeacherId = currentStudent.section?.teacherId || null;

    await tx.user.update({
      where: { id: userId },
      data: { sectionId }
    });

    await logSystemAction({
      actorId: adminId,
      actorRole: role,
      action: "ASSIGNED_STUDENT_SECTION",
      targetUserId: userId,
      details: { 
        sectionId, 
        sectionName: targetSection.name,
        previousSectionId,
        previousSectionName,
        previousTeacherId
      }
    });

    return { success: true };
  }).then(async (res) => {
    revalidatePath('/admin');
    revalidatePath('/admin/sections');
    revalidatePath(`/admin/users/${userId}`);
    return res;
  });
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
  revalidatePath('/admin/sections');
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
    data: { 
      sectionId: null,
      canUseDemoMode: false // Automatically revoke demonstration mode upon unenrollment
    }
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
