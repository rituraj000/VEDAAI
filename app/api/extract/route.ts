import { NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/store";
import { GeminiProvider } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sessionId, apiKey } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const provider = new GeminiProvider(apiKey);

    // Update status to extracting questions
    updateSession(sessionId, {
      status: "extracting",
      progressStep: 2,
      progressMessage: "Extracting questions via AI Vision...",
    });

    // Stage A: Extract Questions (Throws error if API fails)
    const questions = await provider.extractQuestions(session.questionPaperPages);

    updateSession(sessionId, {
      progressStep: 3,
      progressMessage: "Transcribing handwritten answers & bounding boxes...",
    });

    // Stage B: Extract Answers (Throws error if API fails)
    const answerSegments = await provider.extractAnswers(session.answerSheetPages);

    updateSession(sessionId, {
      progressStep: 4,
      progressMessage: "Mapping student answers to extracted questions...",
    });

    // Stage C: Map Answers
    const { mappings, unmatchedSegments } = await provider.mapAnswersToQuestions(
      questions,
      answerSegments
    );

    updateSession(sessionId, {
      progressStep: 5,
      progressMessage: "Generating AI scores & evaluation feedback...",
    });

    // Stage D: Grade Answers
    const grades = await provider.gradeAnswers(questions, mappings);

    // Update session state with AI API results
    const finalSession = updateSession(sessionId, {
      questions,
      answerSegments,
      mappings,
      unmatchedSegments,
      grades,
      status: "graded",
      progressStep: 6,
      progressMessage: "AI Extraction & Mapping completed successfully!",
    });

    return NextResponse.json({
      success: true,
      sessionId,
      data: finalSession,
    });
  } catch (error: any) {
    console.error("Extraction pipeline error:", error);
    return NextResponse.json(
      { error: error.message || "API Not Responding: Extraction pipeline failed." },
      { status: 500 }
    );
  }
}
