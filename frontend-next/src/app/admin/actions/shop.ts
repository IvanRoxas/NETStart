"use server";

import { prisma } from "@/lib/auth";
import { requireSuperAdmin } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";
import { logSystemAction } from "@/lib/logger";

export async function getShopItems(searchQuery?: string) {
  await requireSuperAdmin();

  let whereClause: any = {};
  if (searchQuery) {
    whereClause = {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } }
      ]
    };
  }

  const items = await prisma.shopItem.findMany({
    where: whereClause,
    orderBy: { title: 'asc' }
  });

  return items;
}

export async function createShopItem(data: {
  title: string;
  type: string;
  category: string;
  subCategory: string;
  price: number;
  imageUrl: string;
}) {
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;

  if (!data.title?.trim()) {
    throw new Error("Item title is required.");
  }
  const safePrice = Math.max(0, Math.floor(Number(data.price) || 0));
  const safeImage = (data.imageUrl || "").trim();
  if (!safeImage) {
    throw new Error("Item image URL is required.");
  }

  const item = await prisma.shopItem.create({
    data: {
      title: data.title.trim(),
      type: data.type,
      category: data.category,
      subCategory: data.subCategory,
      price: safePrice,
      imageUrl: safeImage
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: "CREATED_SHOP_ITEM",
    details: { id: item.id, title: item.title, price: item.price }
  });

  revalidatePath('/admin/shop');
  revalidatePath('/shop');
  return { success: true };
}

export async function updateShopItem(id: string, data: {
  title: string;
  type: string;
  category: string;
  subCategory: string;
  price: number;
  imageUrl: string;
}) {
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;

  const existing = await prisma.shopItem.findUnique({ where: { id } });
  if (!existing) return { success: false };

  if (!data.title?.trim()) {
    throw new Error("Item title is required.");
  }
  const safePrice = Math.max(0, Math.floor(Number(data.price) || 0));
  const safeImage = (data.imageUrl || "").trim();
  if (!safeImage) {
    throw new Error("Item image URL is required.");
  }

  const updatedFields = [];
  if (data.title !== existing.title) updatedFields.push('title');
  if (data.type !== existing.type) updatedFields.push('type');
  if (data.category !== existing.category) updatedFields.push('category');
  if (data.subCategory !== existing.subCategory) updatedFields.push('subCategory');
  if (safePrice !== existing.price) updatedFields.push('price');
  if (safeImage !== existing.imageUrl) updatedFields.push('imageUrl');

  const item = await prisma.shopItem.update({
    where: { id },
    data: {
      title: data.title.trim(),
      type: data.type,
      category: data.category,
      subCategory: data.subCategory,
      price: safePrice,
      imageUrl: safeImage
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: "UPDATED_SHOP_ITEM",
    details: { id: item.id, title: item.title, updatedFields }
  });

  revalidatePath('/admin/shop');
  revalidatePath('/shop');
  return { success: true };
}

export async function deleteShopItem(id: string) {
  const session = await requireSuperAdmin();
  const adminId = (session.user as any).id;

  const item = await prisma.shopItem.delete({
    where: { id }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "SUPER_ADMIN",
    action: "DELETED_SHOP_ITEM",
    details: { id, title: item.title }
  });

  revalidatePath('/admin/shop');
  revalidatePath('/shop');
  return { success: true };
}
