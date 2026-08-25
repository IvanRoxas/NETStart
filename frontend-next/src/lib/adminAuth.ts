import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./auth";

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }
        
        const admin = await prisma.systemAdmin.findUnique({ 
          where: { username: credentials.username } 
        });
        
        if (!admin) {
          try {
            const { logSystemAction } = await import("./logger");
            await logSystemAction({
              actorId: "UNKNOWN",
              actorRole: "ADMIN",
              action: "ADMIN_LOGIN_FAILED",
              details: { username: credentials.username, timestamp: new Date().toISOString() }
            });
          } catch (err) {
            console.error("Failed to log system action:", err);
          }
          throw new Error("Invalid admin credentials");
        }

        // Lockout Check
        if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
          const remainingMinutes = Math.ceil((new Date(admin.lockedUntil).getTime() - Date.now()) / (60 * 1000));
          throw new Error(`This account is temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`);
        }
        
        const isValid = await bcrypt.compare(credentials.password, admin.password);
        
        if (!isValid) {
          const newFailedAttempts = admin.failedLoginAttempts + 1;
          const isLocking = newFailedAttempts >= 5;
          const lockedUntil = isLocking ? new Date(Date.now() + 15 * 60 * 1000) : null;

          await prisma.systemAdmin.update({
            where: { id: admin.id },
            data: {
              failedLoginAttempts: newFailedAttempts,
              lockedUntil: lockedUntil
            }
          });

          try {
            const { logSystemAction } = await import("./logger");
            
            if (isLocking) {
              await logSystemAction({
                actorId: admin.id,
                actorRole: "ADMIN",
                action: "ADMIN_ACCOUNT_LOCKED",
                details: { username: admin.username, lockedUntil: lockedUntil?.toISOString() }
              });
            }

            await logSystemAction({
              actorId: admin.id,
              actorRole: "ADMIN",
              action: "ADMIN_LOGIN_FAILED",
              details: { username: admin.username, timestamp: new Date().toISOString() }
            });
          } catch (err) {
            console.error("Failed to log system action:", err);
          }

          if (isLocking) {
            throw new Error("Invalid admin credentials. Account has been locked for 15 minutes.");
          } else {
            const attemptsRemaining = 5 - newFailedAttempts;
            throw new Error(`Invalid admin credentials. You have ${attemptsRemaining} attempts remaining before account lockout.`);
          }
        }
        
        // Success Path: Reset attempts and clear lockout
        await prisma.systemAdmin.update({
          where: { id: admin.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null
          }
        });

        try {
          const { logSystemAction } = await import("./logger");
          await logSystemAction({
            actorId: admin.id,
            actorRole: "ADMIN",
            action: "ADMIN_LOGIN_SUCCESS",
            details: { username: admin.username, timestamp: new Date().toISOString() }
          });
        } catch (err) {
          console.error("Failed to log system action:", err);
        }

        return {
          id: admin.id,
          name: admin.username,
          type: "admin"
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: process.env.NODE_ENV === "production" ? 60 * 15 : 60 * 60 * 24, // 15 mins in prod, 24 hours in dev
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as "student" | "admin";
      }
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      if (token && token.type === 'admin') {
        try {
          const { logSystemAction } = await import("./logger");
          await logSystemAction({
            actorId: token.id as string,
            actorRole: "ADMIN",
            action: "ADMIN_LOGOUT",
            details: { username: token.name || "admin", timestamp: new Date().toISOString() }
          });
        } catch (err) {
          console.error("Failed to log admin logout event:", err);
        }
      }
    }
  },
  pages: {
    signIn: "/admin-login",
  },
  cookies: {
    sessionToken: {
      name: `admin-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};
