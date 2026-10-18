import { prisma } from "@/lib/auth";

export async function ensureSandboxUnlockedNotification(userId: string) {
  if (!userId) {
    return { created: false, notification: null };
  }

  return await prisma.$transaction(async (tx) => {
    // Acquire a transaction-level advisory lock per user to serialize concurrent requests
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

    const existing = await tx.notification.findFirst({
      where: {
        userId,
        notificationType: "sandbox_unlocked",
      },
    });

    if (existing) {
      return { created: false, notification: existing };
    }

    const created = await tx.notification.create({
      data: {
        userId,
        notificationType: "sandbox_unlocked",
        data: {
          title: "Code Sandbox Unlocked!",
          message:
            "Congratulations Cadet! You have completed all Moon missions. The Code Sandbox is now unlocked in your sidebar!",
        },
      },
    });

    return { created: true, notification: created };
  }, { timeout: 10000, maxWait: 10000 });
}
