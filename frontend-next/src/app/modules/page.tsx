import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import ModulesClient from "./ModulesClient";
import DailyTaskTracker from "@/components/DailyTaskTracker";
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

  const dbUser = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail },
    select: {
      id: true,
      xp: true,
      gears: true,
      isVerified: true,
      hasTakenAptitudeTest: true,
    }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const activeUserId = dbUser.id;

  const isVerified = dbUser?.isVerified === true;
  const hasTakenAptitudeTest = dbUser?.hasTakenAptitudeTest === true;
  const xp = dbUser?.xp || 0;
  const gears = dbUser?.gears || 0;
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
    }
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
      <DailyTaskTracker taskIds={["task-explore-2"]} />
      <TopHeader title="Missions Page" />
      <div id="modules-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full bg-[#180729]">
        <ModulesClient 
          userId={activeUserId}
          isVerified={isVerified} 
          hasTakenAptitudeTest={hasTakenAptitudeTest}
          liveStats={liveStats} 
          completedMissions={completedMissions} 
        />
      </div>
    </main>
  );
}
