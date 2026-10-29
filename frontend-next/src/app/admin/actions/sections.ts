"use server";

import { prisma } from "@/lib/auth";
import { requireAdmin } from "@/app/admin/actions";
import { logSystemAction } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { assertExpectedActionUser } from "@/lib/sessionGuard";

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
  expectedAdminId?: string;
}) {
  try {
    const session = await requireAdmin();
    const adminId = (session.user as any).id;
    const mismatch = assertExpectedActionUser(adminId, data.expectedAdminId, "createSection");
    if (mismatch) return mismatch;

    const role = (session.user as any).role || "SUPER_ADMIN";

    const name = data.name ? data.name.trim() : "";
    const gradeLevel = Number(data.gradeLevel);
    const strand = data.strand ? data.strand.trim().toUpperCase() : "";
    const schoolYear = data.schoolYear ? data.schoolYear.trim() : "";

    if (!name || name.length < 2) {
      return { success: false, error: "Section name must be at least 2 characters." };
    }
    if (gradeLevel !== 11 && gradeLevel !== 12) {
      return { success: false, error: "Grade level must be 11 or 12." };
    }
    if (!strand) {
      return { success: false, error: "Strand is required (e.g. STEM, ICT, ABM, HUMSS, TVL)." };
    }
    if (!schoolYear) {
      return { success: false, error: "School year is required (e.g. 2026-2027)." };
    }
    const schoolYearRegex = /^\d{4}-\d{4}$/;
    if (!schoolYearRegex.test(schoolYear)) {
      return { success: false, error: "School year must be in format YYYY-YYYY (e.g. 2026-2027)." };
    }

    // Duplicate active section check (case-insensitive name check within grade, strand, and school year)
    const duplicate = await prisma.section.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        gradeLevel,
        strand,
        schoolYear,
        isArchived: false
      }
    });

    if (duplicate) {
      return {
        success: false,
        error: `A section named "${name}" already exists for Grade ${gradeLevel} ${strand} in SY ${schoolYear}.`
      };
    }

    // Also check if an active section with this exact name exists in the same school year
    const nameDuplicateInYear = await prisma.section.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        schoolYear,
        isArchived: false
      }
    });
    if (nameDuplicateInYear) {
      return {
        success: false,
        error: `A section named "${name}" already exists in SY ${schoolYear} (Grade ${nameDuplicateInYear.gradeLevel} ${nameDuplicateInYear.strand}).`
      };
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "A section with this name already exists." };
    }
    console.error("[createSection Error]", error);
    return {
      success: false,
      error: error?.message || "Failed to create section. Please try again."
    };
  }
}

export async function archiveSection(sectionId: string, currentStatus: boolean, expectedAdminId?: string) {
  try {
    const session = await requireAdmin();
    const adminId = (session.user as any).id;
    const mismatch = assertExpectedActionUser(adminId, expectedAdminId, "archiveSection");
    if (mismatch) return mismatch;

    const role = (session.user as any).role || "SUPER_ADMIN";

    const existing = await prisma.section.findUnique({
      where: { id: sectionId }
    });

    if (!existing) {
      return { success: false, error: "Section not found." };
    }

    if (role === "TEACHER" && existing.teacherId !== adminId) {
      return { success: false, error: "Forbidden: You can only archive your own sections." };
    }

    // If restoring an archived section, verify it does not conflict with an active section
    if (currentStatus) {
      const activeDuplicate = await prisma.section.findFirst({
        where: {
          id: { not: sectionId },
          name: { equals: existing.name, mode: "insensitive" },
          schoolYear: existing.schoolYear,
          isArchived: false
        }
      });
      if (activeDuplicate) {
        return {
          success: false,
          error: `Cannot restore: An active section named "${existing.name}" already exists in SY ${existing.schoolYear}.`
        };
      }
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
  } catch (error: any) {
    console.error("[archiveSection Error]", error);
    return {
      success: false,
      error: error?.message || "Failed to update archive status."
    };
  }
}

export async function updateSection(sectionId: string, data: {
  name: string;
  gradeLevel?: number;
  strand?: string;
  schoolYear?: string;
  teacherId?: string;
  expectedAdminId?: string;
}) {
  try {
    const session = await requireAdmin();
    const adminId = (session.user as any).id;
    const mismatch = assertExpectedActionUser(adminId, data.expectedAdminId, "updateSection");
    if (mismatch) return mismatch;

    const role = (session.user as any).role || "SUPER_ADMIN";

    const existing = await prisma.section.findUnique({
      where: { id: sectionId }
    });

    if (!existing) {
      return { success: false, error: "Section not found." };
    }

    if (role === "TEACHER" && existing.teacherId !== adminId) {
      return { success: false, error: "Forbidden: You can only edit your own sections." };
    }

    const name = data.name ? data.name.trim() : "";
    if (!name || name.length < 2) {
      return { success: false, error: "Section name must be at least 2 characters." };
    }

    const gl = data.gradeLevel !== undefined ? Number(data.gradeLevel) : existing.gradeLevel;
    if (gl !== 11 && gl !== 12) {
      return { success: false, error: "Grade level must be 11 or 12." };
    }

    const strand = data.strand ? data.strand.trim().toUpperCase() : existing.strand;
    const schoolYear = data.schoolYear ? data.schoolYear.trim() : existing.schoolYear;

    // Check duplicate against other active sections in the same school year
    const duplicate = await prisma.section.findFirst({
      where: {
        id: { not: sectionId },
        name: { equals: name, mode: "insensitive" },
        schoolYear,
        isArchived: false
      }
    });

    if (duplicate) {
      return {
        success: false,
        error: `A section named "${name}" already exists in SY ${schoolYear} (Grade ${duplicate.gradeLevel} ${duplicate.strand}).`
      };
    }

    const updateData: any = { name, gradeLevel: gl, strand, schoolYear };
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "A section with this name already exists." };
    }
    console.error("[updateSection Error]", error);
    return {
      success: false,
      error: error?.message || "Failed to update section. Please try again."
    };
  }
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
          studentId: true,
          displayName: true,
          xp: true,
          gears: true,
          isVerified: true,
          isBanned: true,
          hasTakenAptitudeTest: true,
          canUseDemoMode: true,
          logicScore: true,
          patternRecognitionScore: true,
          taskDecompositionScore: true,
          recommendedLearningPath: true,
          missionProgresses: {
            select: {
              missionId: true,
              status: true,
              failureCount: true,
              completedAt: true,
            }
          }
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

export async function getUnassignedStudents(searchQuery?: string) {
  const session = await requireAdmin();

  const where: any = {
    sectionId: null,
    isBanned: false
  };

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    where.OR = [
      { email: { contains: q, mode: 'insensitive' as const } },
      { displayName: { contains: q, mode: 'insensitive' as const } },
      { studentId: { contains: q, mode: 'insensitive' as const } }
    ];
  }

  const unassigned = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      studentId: true,
      displayName: true,
      xp: true,
      gears: true,
      isVerified: true,
      hasTakenAptitudeTest: true,
      recommendedLearningPath: true,
      logicScore: true,
      patternRecognitionScore: true,
      taskDecompositionScore: true,
    },
    take: 50,
    orderBy: { displayName: "asc" }
  });

  return unassigned;
}
