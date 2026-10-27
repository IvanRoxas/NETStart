import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { XP_REWARDS } from "@/lib/xpEconomy";
import { ensureSandboxUnlockedNotification } from "@/lib/sandboxNotification";
import { resolveNextPlanet } from "@/lib/unlockLogic";
import { getAchievementByTrigger } from "@/app/actions/achievements";

const PLANET_METADATA: Record<string, {
  id: string;
  name: string;
  prefixes: string[];
  src: string;
  triggerCode: string;
  title: { id: string; name: string; description: string };
}> = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    prefixes: ['moon'],
    src: '/assets/planets/00_moon/environment/MainMoon.svg',
    triggerCode: 'B_COMPLETE_MOON',
    title: {
      id: 'title-lunar-pioneer',
      name: 'Syntax Scout',
      description: 'Mastered coding syntax and foundations on the Moon.',
    },
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    prefixes: ['mars', 'html'],
    src: '/assets/planets/celestial/Mars.svg',
    triggerCode: 'B_COMPLETE_MARS',
    title: {
      id: 'title-planetary-pioneer',
      name: 'Web Builder',
      description: 'Mastered HTML structure and hyperlinks across Mars.',
    },
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    prefixes: ['venus', 'css'],
    src: '/assets/planets/celestial/Venus.svg',
    triggerCode: 'B_COMPLETE_VENUS',
    title: {
      id: 'title-venusian-voyager',
      name: 'Style Artist',
      description: 'Mastered CSS styling, colors, and layout design on Venus.',
    },
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    prefixes: ['mercury', 'javascript', 'js'],
    src: '/assets/planets/celestial/Mercury.svg',
    triggerCode: 'B_COMPLETE_MERCURY',
    title: {
      id: 'title-mercurian-scout',
      name: 'Script Runner',
      description: 'Mastered JavaScript events and dynamic interactivity on Mercury.',
    },
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    prefixes: ['jupiter', 'java'],
    src: '/assets/planets/celestial/Jupiter.svg',
    triggerCode: 'B_COMPLETE_JUPITER',
    title: {
      id: 'title-jovian-sovereign',
      name: 'Java Titan',
      description: 'Mastered Java classes, OOP, and exception handling on Jupiter.',
    },
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    prefixes: ['saturn', 'cpp'],
    src: '/assets/planets/celestial/Saturn.svg',
    triggerCode: 'B_COMPLETE_SATURN',
    title: {
      id: 'title-void-architect',
      name: 'System Pilot',
      description: 'Mastered C++ pointers, memory, and performance loops on Saturn.',
    },
  },
  earth: {
    id: 'earth',
    name: 'Earth (HQ)',
    prefixes: ['earth', 'python'],
    src: '/assets/planets/celestial/Earth.svg',
    triggerCode: 'B_COMPLETE_EARTH',
    title: {
      id: 'title-terran-maestro',
      name: 'Python Master',
      description: 'Mastered Python algorithms and data structures on Earth.',
    },
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { missionId, submittedCode } = body;

    if (!missionId || typeof missionId !== "string") {
      return NextResponse.json({ error: "Missing or invalid missionId" }, { status: 400 });
    }

    const VALID_MISSION_PREFIXES = ['moon', 'mars', 'venus', 'mercury', 'jupiter', 'saturn', 'earth', 'html', 'css', 'js', 'javascript', 'java', 'cpp', 'python'];
    const lowerMission = missionId.trim().toLowerCase();
    const isValidMission = lowerMission.startsWith('daily') || 
                           lowerMission.startsWith('epilogue') || 
                           VALID_MISSION_PREFIXES.some(p => new RegExp(`^${p}[-_]?[1-3]`, 'i').test(lowerMission));

    if (!isValidMission) {
      return NextResponse.json({ error: "Invalid or unrecognized missionId" }, { status: 400 });
    }

    // Start transaction to secure updates and prevent concurrent double-rewards
    const result = await prisma.$transaction(async (tx) => {
      // Check if the user has already completed this mission inside the transaction
      const existingProgress = await tx.missionProgress.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      const wasCompleted = existingProgress?.status === "COMPLETED";

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
        const isDailyLevel = missionId.toLowerCase().startsWith('daily');
        const isEarth3 = missionId.toLowerCase() === 'earth-3' || missionId.toLowerCase() === 'python-3';
        xpEarned = isEarth3 ? 500 : isDailyLevel ? 100 : XP_REWARDS.TOTAL_LEVEL_YIELD;
        gearsEarned = isDailyLevel ? 300 : 30;

        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: xpEarned },
            gears: { increment: gearsEarned },
          },
        });
      }

      return { progress, xpEarned, gearsEarned, wasCompleted };
    });

    const { progress, xpEarned, gearsEarned, wasCompleted } = result;
    let sandboxJustUnlocked = false;

    // 3. After transaction: check if a new planet was just unlocked (first completion of this mission)
    if (!wasCompleted) {
      const missionIdLower = missionId.toLowerCase();
      const completedPlanet = Object.values(PLANET_METADATA).find(p =>
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
          const firstMissionAch = await getAchievementByTrigger('B_FIRST_MISSION');
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
          if (completedPlanet.id === 'moon') {
            sandboxJustUnlocked = true;
            await ensureSandboxUnlockedNotification(userId);
          }

          // Fetch user's pathOrder to dynamically resolve the next planet
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { pathOrder: true },
          });

          const nextPlanetKey = resolveNextPlanet(dbUser?.pathOrder, completedPlanet.id);
          const nextPlanet = nextPlanetKey ? PLANET_METADATA[nextPlanetKey] : null;

          if (nextPlanet) {
            // Avoid duplicate planet_unlocked notifications for the same planet
            const existing = await prisma.notification.findFirst({
              where: {
                userId,
                notificationType: 'planet_unlocked',
                data: {
                  path: ['planetId'],
                  equals: nextPlanet.id,
                },
              },
            });

            if (!existing) {
              await prisma.notification.create({
                data: {
                  userId,
                  notificationType: 'planet_unlocked',
                  data: {
                    planetId: nextPlanet.id,
                    planetName: nextPlanet.name,
                    planetSrc: nextPlanet.src,
                    unlockedFrom: completedPlanet.name,
                  },
                },
              });
            }
          }

          // Award the Planet Completion Achievement
          const planetAchTrigger = completedPlanet.triggerCode;

          if (planetAchTrigger) {
            const planetAch = await getAchievementByTrigger(planetAchTrigger);
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

          // Award the Title for completing this individual planet
          const awardedTitle = completedPlanet.title;
          if (awardedTitle) {
            const existingTitleNotif = await prisma.notification.findFirst({
              where: {
                userId,
                notificationType: 'title_unlocked',
                data: {
                  path: ['titleId'],
                  equals: awardedTitle.id,
                },
              },
            });

            if (!existingTitleNotif) {
              await prisma.notification.create({
                data: {
                  userId,
                  notificationType: 'title_unlocked',
                  data: {
                    titleId: awardedTitle.id,
                    titleName: awardedTitle.name,
                    planetId: completedPlanet.id,
                    planetName: completedPlanet.name,
                    description: awardedTitle.description,
                    icon: 'quill',
                  },
                },
              });
            }
          }

          // Check if all 7 planets are completed
          const planetsCompleteCount = Object.values(PLANET_METADATA).filter(p => {
            return allMissions.filter(m => p.prefixes.some(pre => m.missionId.toLowerCase().startsWith(pre))).length >= 3;
          }).length;

          if (planetsCompleteCount === 7) {
            const allPlanetsAch = await getAchievementByTrigger('B_COMPLETE_ALL_PLANETS');
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

            // Award Grand Celestial Master title notification
            const existingGrandNotif = await prisma.notification.findFirst({
              where: {
                userId,
                notificationType: 'title_unlocked',
                data: {
                  path: ['titleId'],
                  equals: 'title-grand-celestial-master',
                },
              },
            });

            if (!existingGrandNotif) {
              await prisma.notification.create({
                data: {
                  userId,
                  notificationType: 'title_unlocked',
                  data: {
                    titleId: 'title-grand-celestial-master',
                    titleName: 'Full Stack Master',
                    planetName: 'The Entire Solar Constellation',
                    description: 'The pinnacle rank: conquered all programming languages in the constellation.',
                    icon: 'quill',
                  },
                },
              });
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

      const { getTodayActiveDailyTaskIds, getDailyTaskInfo } = await import("@/lib/dailyTasks");
      const activeDailyTaskIds = getTodayActiveDailyTaskIds();

      let eligibleDailyTaskId: string | null = null;
      if (missionId.toLowerCase().startsWith("daily")) {
        if (activeDailyTaskIds.includes("task-daily-level")) {
          eligibleDailyTaskId = "task-daily-level";
        }
      } else {
        if (activeDailyTaskIds.includes("task-curriculum-1")) {
          eligibleDailyTaskId = "task-curriculum-1";
        }
      }

      if (eligibleDailyTaskId) {
        const dailyMissionId = `daily-task-${eligibleDailyTaskId}-${todayStrPHT}`;
        const existingDaily = await prisma.missionProgress.findUnique({
          where: { userId_missionId: { userId, missionId: dailyMissionId } },
        });

        if (!existingDaily || existingDaily.status !== "COMPLETED") {
          const { getDailyTaskInfo } = await import("@/lib/dailyTasks");
          const taskInfo = getDailyTaskInfo(eligibleDailyTaskId);
          const xpEarned = taskInfo.xpReward || 25;
          const gearsEarned = taskInfo.gearsReward || 30;

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
      sandboxUnlocked: sandboxJustUnlocked,
      completedDailyTasks,
    });
  } catch (error: any) {
    console.error("Error completing mission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

