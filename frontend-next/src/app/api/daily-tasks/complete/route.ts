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
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Determine current PHT date
    const nowUtc = new Date();
    const phtFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayStrPHT = phtFormatter.format(nowUtc);

    const missionId = `daily-task-${taskId}-${todayStrPHT}`;

    // Check if this task was already recorded today
    const existing = await prisma.missionProgress.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
    });

    if (existing && existing.status === "COMPLETED") {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    // Reward config mapping
    const gearsRewardMap: Record<string, number> = {
      "task-daily-level": 20,
      "task-curriculum-1": 10,
      "task-curriculum-2": 10,
      "task-curriculum-3": 10,
      "task-explore-1": 5,
      "task-explore-2": 5,
      "task-explore-3": 5,
      "task-achieve-1": 5,
      "task-achieve-2": 5,
      "task-achieve-3": 5,
    };

    const xpEarned = XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP; // 5 XP
    const gearsEarned = gearsRewardMap[taskId] || 5;

    await prisma.$transaction(async (tx) => {
      await tx.missionProgress.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
        update: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
        create: {
          userId,
          missionId,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          gears: { increment: gearsEarned },
        },
      });
    });

    return NextResponse.json({
      success: true,
      xpEarned,
      gearsEarned,
      missionId,
    });
  } catch (error: any) {
    console.error("Error completing daily task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
