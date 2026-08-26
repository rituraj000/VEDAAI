export interface Question {
  id: string;
  number: string; // e.g. "Q1", "11(a)", "11(b)"
  text: string;
  pageIndex: number;
  maxScore?: number;
}

export interface BoundingBox {
  x: number; // normalized 0 to 1
  y: number; // normalized 0 to 1
  width: number; // normalized 0 to 1
  height: number; // normalized 0 to 1
}

export interface AnswerSegment {
  id: string;
  pageIndex: number;
  boundingBox: BoundingBox;
  transcribedText: string;
  detectedLabel?: string;
}

export interface Mapping {
  questionId: string;
  segments: AnswerSegment[];
  confidence: number;
  matchType: "explicit" | "semantic" | "unmatched";
  status: "answered" | "unanswered";
}

export interface Grade {
  questionId: string;
  score: number;
  maxScore: number;
  verdict: "correct" | "incorrect" | "partial";
  feedback: string;
}

export interface SessionData {
  sessionId: string;
  questionPaperName: string;
  questionPaperSize: string;
  questionPaperPageCount: number;
  answerSheetName: string;
  answerSheetSize: string;
  answerSheetPageCount: number;
  questionPaperPages: string[]; // data URLs or images
  answerSheetPages: string[];   // data URLs or images
  questions: Question[];
  answerSegments: AnswerSegment[];
  mappings: Record<string, Mapping>; // questionId -> Mapping
  unmatchedSegments: AnswerSegment[];
  grades: Record<string, Grade>;     // questionId -> Grade
  status: "uploaded" | "extracting" | "mapped" | "graded" | "error";
  progressStep?: number;
  progressMessage?: string;
  errorMessage?: string;
  createdAt: number;
}

export interface ExtractResponse {
  sessionId: string;
  questions: Question[];
  answerSegments: AnswerSegment[];
  mappings: Record<string, Mapping>;
  unmatchedSegments: AnswerSegment[];
  grades: Record<string, Grade>;
}
