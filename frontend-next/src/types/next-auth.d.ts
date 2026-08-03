import "next-auth";

declare module "next-auth" {
  interface User {
    type?: "student" | "admin";
    isBanned?: boolean;
  }
  interface Session {
    user: User & {
      id: string;
      type: "student" | "admin";
      isVerified: boolean;
      studentId: string | null;
      xp: number;
      activeTitle: string | null;
      displayName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    type: "student" | "admin";
    isBanned: boolean;
    isVerified: boolean;
    studentId: string | null;
    xp: number;
    activeTitle: string | null;
    displayName?: string;
  }
}
