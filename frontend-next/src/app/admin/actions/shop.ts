"use server";

import { prisma } from "@/lib/auth";
import { requireAdmin } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";
import { logSystemAction } from "@/lib/logger";

export async function getShopItems(searchQuery?: string) {
  await requireAdmin();

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
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  const item = await prisma.shopItem.create({
    data: {
      title: data.title,
      type: data.type,
      category: data.category,
      subCategory: data.subCategory,
      price: data.price,
      imageUrl: data.imageUrl
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
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
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  const existing = await prisma.shopItem.findUnique({ where: { id } });
  if (!existing) return { success: false };

  const updatedFields = [];
  if (data.title !== existing.title) updatedFields.push('title');
  if (data.type !== existing.type) updatedFields.push('type');
  if (data.category !== existing.category) updatedFields.push('category');
  if (data.subCategory !== existing.subCategory) updatedFields.push('subCategory');
  if (data.price !== existing.price) updatedFields.push('price');
  if (data.imageUrl !== existing.imageUrl) updatedFields.push('imageUrl');

  const item = await prisma.shopItem.update({
    where: { id },
    data: {
      title: data.title,
      type: data.type,
      category: data.category,
      subCategory: data.subCategory,
      price: data.price,
      imageUrl: data.imageUrl
    }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "UPDATED_SHOP_ITEM",
    details: { id: item.id, title: item.title, updatedFields }
  });

  revalidatePath('/admin/shop');
  revalidatePath('/shop');
  return { success: true };
}

export async function deleteShopItem(id: string) {
  const session = await requireAdmin();
  const adminId = (session.user as any).id;

  const item = await prisma.shopItem.delete({
    where: { id }
  });

  await logSystemAction({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "DELETED_SHOP_ITEM",
    details: { id, title: item.title }
  });

  revalidatePath('/admin/shop');
  revalidatePath('/shop');
  return { success: true };
}
