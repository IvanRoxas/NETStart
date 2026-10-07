import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { XP_REWARDS } from "@/lib/xpEconomy";
import { getTodayActiveDailyTaskIds } from "@/lib/dailyTasks";

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

    const bonusXP = XP_REWARDS.DAILY_COMMISSIONS.COMPLETION_BONUS; // 100 XP
    const bonusGears = 100;

    await prisma.$transaction(async (tx) => {
      // Check if already claimed today inside the transaction lock
      const existingClaim = await tx.missionProgress.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId: bonusMissionId,
          },
        },
      });

      if (existingClaim && existingClaim.status === "COMPLETED") {
        throw new Error("ALREADY_CLAIMED");
      }

      // Enforce that all active daily tasks for today are completed
      const activeDailyTaskIds = getTodayActiveDailyTaskIds(nowUtc);
      const requiredMissionIds = activeDailyTaskIds.map(tId => `daily-task-${tId}-${todayStrPHT}`);

      const completedCount = await tx.missionProgress.count({
        where: {
          userId,
          missionId: { in: requiredMissionIds },
          status: "COMPLETED",
        },
      });

      if (completedCount < activeDailyTaskIds.length) {
        throw new Error("TASKS_NOT_COMPLETED");
      }

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
    if (error?.message === "ALREADY_CLAIMED") {
      return NextResponse.json({ error: "Daily bonus already claimed for today" }, { status: 400 });
    }
    if (error?.message === "TASKS_NOT_COMPLETED") {
      return NextResponse.json({ error: "All daily tasks must be completed before claiming the bonus" }, { status: 400 });
    }
    console.error("Error claiming daily commission bonus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
