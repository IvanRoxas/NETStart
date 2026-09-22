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
        xpEarned = XP_REWARDS.TOTAL_LEVEL_YIELD; // 150 XP Level Completion Total (50 XP x 3 sections)
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

    // 3. After transaction: check if a new planet was just unlocked (first completion of this mission)
    if (!wasCompleted) {
      // Planet → mission prefix mapping (mirrors ModulesClient.tsx)
      const planetOrder = [
        { id: 'moon', name: 'The Moon', prefixes: ['moon'], nextId: 'mars', nextName: 'Mars', nextSrc: '/assets/planets/celestial/Mars.svg' },
        { id: 'mars', name: 'Mars', prefixes: ['mars', 'html'], nextId: 'venus', nextName: 'Venus', nextSrc: '/assets/planets/celestial/Venus.svg' },
        { id: 'venus', name: 'Venus', prefixes: ['venus', 'css'], nextId: 'mercury', nextName: 'Mercury', nextSrc: '/assets/planets/celestial/Mercury.svg' },
        { id: 'mercury', name: 'Mercury', prefixes: ['mercury', 'javascript', 'js'], nextId: 'jupiter', nextName: 'Jupiter', nextSrc: '/assets/planets/celestial/Jupiter.svg' },
        { id: 'jupiter', name: 'Jupiter', prefixes: ['jupiter', 'java'], nextId: 'saturn', nextName: 'Saturn', nextSrc: '/assets/planets/celestial/Saturn.svg' },
        { id: 'saturn', name: 'Saturn', prefixes: ['saturn', 'cpp'], nextId: 'earth', nextName: 'Earth (HQ)', nextSrc: '/assets/planets/celestial/Earth.svg' },
        { id: 'earth', name: 'Earth (HQ)', prefixes: ['earth', 'python'], nextId: null, nextName: null, nextSrc: null },
      ];

      const missionIdLower = missionId.toLowerCase();
      const completedPlanet = planetOrder.find(p =>
        p.prefixes.some(prefix => missionIdLower.startsWith(prefix))
      );

      if (completedPlanet && completedPlanet.nextId) {
        // Count how many missions of this planet the user has now completed
        const allMissions = await prisma.missionProgress.findMany({
          where: { userId, status: 'COMPLETED' },
          select: { missionId: true },
        });

        const completedForThisPlanet = allMissions.filter(m =>
          completedPlanet.prefixes.some(prefix => m.missionId.toLowerCase().startsWith(prefix))
        ).length;

        // If exactly 3 are done, this was the trigger that unlocked the next planet
        if (completedForThisPlanet === 3) {
          // Avoid duplicate planet_unlocked notifications for the same planet
          const existing = await prisma.notification.findFirst({
            where: {
              userId,
              notificationType: 'planet_unlocked',
              data: {
                path: ['planetId'],
                equals: completedPlanet.nextId,
              },
            },
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                userId,
                notificationType: 'planet_unlocked',
                data: {
                  planetId: completedPlanet.nextId,
                  planetName: completedPlanet.nextName,
                  planetSrc: completedPlanet.nextSrc,
                  unlockedFrom: completedPlanet.name,
                },
              },
            });
          }
        }
      }
    }

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
