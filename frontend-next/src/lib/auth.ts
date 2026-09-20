import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        
        if (user.isBanned) {
          throw new Error("Account suspended by administrator.");
        }
        
        return {
          ...user,
          type: "student",
          rememberMe: credentials.rememberMe === "true"
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.type = (user as any).type || 'student';
        token.isBanned = (user as any).isBanned || false;
        token.displayName = (user as any).displayName;
        token.isVerified = (user as any).isVerified || false;
        token.hasTakenAptitudeTest = (user as any).hasTakenAptitudeTest || false;
        token.studentId = (user as any).studentId || null;
        token.xp = (user as any).xp || 0;
        token.activeTitle = (user as any).activeTitle || null;
        if (user.image && user.image.startsWith('data:')) {
          token.picture = `/api/profile/avatar?id=${user.id}&t=${Date.now()}`;
        }
      } else if (token.picture && typeof token.picture === 'string' && token.picture.startsWith('data:')) {
        token.picture = `/api/profile/avatar?id=${token.id}&t=${Date.now()}`;
      }
      
      // Allow frontend to refresh claims via update()
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.displayName !== undefined) token.displayName = session.displayName;
        if (session.image) token.picture = session.image;
        if (session.isVerified !== undefined) token.isVerified = session.isVerified;
        if (session.hasTakenAptitudeTest !== undefined) token.hasTakenAptitudeTest = session.hasTakenAptitudeTest;
        if (session.studentId !== undefined) token.studentId = session.studentId;
        if (session.xp !== undefined) token.xp = session.xp;
        if (session.activeTitle !== undefined) token.activeTitle = session.activeTitle;
      }

      // Sync latest db value on token evaluation so admin resets reflect immediately
      if (token.id && token.type !== 'admin') {
        try {
          const dbU = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { hasTakenAptitudeTest: true, isVerified: true, isBanned: true }
          });
          if (dbU) {
            token.hasTakenAptitudeTest = dbU.hasTakenAptitudeTest;
            token.isVerified = dbU.isVerified;
            token.isBanned = dbU.isBanned;
          }
        } catch (e) {}
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as "student" | "admin";
        session.user.isBanned = token.isBanned as boolean;
        session.user.isVerified = token.isVerified as boolean;
        session.user.hasTakenAptitudeTest = token.hasTakenAptitudeTest as boolean;
        session.user.studentId = token.studentId as string | null;
        session.user.xp = token.xp as number;
        session.user.activeTitle = token.activeTitle as string | null;
        if (token.name) session.user.name = token.name as string;
        if (token.displayName) session.user.displayName = token.displayName as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Assign custom display name defaulting to OAuth username
      let desiredDisplayName = user.name || `Explorer${Math.floor(10000 + Math.random() * 90000)}`;
      
      const isTaken = await prisma.user.findUnique({
        where: { displayName: desiredDisplayName }
      });
      
      if (isTaken) {
        desiredDisplayName = `${desiredDisplayName}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: desiredDisplayName,
          activeTitle: 'Novice Explorer'
        }
      });

      try {
        // Seed default achievements first if not done
        const { ensureDefaultAchievements } = await import('@/app/actions/achievements');
        await ensureDefaultAchievements();

        // Unlock B_CREATE_ACCOUNT
        const createAch = await prisma.achievement.findUnique({
          where: { triggerCode: 'B_CREATE_ACCOUNT' }
        });

        if (createAch) {
          const hasAch = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId: user.id,
                achievementId: createAch.id
              }
            }
          });
          if (!hasAch) {
            await prisma.userAchievement.create({
              data: {
                userId: user.id,
                achievementId: createAch.id
              }
            });
            const { addXPAndCheckLevelUp } = await import('@/lib/xp');
            await addXPAndCheckLevelUp(user.id, createAch.xpReward);
          }

          // Create notification
          const userNotifications = await prisma.notification.findMany({
            where: {
              userId: user.id,
              notificationType: 'achievement_unlocked'
            }
          });
          const hasNotification = userNotifications.some(n => {
            const d = n.data as any;
            return d && (d.badgeId === 'b_create_account' || d.badgeId === createAch.id);
          });

          if (!hasNotification) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                notificationType: 'achievement_unlocked',
                data: {
                  badgeId: 'b_create_account',
                  badgeName: 'Ready for Blast Off!',
                  badgeImage: '/Planet 1.svg'
                }
              }
            });
          }
        }
      } catch (err) {
        console.error("Error setting initial achievements in createUser event:", err);
      }
    },
    async linkAccount({ user, account, profile }) {
      if (account.provider === 'google') {
        // Set user as verified when they link their Google account
        await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true }
        });
      }
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
