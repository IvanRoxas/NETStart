import "next-auth";

declare module "next-auth" {
  interface User {
    type?: "student" | "admin";
    role?: "SUPER_ADMIN" | "TEACHER";
    isActive?: boolean;
    isBanned?: boolean;
    hasTakenAptitudeTest?: boolean;
    canUseDemoMode?: boolean;
  }
  interface Session {
    user: User & {
      id: string;
      type: "student" | "admin";
      role?: "SUPER_ADMIN" | "TEACHER";
      isActive?: boolean;
      isVerified: boolean;
      hasTakenAptitudeTest: boolean;
      canUseDemoMode?: boolean;
      studentId: string | null;
      xp: number;
      activeTitle: string | null;
      displayName?: string | null;
      border?: string | null;
      createdAt?: string | null;
      logicScore?: number | null;
      patternRecognitionScore?: number | null;
      taskDecompositionScore?: number | null;
      recommendedLearningPath?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    type: "student" | "admin";
    role?: "SUPER_ADMIN" | "TEACHER";
    isActive?: boolean;
    isBanned: boolean;
    isVerified: boolean;
    hasTakenAptitudeTest: boolean;
    canUseDemoMode?: boolean;
    studentId: string | null;
    xp: number;
    activeTitle: string | null;
    displayName?: string | null;
    border?: string | null;
    createdAt?: string | null;
    logicScore?: number | null;
    patternRecognitionScore?: number | null;
    taskDecompositionScore?: number | null;
    recommendedLearningPath?: string | null;
  }
}

