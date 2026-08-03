import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModulesClient from "./ModulesClient";

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isVerified = (session.user as any)?.isVerified === true;

  return (
    <div className="flex w-full h-full">
      <main className="flex-1 flex flex-col z-10 h-full overflow-hidden relative">
        <ModulesClient isVerified={isVerified} />
      </main>
    </div>
  );
}
