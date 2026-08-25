import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import AptitudeTestClient from "./AptitudeTestClient";
import TopHeader from "@/components/TopHeader";

export default async function AptitudeTestPage() {
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
      isVerified: true,
      hasTakenAptitudeTest: true,
      logicScore: true,
      patternRecognitionScore: true,
      recommendedLearningPath: true,
    }
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#130927] overflow-y-auto">
      <TopHeader title="Aptitude Test" />
      <main className="flex-1 w-full max-w-6xl xl:max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pb-20 relative z-10">
        <AptitudeTestClient initialUser={dbUser} />
      </main>
    </div>
  );
}
