import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { XP_REWARDS } from "@/lib/xpEconomy";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Determine current PHT date
    const nowUtc = new Date();
    const phtFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayStrPHT = phtFormatter.format(nowUtc);

    const bonusMissionId = `daily-commission-bonus-${todayStrPHT}`;

    // Check if already claimed today
    const existingClaim = await prisma.missionProgress.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId: bonusMissionId,
        },
      },
    });

    if (existingClaim && existingClaim.status === "COMPLETED") {
      return NextResponse.json({ error: "Daily bonus already claimed for today" }, { status: 400 });
    }

    const bonusXP = XP_REWARDS.DAILY_COMMISSIONS.COMPLETION_BONUS; // 10 XP
    const bonusGears = 50;

    await prisma.$transaction(async (tx) => {
      await tx.missionProgress.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId: bonusMissionId,
          },
        },
        update: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
        create: {
          userId,
          missionId: bonusMissionId,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: bonusXP },
          gears: { increment: bonusGears },
        },
      });
    });

    return NextResponse.json({
      success: true,
      bonusXP,
      bonusGears,
    });
  } catch (error: any) {
    console.error("Error claiming daily commission bonus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
