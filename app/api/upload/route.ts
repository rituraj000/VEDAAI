import { NextResponse } from "next/server";
import { saveSession } from "@/lib/store";
import { SessionData } from "@/lib/types";
import { generateFigmaAnswerSheetSVG } from "@/lib/ai/fallback-data";
import { pdfBufferToPageImages } from "@/lib/ai/pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let qpPages: string[] = [];
    let ansPages: string[] = [];
    let qpName = "Question_Paper.pdf";
    let ansName = "Student_Answer_Sheet.pdf";
    let qpSize = "1.8 MB";
    let ansSize = "2.4 MB";

    // Handle Sample Demo mode upload by providing page images to the real AI API pipeline
    if (contentType.includes("application/json")) {
      const json = await req.json();
      if (json.sample) {
        qpName = "Class_10_Physics_Math_Test.pdf";
        ansName = "Student_Answer_Sheet_Rahul.pdf";
        const page1 = generateFigmaAnswerSheetSVG(1);
        const page2 = generateFigmaAnswerSheetSVG(2);
        qpPages = [page1, page2];
        ansPages = [page1, page2];
      }
    } else {
      // Multipart Form Data upload handling
      const formData = await req.formData();
      const qpFileInput = formData.get("questionPaper") as File | null;
      const ansFileInput = formData.get("answerSheet") as File | null;

      if (!qpFileInput || !ansFileInput) {
        return NextResponse.json(
          { error: "Both Question Paper and Answer Sheet files are required." },
          { status: 400 }
        );
      }

      qpName = qpFileInput.name;
      ansName = ansFileInput.name;
      qpSize = `${(qpFileInput.size / 1024 / 1024).toFixed(1)} MB`;
      ansSize = `${(ansFileInput.size / 1024 / 1024).toFixed(1)} MB`;

      const qpBuffer = Buffer.from(await qpFileInput.arrayBuffer());
      const ansBuffer = Buffer.from(await ansFileInput.arrayBuffer());

      if (!qpBuffer || qpBuffer.length < 10) {
        return NextResponse.json(
          { error: "Question paper file is empty or unreadable." },
          { status: 400 }
        );
      }
      if (!ansBuffer || ansBuffer.length < 10) {
        return NextResponse.json(
          { error: "Answer sheet file is empty or unreadable." },
          { status: 400 }
        );
      }

      const qpMime = qpFileInput.type || "image/png";
      const ansMime = ansFileInput.type || "image/png";

      if (qpMime.includes("pdf") || qpName.toLowerCase().endsWith(".pdf")) {
        qpPages = await pdfBufferToPageImages(qpBuffer);
      } else {
        const b64 = qpBuffer.toString("base64");
        if (!b64 || b64.length < 100) {
          throw new Error("Question paper image buffer is empty.");
        }
        qpPages = [`data:${qpMime};base64,${b64}`];
      }

      if (ansMime.includes("pdf") || ansName.toLowerCase().endsWith(".pdf")) {
        ansPages = await pdfBufferToPageImages(ansBuffer);
      } else {
        const b64 = ansBuffer.toString("base64");
        if (!b64 || b64.length < 100) {
          throw new Error("Answer sheet image buffer is empty.");
        }
        ansPages = [`data:${ansMime};base64,${b64}`];
      }
    }

    const sessionId = `session_${Date.now()}`;
    const session: SessionData = {
      sessionId,
      questionPaperName: qpName,
      questionPaperSize: qpSize,
      questionPaperPageCount: qpPages.length,
      answerSheetName: ansName,
      answerSheetSize: ansSize,
      answerSheetPageCount: ansPages.length,
      questionPaperPages: qpPages,
      answerSheetPages: ansPages,
      questions: [],
      answerSegments: [],
      mappings: {},
      unmatchedSegments: [],
      grades: {},
      status: "uploaded",
      progressStep: 1,
      progressMessage: "Files uploaded. Ready for AI extraction.",
      createdAt: Date.now(),
    };

    saveSession(session);
    return NextResponse.json({ success: true, sessionId, session });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}
