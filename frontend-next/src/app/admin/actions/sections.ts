"use server";

import { prisma } from "@/lib/auth";
import { requireAdmin } from "@/app/admin/actions";
import { logSystemAction } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function getSections() {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  let whereClause: any = {};
  if (role === "TEACHER") {
    whereClause.teacherId = adminId;
  }

  const sections = await prisma.section.findMany({
    where: whereClause,
    include: {
      teacher: {
        select: {
          id: true,
          username: true,
          displayName: true
        }
      },
      _count: {
        select: { students: true }
      }
    },
    orderBy: [
      { isArchived: "asc" },
      { gradeLevel: "asc" },
      { name: "asc" }
    ]
  });

  return sections;
}

export async function getAvailableTeachers() {
  const session = await requireAdmin();
  const role = (session.user as any).role || "SUPER_ADMIN";

  if (role !== "SUPER_ADMIN") {
    return [];
  }

  const teachers = await prisma.systemAdmin.findMany({
    where: { isActive: true },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true
    },
    orderBy: { username: "asc" }
  });

  return teachers;
}

export async function createSection(data: {
  name: string;
  gradeLevel: number;
  strand: string;
  schoolYear: string;
  teacherId?: string;
}) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  const name = data.name.trim();
  const gradeLevel = Number(data.gradeLevel);
  const strand = data.strand.trim().toUpperCase();
  const schoolYear = data.schoolYear.trim();

  if (!name || name.length < 2) {
    throw new Error("Section name must be at least 2 characters.");
  }
  if (gradeLevel !== 11 && gradeLevel !== 12) {
    throw new Error("Grade level must be 11 or 12.");
  }
  if (!strand) {
    throw new Error("Strand is required (e.g. STEM, ICT, ABM, HUMSS, TVL).");
  }
  if (!schoolYear) {
    throw new Error("School year is required (e.g. 2026-2027).");
  }

  // Determine assigned teacher
  let assignedTeacherId = adminId;
  if (role === "SUPER_ADMIN" && data.teacherId) {
    assignedTeacherId = data.teacherId;
  }

  const section = await prisma.section.create({
    data: {
      name,
      gradeLevel,
      strand,
      schoolYear,
      teacherId: assignedTeacherId,
      isArchived: false
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: "CREATED_SECTION",
    details: { sectionId: section.id, name, gradeLevel, strand, schoolYear, teacherId: assignedTeacherId }
  });

  revalidatePath("/admin/sections");
  return { success: true, section };
}

export async function archiveSection(sectionId: string, currentStatus: boolean) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  const existing = await prisma.section.findUnique({
    where: { id: sectionId }
  });

  if (!existing) {
    throw new Error("Section not found.");
  }

  if (role === "TEACHER" && existing.teacherId !== adminId) {
    throw new Error("Forbidden: You can only archive your own sections.");
  }

  await prisma.section.update({
    where: { id: sectionId },
    data: { isArchived: !currentStatus }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: currentStatus ? "UNARCHIVED_SECTION" : "ARCHIVED_SECTION",
    details: { sectionId, name: existing.name }
  });

  revalidatePath("/admin/sections");
  return { success: true };
}

export async function updateSection(sectionId: string, data: {
  name: string;
  gradeLevel?: number;
  strand?: string;
  schoolYear?: string;
  teacherId?: string;
}) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  const existing = await prisma.section.findUnique({
    where: { id: sectionId }
  });

  if (!existing) {
    throw new Error("Section not found.");
  }

  if (role === "TEACHER" && existing.teacherId !== adminId) {
    throw new Error("Forbidden: You can only edit your own sections.");
  }

  const name = data.name.trim();
  if (!name || name.length < 2) {
    throw new Error("Section name must be at least 2 characters.");
  }

  const updateData: any = { name };
  if (data.gradeLevel !== undefined) {
    const gl = Number(data.gradeLevel);
    if (gl !== 11 && gl !== 12) throw new Error("Grade level must be 11 or 12.");
    updateData.gradeLevel = gl;
  }
  if (data.strand) {
    updateData.strand = data.strand.trim().toUpperCase();
  }
  if (data.schoolYear) {
    updateData.schoolYear = data.schoolYear.trim();
  }
  if (role === "SUPER_ADMIN" && data.teacherId) {
    updateData.teacherId = data.teacherId;
  }

  const updatedSection = await prisma.section.update({
    where: { id: sectionId },
    data: updateData,
    include: {
      teacher: {
        select: {
          id: true,
          username: true,
          displayName: true
        }
      },
      _count: {
        select: { students: true }
      }
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: role,
    action: "UPDATED_SECTION",
    details: { sectionId, oldName: existing.name, newName: name }
  });

  revalidatePath("/admin/sections");
  return { success: true, section: updatedSection };
}

export async function getSectionRoster(sectionId: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;
  const role = (session.user as any).role || "SUPER_ADMIN";

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      students: {
        select: {
          id: true,
          email: true,
          displayName: true,
          xp: true,
          gears: true,
          isVerified: true,
          isBanned: true,
          hasTakenAptitudeTest: true,
          canUseDemoMode: true,
        },
        orderBy: { displayName: "asc" }
      }
    }
  });

  if (!section) {
    throw new Error("Section not found.");
  }

  if (role === "TEACHER" && section.teacherId !== adminId) {
    throw new Error("Forbidden: You can only view rosters for your own sections.");
  }

  return section;
}
