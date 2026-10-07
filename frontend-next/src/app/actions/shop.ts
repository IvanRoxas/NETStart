"use server";

import { prisma } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logSystemAction } from "@/lib/logger";

import { SHOP_CATALOG, getCatalogItemById } from "@/lib/shopCatalog";

export async function getShopItems() {
  try {
    let items = await prisma.shopItem.findMany();

    const existingIds = new Set(items.map(i => i.id));
    const hasMissing = SHOP_CATALOG.some(c => !existingIds.has(c.id));
    const hasOutOfDate = items.some(i => {
      const cat = getCatalogItemById(i.id);
      return cat && (cat.title !== i.title || cat.price !== i.price);
    });

    // Auto-seed or upsert items from SHOP_CATALOG if missing or updated
    if (hasMissing || hasOutOfDate || items.length < SHOP_CATALOG.length) {
      for (const catItem of SHOP_CATALOG) {
        await prisma.shopItem.upsert({
          where: { id: catItem.id },
          update: {
            title: catItem.title,
            type: catItem.type,
            category: catItem.category,
            subCategory: catItem.subCategory,
            price: catItem.price,
            imageUrl: catItem.imageUrl,
          },
          create: {
            id: catItem.id,
            title: catItem.title,
            type: catItem.type,
            category: catItem.category,
            subCategory: catItem.subCategory,
            price: catItem.price,
            imageUrl: catItem.imageUrl,
          },
        });
      }
      items = await prisma.shopItem.findMany();
    }

    const catalogIds = new Set(
      SHOP_CATALOG.filter((c) => !c.isDefaultOutfit).map((c) => c.id)
    );
    const validItems = items.filter((item) => catalogIds.has(item.id));

    // Attach tag, title, and description from catalog or defaults
    const enrichedItems = validItems.map((item) => {
      const meta = getCatalogItemById(item.id);
      return {
        ...item,
        title: meta?.title || item.title,
        tag: meta?.tag || item.type,
        description: meta?.description || "High-tech equipment for the NETStart space voyage.",
      };
    });

    return { success: true, items: enrichedItems };
  } catch (error) {
    console.error("Failed to fetch shop items:", error);
    // Fallback directly to catalog if database query fails or during dev sync
    return { success: true, items: SHOP_CATALOG.filter((c) => !c.isDefaultOutfit) };
  }
}

export async function getUserInventory() {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const u = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
      userId = u?.id;
    }
    if (!session || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const inventory = await prisma.userInventory.findMany({
      where: { userId },
      include: { shopItem: true },
    });
    
    const mappedInventory = inventory.map(inv => {
      if (inv.shopItem && !SHOP_CATALOG.some(c => c.id === inv.shopItemId)) {
        const match = SHOP_CATALOG.find(c => c.imageUrl === inv.shopItem?.imageUrl);
        if (match) {
          return {
            ...inv,
            shopItemId: match.id,
            shopItem: {
              ...inv.shopItem,
              id: match.id,
              title: match.title
            }
          };
        }
      }
      return inv;
    });

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { gears: true, isVerified: true }
    });

    return { success: true, inventory: mappedInventory, gears: user?.gears || 0, isVerified: user?.isVerified || false };
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

    const catItem = getCatalogItemById(itemId);
    if (catItem?.isDefaultOutfit || itemId === "top-astro-suit" || itemId === "bot-astro-pants" || itemId === "shoe-astro-boots") {
      return { success: false, error: "This item is part of the default astronaut gear and is already unlocked for everyone." };
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Ensure item exists in DB if from catalog
      let item = await tx.shopItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        if (catItem) {
          item = await tx.shopItem.create({
            data: {
              id: catItem.id,
              title: catItem.title,
              type: catItem.type,
              category: catItem.category,
              subCategory: catItem.subCategory,
              price: catItem.price,
              imageUrl: catItem.imageUrl,
            },
          });
        }
      } else if (catItem && item.price !== catItem.price) {
        item = await tx.shopItem.update({
          where: { id: itemId },
          data: {
            price: catItem.price,
            title: catItem.title,
            type: catItem.type,
            category: catItem.category,
            subCategory: catItem.subCategory,
            imageUrl: catItem.imageUrl,
          },
        });
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { gears: true },
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

      // 3. Atomically check and deduct gears to prevent concurrent double-spend
      const updatedUser = await tx.user.updateMany({
        where: {
          id: userId,
          gears: { gte: item.price },
        },
        data: {
          gears: { decrement: item.price },
        },
      });

      if (updatedUser.count === 0) {
        throw new Error("Not enough gears");
      }

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
      return { success: false, claimed: false, amount: 0, error: "Unauthorized" };
    }
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isVerified) {
      return { success: false, claimed: false, amount: 0, error: "User not verified" };
    }
    if (user.verifiedRewardClaimed) {
      return { success: true, claimed: false, amount: 0 };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.updateMany({
        where: {
          id: userId,
          isVerified: true,
          verifiedRewardClaimed: false,
        },
        data: {
          gears: { increment: 225 },
          verifiedRewardClaimed: true,
        },
      });

      if (updatedUser.count === 0) {
        return { success: true, claimed: false, amount: 0 };
      }

      await tx.notification.create({
        data: {
          userId,
          notificationType: 'system_verify_reward',
          data: { amount: 225, title: 'Verification Reward' }
        }
      });

      return { success: true, claimed: true, amount: 225 };
    });

    if (!result.claimed) {
      return result;
    }

    await logSystemAction({
      actorId: userId,
      actorRole: "STUDENT",
      action: "GRANTED_CURRENCY",
      targetUserId: userId,
      details: { amount: 225, type: 'GEARS', reason: 'Email Verification' }
    });

    return { success: true, claimed: true, amount: 225 };
  } catch (error) {
    console.error("Claim reward error:", error);
    return { success: false, claimed: false, amount: 0, error: "An error occurred claiming the reward" };
  }
}
