import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TopHeader from "@/components/TopHeader";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex w-full h-full">
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col z-10 h-full overflow-hidden">
        <TopHeader title={`Welcome aboard, ${((session.user as any)?.displayName || session.user?.name)?.split(' ')[0] || ''}!`} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 lg:p-10 pr-10 md:pr-12 lg:pr-16 flex flex-col gap-10">
          
        </div>
      </main>

    </div>
  );
}
