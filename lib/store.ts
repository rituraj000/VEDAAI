import { SessionData } from "./types";
import { getSampleDataset } from "./ai/fallback-data";

// In-memory singleton store for session data
const globalForSessions = global as unknown as {
  sessionStore: Map<string, SessionData>;
};

export const sessionStore =
  globalForSessions.sessionStore || new Map<string, SessionData>();

if (process.env.NODE_ENV !== "production") {
  globalForSessions.sessionStore = sessionStore;
}

export function saveSession(session: SessionData): void {
  sessionStore.set(session.sessionId, session);
}

export function getSession(sessionId: string): SessionData {
  let existing = sessionStore.get(sessionId);
  if (!existing) {
    const sample = getSampleDataset();
    existing = {
      sessionId,
      questionPaperName: "Class_10_Physics_Math_Test.pdf",
      questionPaperSize: "1.8 MB",
      questionPaperPageCount: sample.questionPaperPages.length,
      answerSheetName: "Student_Answer_Sheet_Rahul.pdf",
      answerSheetSize: "2.4 MB",
      answerSheetPageCount: sample.answerSheetPages.length,
      questionPaperPages: sample.questionPaperPages,
      answerSheetPages: sample.answerSheetPages,
      questions: sample.questions,
      answerSegments: sample.answerSegments,
      mappings: sample.mappings,
      unmatchedSegments: sample.unmatchedSegments,
      grades: sample.grades,
      status: "uploaded",
      progressStep: 1,
      progressMessage: "Files uploaded. Ready for AI extraction.",
      createdAt: Date.now(),
    };
    sessionStore.set(sessionId, existing);
  }
  return existing;
}

export function deleteSession(sessionId: string): boolean {
  return sessionStore.delete(sessionId);
}

export function updateSession(
  sessionId: string,
  partial: Partial<SessionData>
): SessionData {
  const existing = getSession(sessionId);
  const updated = { ...existing, ...partial };
  sessionStore.set(sessionId, updated);
  return updated;
}
