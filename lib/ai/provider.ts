import { Question, AnswerSegment, Mapping, Grade } from "../types";

export interface AIProvider {
  /**
   * Stage A: Extract questions from question paper page images
   */
  extractQuestions(pageImages: string[]): Promise<Question[]>;

  /**
   * Stage B: Extract handwritten answers and bounding boxes from answer sheet page images
   */
  extractAnswers(pageImages: string[]): Promise<AnswerSegment[]>;

  /**
   * Stage C: Map extracted answers to questions
   */
  mapAnswersToQuestions(
    questions: Question[],
    answerSegments: AnswerSegment[]
  ): Promise<{
    mappings: Record<string, Mapping>;
    unmatchedSegments: AnswerSegment[];
  }>;

  /**
   * Stage D: Grade each question-answer pair and produce feedback
   */
  gradeAnswers(
    questions: Question[],
    mappings: Record<string, Mapping>
  ): Promise<Record<string, Grade>>;
}
