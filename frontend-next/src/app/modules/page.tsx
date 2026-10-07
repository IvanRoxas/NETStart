import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DEMO_MODE_COOKIE } from "@/lib/demoMode";
import TopHeader from "@/components/TopHeader";
import ModulesClient from "./ModulesClient";
import { getXPDetails } from "@/lib/leveling";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const sessionUser = session?.user as any;
  const userId = sessionUser?.id;
  const userEmail = sessionUser?.email;

  if (!userId && !userEmail) {
    redirect("/login");
  }

  let dbUser: any = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail },
      select: {
        id: true,
        xp: true,
        gears: true,
        isVerified: true,
        hasTakenAptitudeTest: true,
        recommendedLearningPath: true,
        canUseDemoMode: true,
      }
    });
  } catch (err: any) {
    dbUser = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail },
      select: {
        id: true,
        xp: true,
        gears: true,
        isVerified: true,
        hasTakenAptitudeTest: true,
        recommendedLearningPath: true,
      }
    });
    if (dbUser) {
      try {
        const raw: any = await prisma.$queryRaw`SELECT can_use_demo_mode FROM users WHERE user_id = ${dbUser.id} LIMIT 1`;
        dbUser.canUseDemoMode = Boolean(raw?.[0]?.can_use_demo_mode);
      } catch {
        dbUser.canUseDemoMode = false;
      }
    }
  }

  if (!dbUser) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const canUseDemoMode = dbUser.canUseDemoMode === true;
  const isDemoModeCookie = cookieStore.get(DEMO_MODE_COOKIE)?.value === 'true';
  const isDemoMode = canUseDemoMode && isDemoModeCookie;

  const activeUserId = dbUser.id;

  const isVerified = isDemoMode ? true : dbUser.isVerified === true;
  const hasTakenAptitudeTest = isDemoMode ? true : dbUser.hasTakenAptitudeTest === true;
  const recommendedLearningPath = dbUser.recommendedLearningPath || undefined;
  const xp = dbUser.xp || 0;
  const gears = dbUser.gears || 0;
  const { level, progress, nextThreshold, levelCurrentXp, levelRequiredXp, isMaxLevel } = getXPDetails(xp);

  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId: activeUserId,
      status: "COMPLETED",
      NOT: {
        missionId: {
          startsWith: "daily-",
        },
      },
    },
    select: {
      missionId: true,
    },
  });

  const liveStats = {
    level,
    progress,
    nextThreshold,
    levelCurrentXp,
    levelRequiredXp,
    isMaxLevel,
    xp,
    gears,
  };

  return (
    <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#180729]">
      <TopHeader title="Missions Page" />
      <div id="modules-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full bg-[#180729]">
        <ModulesClient 
          userId={activeUserId}
          isVerified={isVerified} 
          hasTakenAptitudeTest={hasTakenAptitudeTest}
          recommendedLearningPath={recommendedLearningPath}
          liveStats={liveStats} 
          completedMissions={completedMissions}
          canUseDemoMode={canUseDemoMode}
        />
      </div>
    </main>
  );
}
