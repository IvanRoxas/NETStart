import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
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
        
        if (!admin) throw new Error("Invalid admin credentials");
        
        const isValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isValid) throw new Error("Invalid admin credentials");
        
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
