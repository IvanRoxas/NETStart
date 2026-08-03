import { prisma } from "@/lib/auth";

export async function logSystemAction(data: {
  actorId: string;
  actorRole: "STUDENT" | "ADMIN";
  action: string;
  targetUserId?: string;
  details?: any;
}) {
  try {
    await prisma.systemLog.create({
      data: {
        actorId: data.actorId,
        actorRole: data.actorRole,
        action: data.action,
        targetUserId: data.targetUserId,
        details: data.details ? JSON.stringify(data.details) : "{}"
      }
    });
  } catch (error) {
    console.error("Failed to log system action:", error);
  }
}
