import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DEMO_MODE_COOKIE } from "@/lib/demoMode";
import TopHeader from "@/components/TopHeader";
import ModulesClient from "./ModulesClient";
import DailyTaskTracker from "@/components/DailyTaskTracker";
import { getXPDetails } from "@/lib/leveling";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ModulesPage() {
  const cookieStore = await cookies();
  const isDemoMode = cookieStore.get(DEMO_MODE_COOKIE)?.value === 'true';

  const session = await getServerSession(authOptions);

  if (!session && !isDemoMode) {
    redirect("/login");
  }

  const sessionUser = session?.user as any;
  const userId = sessionUser?.id;
  const userEmail = sessionUser?.email;

  if (!userId && !userEmail && !isDemoMode) {
    redirect("/login");
  }

  const dbUser = (userId || userEmail) ? await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail },
    select: {
      id: true,
      xp: true,
      gears: true,
      isVerified: true,
      hasTakenAptitudeTest: true,
      aptitudeResult: true,
      recommendedLearningPath: true,
    }
  }) : null;

  if (!dbUser && !isDemoMode) {
    redirect("/login");
  }

  const activeUserId = dbUser?.id || "demo-cadet";

  const isVerified = isDemoMode ? true : dbUser?.isVerified === true;
  const hasTakenAptitudeTest = isDemoMode ? true : dbUser?.hasTakenAptitudeTest === true;
  const xp = dbUser?.xp || 0;
  const gears = dbUser?.gears || 0;
  const { level, progress, nextThreshold, levelCurrentXp, levelRequiredXp, isMaxLevel } = getXPDetails(xp);

  const completedMissions = dbUser ? await prisma.missionProgress.findMany({
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
    }
  }) : [];

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
      <DailyTaskTracker taskIds={["task-explore-2"]} />
      <TopHeader title="Missions Page" />
      <div id="modules-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full bg-[#180729]">
        <ModulesClient 
          userId={activeUserId}
          isVerified={isVerified} 
          hasTakenAptitudeTest={hasTakenAptitudeTest}
          aptitudeResult={dbUser?.aptitudeResult}
          recommendedLearningPath={dbUser?.recommendedLearningPath}
          liveStats={liveStats} 
          completedMissions={completedMissions} 
        />
      </div>
    </main>
  );
}
