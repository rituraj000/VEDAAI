import { NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/store";
import { GeminiProvider } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let currentSessionId = "";
  try {
    const { sessionId, apiKey, questionPaperPages, answerSheetPages } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    currentSessionId = sessionId;

    let qpPages: string[] = questionPaperPages || [];
    let ansPages: string[] = answerSheetPages || [];

    if (qpPages.length === 0 || ansPages.length === 0) {
      const session = getSession(sessionId);
      if (session) {
        qpPages = session.questionPaperPages || [];
        ansPages = session.answerSheetPages || [];
      }
    }

    if (qpPages.length === 0 && ansPages.length === 0) {
      return NextResponse.json(
        { error: "No page images found. Please re-upload your files." },
        { status: 400 }
      );
    }

    updateSession(sessionId, {
      status: "extracting",
      progressStep: 2,
      progressMessage: "Extracting questions via AI Vision...",
    });

    const provider = new GeminiProvider(apiKey);

    const questions = await provider.extractQuestions(qpPages);

    updateSession(sessionId, {
      progressStep: 3,
      progressMessage: "Transcribing handwritten answers & bounding boxes...",
    });

    const answerSegments = await provider.extractAnswers(ansPages);

    updateSession(sessionId, {
      progressStep: 4,
      progressMessage: "Mapping student answers to extracted questions...",
    });

    const { mappings, unmatchedSegments } = await provider.mapAnswersToQuestions(
      questions,
      answerSegments
    );

    updateSession(sessionId, {
      progressStep: 5,
      progressMessage: "Generating AI scores & evaluation feedback...",
    });

    const grades = await provider.gradeAnswers(questions, mappings);

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
      data: finalSession || {
        sessionId,
        questions,
        answerSegments,
        mappings,
        unmatchedSegments,
        grades,
        status: "graded",
        progressStep: 6,
        progressMessage: "AI Extraction & Mapping completed successfully!",
      },
    });
  } catch (error: any) {
    console.error("Extraction pipeline error:", error);
    return NextResponse.json(
      { error: error.message || "Extraction pipeline failed." },
      { status: 500 }
    );
  }
}
