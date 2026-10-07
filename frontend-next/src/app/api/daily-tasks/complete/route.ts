import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { XP_REWARDS } from "@/lib/xpEconomy";
import { getDailyTaskInfo, getTodayActiveDailyTaskIds, getTodayPHTDateStr } from "@/lib/dailyTasks";

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
    const todayStrPHT = getTodayPHTDateStr(nowUtc);

    // Enforce that only today's active daily tasks are monitored/accomplished
    const activeDailyTaskIds = getTodayActiveDailyTaskIds(nowUtc);
    if (!activeDailyTaskIds.includes(taskId)) {
      return NextResponse.json({
        success: false,
        notActiveToday: true,
        message: "This task is not part of today's active daily tasks.",
      });
    }

    const missionId = `daily-task-${taskId}-${todayStrPHT}`;

    const taskInfo = getDailyTaskInfo(taskId);
    const xpEarned = taskInfo.xpReward || XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP;
    const gearsEarned = taskInfo.gearsReward || 30;

    await prisma.$transaction(async (tx) => {
      // Check if this task was already recorded today inside the transaction lock
      const existing = await tx.missionProgress.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      if (existing && existing.status === "COMPLETED") {
        throw new Error("ALREADY_COMPLETED");
      }

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
      task: taskInfo,
    });
  } catch (error: any) {
    if (error?.message === "ALREADY_COMPLETED") {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }
    console.error("Error completing daily task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

