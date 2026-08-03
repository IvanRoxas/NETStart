import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { missionId, submittedCode } = body;

    if (!missionId) {
      return NextResponse.json({ error: "Missing missionId" }, { status: 400 });
    }

    // Check if the user has already completed this mission
    const existingProgress = await prisma.missionProgress.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
    });

    const wasCompleted = existingProgress?.status === "COMPLETED";

    // Start transaction to secure updates
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update the progress status to completed
      const progress = await tx.missionProgress.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
        update: {
          status: "COMPLETED",
          submittedCode: submittedCode || "",
          completedAt: new Date(),
        },
        create: {
          userId,
          missionId,
          status: "COMPLETED",
          submittedCode: submittedCode || "",
          completedAt: new Date(),
        },
      });

      // 2. Award XP and Gears ONLY if the mission is completed for the first time
      let xpEarned = 0;
      let gearsEarned = 0;
      
      if (!wasCompleted) {
        xpEarned = 100;
        gearsEarned = 20;

        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: xpEarned },
            gears: { increment: gearsEarned },
          },
        });
      }

      return { progress, xpEarned, gearsEarned };
    });

    return NextResponse.json({
      success: true,
      xpEarned: result.xpEarned,
      gearsEarned: result.gearsEarned,
      alreadyCompleted: wasCompleted,
    });
  } catch (error: any) {
    console.error("Error completing mission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
