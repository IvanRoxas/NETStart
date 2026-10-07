"use server";

import { prisma } from "@/lib/auth";
import { requireSuperAdmin } from "@/app/admin/actions";
import { logSystemAction } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getTeachers() {
  await requireSuperAdmin();

  const teachers = await prisma.systemAdmin.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { sections: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return teachers;
}

export async function createTeacher(data: {
  username: string;
  displayName: string;
  password: string;
}) {
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;

  const username = data.username.trim();
  const displayName = data.displayName.trim();
  const password = data.password;

  if (!username || username.length < 3 || username.length > 30) {
    throw new Error("Username must be between 3 and 30 characters.");
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    throw new Error("Username may only contain letters, numbers, hyphens, and underscores.");
  }
  if (!displayName || displayName.length < 2) {
    throw new Error("Display Name must be at least 2 characters.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  // Check uniqueness
  const existing = await prisma.systemAdmin.findUnique({
    where: { username }
  });
  if (existing) {
    throw new Error("An admin or teacher with this username already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const teacher = await prisma.systemAdmin.create({
    data: {
      username,
      displayName,
      password: hashedPassword,
      role: "TEACHER",
      isActive: true
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: "CREATED_TEACHER_ACCOUNT",
    targetUserId: teacher.id,
    details: { username, displayName }
  });

  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function toggleTeacherStatus(teacherId: string, currentStatus: boolean) {
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;

  if (teacherId === adminId) {
    throw new Error("You cannot deactivate your own account.");
  }

  await prisma.systemAdmin.update({
    where: { id: teacherId },
    data: { isActive: !currentStatus }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: currentStatus ? "DEACTIVATED_TEACHER" : "ACTIVATED_TEACHER",
    targetUserId: teacherId
  });

  revalidatePath("/admin/teachers");
  return { success: true };
}

export async function resetTeacherPassword(teacherId: string, newPassword: string) {
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;

  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.systemAdmin.update({
    where: { id: teacherId },
    data: {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: "RESET_TEACHER_PASSWORD",
    targetUserId: teacherId
  });

  revalidatePath("/admin/teachers");
  return { success: true };
}
