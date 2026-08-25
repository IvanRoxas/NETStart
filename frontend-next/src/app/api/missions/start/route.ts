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
    const { missionId } = body;

    if (!missionId) {
      return NextResponse.json({ error: "Missing missionId" }, { status: 400 });
    }

    // Upsert the mission progress. If it is already completed, we keep the COMPLETED status
    // but update startedAt to indicate the last time they entered/started it.
    const progress = await prisma.missionProgress.upsert({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
      update: {
        startedAt: new Date(),
      },
      create: {
        userId,
        missionId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error("Error starting mission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
