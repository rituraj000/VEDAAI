import { NextResponse } from "next/server";
import { getSession, saveSession, updateSession } from "@/lib/store";
import { GeminiProvider } from "@/lib/ai/gemini";
import { getSampleDataset } from "@/lib/ai/fallback-data";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s timeout allowance for Vercel serverless AI functions

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

    // Check if running Sample Demo dataset
    const isSample =
      session.questionPaperName?.includes("Class_10_Physics") ||
      session.answerSheetName?.includes("Rahul");

    let questions, answerSegments, mappings, unmatchedSegments, grades;

    if (isSample && (!apiKey || apiKey.trim() === "")) {
      // Use pre-computed sample demo payload if no custom API key is supplied
      const sampleData = getSampleDataset();
      questions = sampleData.questions;
      answerSegments = sampleData.answerSegments;
      mappings = sampleData.mappings;
      unmatchedSegments = sampleData.unmatchedSegments;
      grades = sampleData.grades;
    } else {
      const provider = new GeminiProvider(apiKey);

      // Update status to extracting questions
      updateSession(session.sessionId, {
        status: "extracting",
        progressStep: 2,
        progressMessage: "Extracting questions via AI Vision...",
      });

      // Stage A: Extract Questions (Throws error if API fails)
      questions = await provider.extractQuestions(session.questionPaperPages);

      updateSession(session.sessionId, {
        progressStep: 3,
        progressMessage: "Transcribing handwritten answers & bounding boxes...",
      });

      // Stage B: Extract Answers (Throws error if API fails)
      answerSegments = await provider.extractAnswers(session.answerSheetPages);

      updateSession(session.sessionId, {
        progressStep: 4,
        progressMessage: "Mapping student answers to extracted questions...",
      });

      // Stage C: Map Answers
      const mapped = await provider.mapAnswersToQuestions(questions, answerSegments);
      mappings = mapped.mappings;
      unmatchedSegments = mapped.unmatchedSegments;

      updateSession(session.sessionId, {
        progressStep: 5,
        progressMessage: "Generating AI scores & evaluation feedback...",
      });

      // Stage D: Grade Answers
      grades = await provider.gradeAnswers(questions, mappings);
    }

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
