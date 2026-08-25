import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password";
import { logSystemAction } from "@/lib/logger";
import { ensureDefaultAchievements } from "@/app/actions/achievements";

export async function POST(req: Request) {
  try {
    await ensureDefaultAchievements();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { message: passwordError },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure displayName defaults to username and is unique
    let defaultDisplayName = username;
    const isDisplayNameTaken = await prisma.user.findUnique({
      where: { displayName: username }
    });
    
    if (isDisplayNameTaken) {
      defaultDisplayName = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username, // Assign provided username
        displayName: defaultDisplayName,
        showcasedBadges: ['b_create_account'],
        image: '/Profile.svg',
        activeTitle: 'Novice Explorer',
      },
    });

    // Handle initial achievement unlock (B_CREATE_ACCOUNT)
    const createAch = await prisma.achievement.findUnique({
      where: { triggerCode: 'B_CREATE_ACCOUNT' }
    });

    if (createAch) {
      await prisma.userAchievement.create({
        data: {
          userId: newUser.id,
          achievementId: createAch.id
        }
      });
      const { addXPAndCheckLevelUp } = await import('@/lib/xp');
      await addXPAndCheckLevelUp(newUser.id, createAch.xpReward);
    }

    // Create a notification for the 'Ready for Blast Off!' achievement
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        notificationType: 'achievement_unlocked',
        data: {
          badgeId: 'b_create_account',
          badgeName: 'Ready for Blast Off!',
          badgeImage: '/Planet 1.svg'
        }
      }
    });

    await logSystemAction({
      actorId: newUser.id,
      actorRole: "STUDENT",
      action: "USER_REGISTERED",
      details: { email: newUser.email }
    });

    return NextResponse.json(
      { message: "Successfully created an account!", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Error: ", error);
    return NextResponse.json(
      { message: "Internal server error", error: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}
