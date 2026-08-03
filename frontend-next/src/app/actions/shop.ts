"use server";

import { prisma } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logSystemAction } from "@/lib/logger";

export async function getShopItems() {
  try {
    const items = await prisma.shopItem.findMany();
    return { success: true, items };
  } catch (error) {
    console.error("Failed to fetch shop items:", error);
    return { success: false, error: "Failed to load shop items" };
  }
}

export async function getUserInventory() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const inventory = await prisma.userInventory.findMany({
      where: { userId: (session.user as any).id },
      include: { shopItem: true },
    });
    
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { gears: true, isVerified: true }
    });

    return { success: true, inventory, gears: user?.gears || 0, isVerified: user?.isVerified || false };
  } catch (error) {
    console.error("Failed to fetch user inventory:", error);
    return { success: false, error: "Failed to load inventory" };
  }
}

export async function purchaseItem(itemId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch user and item
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { gears: true },
      });

      const item = await tx.shopItem.findUnique({
        where: { id: itemId },
      });

      if (!user || !item) {
        throw new Error("User or Item not found");
      }

      // 2. Check if user already owns it
      const existingInventory = await tx.userInventory.findUnique({
        where: {
          userId_shopItemId: {
            userId,
            shopItemId: itemId,
          },
        },
      });

      if (existingInventory) {
        throw new Error("You already own this item");
      }

      // 3. Check if user has enough gears
      if (user.gears < item.price) {
        throw new Error("Not enough gears");
      }

      // 4. Deduct gears and add to inventory
      await tx.user.update({
        where: { id: userId },
        data: { gears: { decrement: item.price } },
      });

      await tx.userInventory.create({
        data: {
          userId,
          shopItemId: itemId,
        },
      });

      return { success: true, item };
    });

    await logSystemAction({
      actorId: userId,
      actorRole: "STUDENT",
      action: "PURCHASED_ITEM",
      targetUserId: userId,
      details: { itemId, title: result.item.title, price: result.item.price }
    });

    revalidatePath("/shop");
    return result;

  } catch (error: any) {
    console.error("Purchase failed:", error.message || error);
    return { success: false, error: error.message || "Purchase failed" };
  }
}

export async function claimVerificationReward() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isVerified) {
      return { success: false, error: "User not verified" };
    }

    const existing = await prisma.notification.findFirst({
      where: { userId, notificationType: 'system_verify_reward' }
    });

    if (existing) {
      return { success: true, claimed: false };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { gears: { increment: 150 } }
      }),
      prisma.notification.create({
        data: {
          userId,
          notificationType: 'system_verify_reward',
          data: { amount: 150, title: 'Verification Reward' }
        }
      })
    ]);

    await logSystemAction({
      actorId: userId,
      actorRole: "STUDENT",
      action: "GRANTED_CURRENCY",
      targetUserId: userId,
      details: { amount: 150, type: 'GEARS', reason: 'Email Verification' }
    });

    return { success: true, claimed: true, amount: 150 };
  } catch (error) {
    console.error("Claim reward error:", error);
    return { success: false, error: "An error occurred claiming the reward" };
  }
}
