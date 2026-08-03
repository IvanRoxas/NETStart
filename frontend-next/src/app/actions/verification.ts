"use server";

import { prisma } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { unlockAchievement } from "./achievements";
import { logSystemAction } from "@/lib/logger";

export async function generateAndSendCode(email: string, name?: string) {
  try {
    // Delete any existing codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email }
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt
      }
    });

    const emailResult = await sendVerificationEmail(email, code, name);
    
    if (!emailResult.success) {
      return { success: false, error: "Failed to send email." };
    }

    // Determine actorId - if the user is logged in, we use their ID, but this might be called during registration
    // where they don't have an ID yet. We can look them up by email to be sure, or just log 'system' if not found.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await logSystemAction({
        actorId: user.id,
        actorRole: "STUDENT",
        action: "OTP_REQUESTED",
        details: { event: 'Generated new verification code', email }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Code generation error:", error);
    return { success: false, error: "An error occurred while generating the code." };
  }
}

export async function verifyCode(email: string, code: string) {
  try {
    const record = await prisma.verificationCode.findUnique({
      where: {
        email_code: {
          email,
          code
        }
      }
    });

    if (!record) {
      return { success: false, error: "Invalid verification code." };
    }

    if (record.expiresAt < new Date()) {
      return { success: false, error: "Verification code has expired." };
    }

    // Code is valid and not expired, verify the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        isVerified: true
      }
    });
    
    const { addXPAndCheckLevelUp } = await import('@/lib/xp');
    await addXPAndCheckLevelUp(updatedUser.id, 50);

    // Unlock 'Verified Explorer' achievement
    await unlockAchievement('B_VERIFY_ACCOUNT');

    // Delete the used code
    await prisma.verificationCode.delete({
      where: { id: record.id }
    });

    await logSystemAction({
      actorId: updatedUser.id,
      actorRole: "STUDENT",
      action: "VERIFIED_EMAIL",
      targetUserId: updatedUser.id,
      details: { email }
    });

    return { success: true };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, error: "An error occurred during verification." };
  }
}
