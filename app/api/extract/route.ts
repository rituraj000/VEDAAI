import { NextResponse } from "next/server";
import { getSession, saveSession, updateSession } from "@/lib/store";
import { GeminiProvider } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, apiKey, session: inputSession } = body;
    if (!sessionId && !inputSession) {
      return NextResponse.json({ error: "sessionId or session is required" }, { status: 400 });
    }

    let session = inputSession || (sessionId ? getSession(sessionId) : undefined);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (inputSession) {
      saveSession(inputSession);
    }

    const provider = new GeminiProvider(apiKey);

    // Update status to extracting questions
    updateSession(session.sessionId, {
      status: "extracting",
      progressStep: 2,
      progressMessage: "Extracting questions via AI Vision...",
    });

    // Stage A: Extract Questions (Throws error if API fails)
    const questions = await provider.extractQuestions(session.questionPaperPages);

    updateSession(session.sessionId, {
      progressStep: 3,
      progressMessage: "Transcribing handwritten answers & bounding boxes...",
    });

    // Stage B: Extract Answers (Throws error if API fails)
    const answerSegments = await provider.extractAnswers(session.answerSheetPages);

    updateSession(session.sessionId, {
      progressStep: 4,
      progressMessage: "Mapping student answers to extracted questions...",
    });

    // Stage C: Map Answers
    const { mappings, unmatchedSegments } = await provider.mapAnswersToQuestions(
      questions,
      answerSegments
    );

    updateSession(session.sessionId, {
      progressStep: 5,
      progressMessage: "Generating AI scores & evaluation feedback...",
    });

    // Stage D: Grade Answers
    const grades = await provider.gradeAnswers(questions, mappings);

    // Update session state with AI API results
    const updated = updateSession(session.sessionId, {
      questions,
      answerSegments,
      mappings,
      unmatchedSegments,
      grades,
      status: "graded",
      progressStep: 6,
      progressMessage: "AI Extraction & Mapping completed successfully!",
    });

    const finalSession = updated || {
      ...session,
      questions,
      answerSegments,
      mappings,
      unmatchedSegments,
      grades,
      status: "graded",
      progressStep: 6,
      progressMessage: "AI Extraction & Mapping completed successfully!",
    };

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
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
