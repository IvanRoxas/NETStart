import "next-auth";

declare module "next-auth" {
  interface User {
    type?: "student" | "admin";
    isBanned?: boolean;
    hasTakenAptitudeTest?: boolean;
  }
  interface Session {
    user: User & {
      id: string;
      type: "student" | "admin";
      isVerified: boolean;
      hasTakenAptitudeTest: boolean;
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
    hasTakenAptitudeTest: boolean;
    studentId: string | null;
    xp: number;
    activeTitle: string | null;
    displayName?: string;
  }
}
