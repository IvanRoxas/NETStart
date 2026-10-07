import { NextResponse } from "next/server";
import questionsData from "@/server/data/aptitude_questions.server.json";
import { ClientAptitudeQuestion } from "@/types/aptitude";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Serve questions strictly WITHOUT answer, explanation, or reference fields
    const sanitizedQuestions: ClientAptitudeQuestion[] = questionsData.questions.map((q) => ({
      id: q.id,
      category: q.category as ClientAptitudeQuestion["category"],
      number: q.number,
      title: q.title,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({
      success: true,
      totalQuestions: sanitizedQuestions.length,
      categories: questionsData.categories,
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    console.error("[APTITUDE_API] Failed to serve diagnostic questions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load diagnostic questions" },
      { status: 500 }
    );
  }
}
