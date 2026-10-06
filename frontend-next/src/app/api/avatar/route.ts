import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, prisma } from '@/lib/auth';
import { SHOP_CATALOG } from '@/lib/shopCatalog';

export const dynamic = 'force-dynamic';

const DEFAULT_SKIN = '/assets/global/shop/avatar/base/Skin 1 Faceless.svg';
const DEFAULT_FACE = '/assets/global/shop/avatar/base/Full Face.svg';
const DEFAULT_UNDERWEAR = '/assets/global/shop/avatar/base/Underwear (Default).svg';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user for stored skin / status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, displayName: true },
    });

    let activeSkin = DEFAULT_SKIN;
    if (user?.status) {
      try {
        const parsed = JSON.parse(user.status);
        if (parsed?.skin) activeSkin = parsed.skin;
      } catch {
        if (user.status.startsWith('/assets/')) activeSkin = user.status;
      }
    }

    // 2. Fetch inventory items with equipped state
    const userInventory = await prisma.userInventory.findMany({
      where: { userId },
      include: { shopItem: true },
    });

    // Match each inventory item with shopCatalog if needed
    const enrichedInventory = userInventory.map((inv) => {
      const catalogMatch = SHOP_CATALOG.find(
        (c) => c.id === inv.shopItemId || c.imageUrl === inv.shopItem?.imageUrl
      );
      return {
        id: inv.id,
        shopItemId: inv.shopItemId,
        isEquipped: inv.isEquipped,
        item: {
          id: catalogMatch?.id || inv.shopItem?.id || inv.shopItemId,
          title: catalogMatch?.title || inv.shopItem?.title || 'Avatar Item',
          category: catalogMatch?.category || inv.shopItem?.category || 'AVATAR',
          subCategory: catalogMatch?.subCategory || inv.shopItem?.subCategory || 'Accessories',
          imageUrl: catalogMatch?.imageUrl || inv.shopItem?.imageUrl || '',
        },
      };
    });

    // 3. Compute active layers from equipped items
    const layers: {
      skin: string;
      face: string;
      underwear: string;
      bottom?: string;
      top?: string;
      shoes?: string;
      hair?: string;
      accessory?: string;
    } = {
      skin: activeSkin,
      face: DEFAULT_FACE,
      underwear: DEFAULT_UNDERWEAR,
    };

    const equippedIds: string[] = [];

    for (const inv of enrichedInventory) {
      if (inv.isEquipped && inv.item.imageUrl) {
        equippedIds.push(inv.item.id);
        const sub = (inv.item.subCategory || '').toLowerCase();
        if (sub === 'hair' || sub === 'hairstyles') {
          layers.hair = inv.item.imageUrl;
        } else if (sub === 'accessories' || sub === 'hats') {
          layers.accessory = inv.item.imageUrl;
        } else if (sub === 'tops') {
          layers.top = inv.item.imageUrl;
        } else if (sub === 'bottoms') {
          layers.bottom = inv.item.imageUrl;
        } else if (sub === 'shoes') {
          layers.shoes = inv.item.imageUrl;
        }
      }
    }

    return NextResponse.json({
      success: true,
      skin: activeSkin,
      layers,
      equippedIds,
      inventory: enrichedInventory,
    });
  } catch (error: any) {
    console.error('Failed to load avatar configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { skin, equippedItemIds } = body as {
      skin?: string;
      equippedItemIds?: string[];
    };

    await prisma.$transaction(async (tx) => {
      // 1. Persist skin in user.status
      if (skin) {
        let existingStatusObj: any = {};
        const u = await tx.user.findUnique({
          where: { id: userId },
          select: { status: true },
        });
        if (u?.status) {
          try {
            existingStatusObj = JSON.parse(u.status);
          } catch {}
        }
        existingStatusObj.skin = skin;
        await tx.user.update({
          where: { id: userId },
          data: { status: JSON.stringify(existingStatusObj) },
        });
      }

      // 2. Update equipped items
      if (Array.isArray(equippedItemIds)) {
        // Reset all avatar categories to unequipped
        await tx.userInventory.updateMany({
          where: { userId },
          data: { isEquipped: false },
        });

        // Set isEquipped = true for the passed IDs that the user actually owns
        if (equippedItemIds.length > 0) {
          await tx.userInventory.updateMany({
            where: {
              userId,
              shopItemId: { in: equippedItemIds },
            },
            data: { isEquipped: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Avatar updated successfully' });
  } catch (error: any) {
    console.error('Failed to update avatar configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar configuration' },
      { status: 500 }
    );
  }
}
