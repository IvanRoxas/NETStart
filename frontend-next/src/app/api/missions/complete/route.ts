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
        const isEarth3 = missionId.toLowerCase() === 'earth-3' || missionId.toLowerCase() === 'python-3';
        xpEarned = isEarth3 ? 500 : XP_REWARDS.TOTAL_LEVEL_YIELD;
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

      if (completedPlanet) {
        // Count how many missions of this planet the user has now completed
        const allMissions = await prisma.missionProgress.findMany({
          where: { userId, status: 'COMPLETED' },
          select: { missionId: true },
        });

        // 1. Award B_FIRST_MISSION if first ever completed mission
        if (allMissions.length >= 1) {
          const firstMissionAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_FIRST_MISSION' } });
          if (firstMissionAch) {
            const hasFirst = await prisma.userAchievement.findUnique({
              where: { userId_achievementId: { userId, achievementId: firstMissionAch.id } }
            });
            if (!hasFirst) {
              await prisma.userAchievement.create({
                data: { userId, achievementId: firstMissionAch.id }
              });
              const { addXPAndCheckLevelUp } = await import('@/lib/xp');
              await addXPAndCheckLevelUp(userId, firstMissionAch.xpReward);
              await prisma.notification.create({
                data: {
                  userId,
                  notificationType: 'achievement_unlocked',
                  data: {
                    badgeId: firstMissionAch.id,
                    badgeName: firstMissionAch.name,
                    badgeImage: firstMissionAch.iconUrl,
                    description: firstMissionAch.description
                  }
                }
              });
            }
          }
        }

        const completedForThisPlanet = allMissions.filter(m =>
          completedPlanet.prefixes.some(prefix => m.missionId.toLowerCase().startsWith(prefix))
        ).length;

        // If exactly 3 are done, this unlocks the next planet and awards the planet completion badge
        if (completedForThisPlanet === 3) {
          if (completedPlanet.nextId) {
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

          // Award the Planet Completion Achievement
          const planetAchTrigger = {
            moon: 'B_COMPLETE_MOON',
            mars: 'B_COMPLETE_MARS',
            venus: 'B_COMPLETE_VENUS',
            mercury: 'B_COMPLETE_MERCURY',
            jupiter: 'B_COMPLETE_JUPITER',
            saturn: 'B_COMPLETE_SATURN',
            earth: 'B_COMPLETE_EARTH',
          }[completedPlanet.id];

          if (planetAchTrigger) {
            const planetAch = await prisma.achievement.findUnique({ where: { triggerCode: planetAchTrigger } });
            if (planetAch) {
              const hasPlanetAch = await prisma.userAchievement.findUnique({
                where: { userId_achievementId: { userId, achievementId: planetAch.id } }
              });
              if (!hasPlanetAch) {
                await prisma.userAchievement.create({
                  data: { userId, achievementId: planetAch.id }
                });
                const { addXPAndCheckLevelUp } = await import('@/lib/xp');
                await addXPAndCheckLevelUp(userId, planetAch.xpReward);
                await prisma.notification.create({
                  data: {
                    userId,
                    notificationType: 'achievement_unlocked',
                    data: {
                      badgeId: planetAch.id,
                      badgeName: planetAch.name,
                      badgeImage: planetAch.iconUrl,
                      description: planetAch.description
                    }
                  }
                });
              }
            }
          }

          // Check if all 7 planets are completed
          const planetsCompleteCount = planetOrder.filter(p => {
            return allMissions.filter(m => p.prefixes.some(pre => m.missionId.toLowerCase().startsWith(pre))).length >= 3;
          }).length;

          if (planetsCompleteCount === 7) {
            const allPlanetsAch = await prisma.achievement.findUnique({ where: { triggerCode: 'B_COMPLETE_ALL_PLANETS' } });
            if (allPlanetsAch) {
              const hasAllAch = await prisma.userAchievement.findUnique({
                where: { userId_achievementId: { userId, achievementId: allPlanetsAch.id } }
              });
              if (!hasAllAch) {
                await prisma.userAchievement.create({
                  data: { userId, achievementId: allPlanetsAch.id }
                });
                const { addXPAndCheckLevelUp } = await import('@/lib/xp');
                await addXPAndCheckLevelUp(userId, allPlanetsAch.xpReward);
                await prisma.notification.create({
                  data: {
                    userId,
                    notificationType: 'achievement_unlocked',
                    data: {
                      badgeId: allPlanetsAch.id,
                      badgeName: allPlanetsAch.name,
                      badgeImage: allPlanetsAch.iconUrl,
                      description: allPlanetsAch.description
                    }
                  }
                });
              }
            }
          }
        }
      }
    }

    // 4. Check and auto-complete corresponding daily task if applicable
    const completedDailyTasks: any[] = [];

    try {
      const phtFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const todayStrPHT = phtFormatter.format(new Date());
      const [pYear, pMonth, pDay] = todayStrPHT.split("-").map(Number);
      const phtDaySeed = (pYear * 372) + (pMonth * 31) + pDay;

      let eligibleDailyTaskId: string | null = null;
      if (missionId.toLowerCase().startsWith("daily")) {
        eligibleDailyTaskId = "task-daily-level";
      } else {
        eligibleDailyTaskId = `task-curriculum-${1 + (phtDaySeed % 3)}`;
      }

      if (eligibleDailyTaskId) {
        const dailyMissionId = `daily-task-${eligibleDailyTaskId}-${todayStrPHT}`;
        const existingDaily = await prisma.missionProgress.findUnique({
          where: { userId_missionId: { userId, missionId: dailyMissionId } },
        });

        if (!existingDaily || existingDaily.status !== "COMPLETED") {
          const { getDailyTaskInfo } = await import("@/lib/dailyTasks");
          const taskInfo = getDailyTaskInfo(eligibleDailyTaskId);
          const xpEarned = taskInfo.xpReward || 5;
          const gearsEarned = taskInfo.gearsReward || 10;

          await prisma.$transaction(async (tx) => {
            await tx.missionProgress.upsert({
              where: { userId_missionId: { userId, missionId: dailyMissionId } },
              update: { status: "COMPLETED", completedAt: new Date() },
              create: { userId, missionId: dailyMissionId, status: "COMPLETED", completedAt: new Date() },
            });

            await tx.user.update({
              where: { id: userId },
              data: { xp: { increment: xpEarned }, gears: { increment: gearsEarned } },
            });

            completedDailyTasks.push({
              taskId: eligibleDailyTaskId,
              title: taskInfo.title,
              tag: taskInfo.tag,
              desc: taskInfo.desc,
              xpEarned,
              gearsEarned,
            });
          });
        }
      }
    } catch (dailyErr) {
      console.warn("Could not check/complete daily task during mission completion:", dailyErr);
    }

    const isEarth3 = missionId.toLowerCase() === 'earth-3' || missionId.toLowerCase() === 'python-3';

    return NextResponse.json({
      success: true,
      xpEarned: result.xpEarned,
      gearsEarned: result.gearsEarned,
      alreadyCompleted: wasCompleted,
      isGameCompleted: isEarth3,
      completedDailyTasks,
    });
  } catch (error: any) {
    console.error("Error completing mission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

