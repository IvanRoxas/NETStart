import { NextResponse } from "next/server";
import questionsData from "@/server/data/aptitude_questions.server.json";
import { getActiveClientQuestions } from "@/lib/aptitudeQuestionsHelper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { questions } = await getActiveClientQuestions();

    return NextResponse.json({
      success: true,
      totalQuestions: questions.length,
      categories: questionsData.categories,
      questions,
    });
  } catch (error: any) {
    console.error("[APTITUDE_API] Failed to serve diagnostic questions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load diagnostic questions" },
      { status: 500 }
    );
  }
}

