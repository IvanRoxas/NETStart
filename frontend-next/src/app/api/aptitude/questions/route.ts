import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import questionsData from "@/server/data/aptitude_questions.server.json";
import { getActiveClientQuestions } from "@/lib/aptitudeQuestionsHelper";
import { getSystemSettings } from "@/lib/systemSettings";

export const dynamic = "force-dynamic";

function seededRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seedStr: string): T[] {
  const result = [...array];
  const rand = seededRandom(seedStr);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function GET() {
  try {
    const { questions: baseQuestions } = await getActiveClientQuestions();
    const settings = await getSystemSettings();

    let finalQuestions = baseQuestions;

    if (settings.shuffleAptitudeQuestions) {
      const session = await getServerSession(authOptions);
      const userSeed =
        (session?.user as any)?.id ||
        (session?.user as any)?.email ||
        "anonymous_test_seed";

      finalQuestions = shuffleWithSeed(baseQuestions, userSeed).map((q, idx) => ({
        ...q,
        number: idx + 1,
      }));
    }

    return NextResponse.json({
      success: true,
      totalQuestions: finalQuestions.length,
      isShuffled: settings.shuffleAptitudeQuestions,
      categories: questionsData.categories,
      questions: finalQuestions,
    });
  } catch (error: any) {
    console.error("[APTITUDE_API] Failed to serve diagnostic questions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load diagnostic questions" },
      { status: 500 }
    );
  }
}
