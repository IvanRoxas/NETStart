"use server";

import { prisma } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mail";
import { logSystemAction } from "@/lib/logger";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function resetPasswordRequest(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // To prevent email enumeration attacks, always return success even if user doesn't exist
    if (!user) {
      return { success: "If an account exists, a reset link has been sent." };
    }

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Generate random secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Expire token in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in DB
    const savedToken = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // Send the password reset email
    const emailResult = await sendPasswordResetEmail(email, savedToken.token);

    if (!emailResult.success) {
      return { success: false, error: "Failed to send reset email." };
    }

    // Log security event
    await logSystemAction({
      actorId: user.id,
      actorRole: "STUDENT",
      action: "RESET_PASSWORD_REQUESTED",
      targetUserId: user.id,
      details: { email }
    });

    return { success: "If an account exists, a reset link has been sent." };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: "An error occurred during reset request." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!tokenRecord) {
      return { success: false, error: "Invalid reset token." };
    }

    if (tokenRecord.expires < new Date()) {
      return { success: false, error: "Reset token has expired." };
    }

    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.identifier }
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: { password: hashedPassword }
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    // Log security event
    await logSystemAction({
      actorId: user.id,
      actorRole: "STUDENT",
      action: "PASSWORD_CHANGED",
      targetUserId: user.id,
      details: { email: user.email }
    });

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, error: "An error occurred while resetting the password." };
  }
}
