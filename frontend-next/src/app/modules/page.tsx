import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModulesClient from "./ModulesClient";
import { getXPDetails } from "@/lib/leveling";

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any)?.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      gears: true,
      isVerified: true,
    }
  });

  const isVerified = dbUser?.isVerified === true;
  const xp = dbUser?.xp || 0;
  const gears = dbUser?.gears || 0;
  const { level, progress } = getXPDetails(xp);

  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    select: {
      missionId: true,
    }
  });

  const liveStats = {
    level,
    progress,
    xp,
    gears,
  };

  return (
    <div className="flex w-full h-full">
      <main className="flex-1 flex flex-col z-10 h-full overflow-hidden relative">
        <ModulesClient 
          isVerified={isVerified} 
          liveStats={liveStats} 
          completedMissions={completedMissions} 
        />
      </main>
    </div>
  );
}
