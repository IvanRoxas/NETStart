"use server";

import { prisma } from "@/lib/auth";
import { requireAdmin } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";
import { logSystemAction } from "@/lib/logger";
import { ensureDefaultAchievements } from "@/app/actions/achievements";

export async function getAchievements(searchQuery?: string) {
  await requireAdmin();
  await ensureDefaultAchievements();

  let whereClause: any = {};
  if (searchQuery) {
    whereClause = {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { triggerCode: { contains: searchQuery, mode: 'insensitive' } }
      ]
    };
  }

  const items = await prisma.achievement.findMany({
    where: whereClause,
    orderBy: { name: 'asc' }
  });

  return items;
}

export async function createAchievement(data: {
  name: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  gearsReward?: number;
  triggerCode?: string;
}) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  // Auto-generate a unique trigger code if none is provided
  const triggerCode = data.triggerCode || data.name.toUpperCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const achievement = await prisma.achievement.create({
    data: {
      name: data.name,
      description: data.description,
      iconUrl: data.iconUrl,
      xpReward: data.xpReward,
      gearsReward: data.gearsReward || 0,
      triggerCode: triggerCode
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "CREATED_ACHIEVEMENT",
    details: { id: achievement.id, name: achievement.name }
  });

  revalidatePath('/admin/achievements');
  revalidatePath('/achievements');
  revalidatePath('/profile');
  revalidatePath('/modules');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateAchievement(id: string, data: {
  name: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  gearsReward?: number;
  triggerCode?: string;
}) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  const existing = await prisma.achievement.findUnique({ where: { id } });
  if (!existing) return { success: false };

  const updatedFields = [];
  if (data.name !== existing.name) updatedFields.push('name');
  if (data.description !== existing.description) updatedFields.push('description');
  if (data.iconUrl !== existing.iconUrl) updatedFields.push('iconUrl');
  if (data.xpReward !== existing.xpReward) updatedFields.push('xpReward');
  if (data.gearsReward !== existing.gearsReward) updatedFields.push('gearsReward');
  if (data.triggerCode && data.triggerCode !== existing.triggerCode) updatedFields.push('triggerCode');

  // If trigger code is empty string or undefined, do not update it to prevent unique constraint violation
  const updateData: any = {
    name: data.name,
    description: data.description,
    iconUrl: data.iconUrl,
    xpReward: data.xpReward,
    gearsReward: data.gearsReward || 0
  };
  if (data.triggerCode) updateData.triggerCode = data.triggerCode;

  const achievement = await prisma.achievement.update({
    where: { id },
    data: updateData
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "UPDATED_ACHIEVEMENT",
    details: { id: achievement.id, name: achievement.name, updatedFields }
  });

  revalidatePath('/admin/achievements');
  revalidatePath('/achievements');
  revalidatePath('/profile');
  revalidatePath('/modules');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteAchievement(id: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  const achievement = await prisma.achievement.delete({
    where: { id }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "DELETED_ACHIEVEMENT",
    details: { id, name: achievement.name }
  });

  revalidatePath('/admin/achievements');
  revalidatePath('/achievements');
  revalidatePath('/profile');
  revalidatePath('/modules');
  revalidatePath('/', 'layout');
  return { success: true };
}
