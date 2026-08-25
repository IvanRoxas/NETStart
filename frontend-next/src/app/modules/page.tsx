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
  const { level, progress } = getXPDetails(xp);

  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId: activeUserId,
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
    <div className="relative w-full h-full overflow-x-hidden overflow-y-auto bg-[#130927]">
      <ModulesClient 
        isVerified={isVerified} 
        hasTakenAptitudeTest={hasTakenAptitudeTest}
        liveStats={liveStats} 
        completedMissions={completedMissions} 
      />
    </div>
  );
}
