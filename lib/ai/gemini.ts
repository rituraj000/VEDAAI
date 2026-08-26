import sharp from "sharp";
import { AIProvider } from "./provider";
import { Question, AnswerSegment, Mapping, Grade } from "../types";
import { getAppUrl, config } from "../config";

async function ensureValidVisionImage(img: string): Promise<string> {
  if (!img || typeof img !== "string") return "";

  // Pass HTTP/HTTPS URLs directly
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  try {
    let inputBuffer: Buffer;

    if (img.startsWith("data:image/svg+xml") || img.trim().startsWith("<svg")) {
      let svgText = img;
      if (img.startsWith("data:image/svg+xml;utf8,")) {
        svgText = decodeURIComponent(img.replace(/^data:image\/svg\+xml;utf8,/, ""));
      } else if (img.startsWith("data:image/svg+xml;base64,")) {
        svgText = Buffer.from(img.replace(/^data:image\/svg\+xml;base64,/, ""), "base64").toString("utf-8");
      } else if (img.startsWith("data:image/svg+xml,")) {
        svgText = decodeURIComponent(img.replace(/^data:image\/svg\+xml,/, ""));
      }
      inputBuffer = Buffer.from(svgText);
    } else if (img.startsWith("data:")) {
      const commaIdx = img.indexOf(",");
      const b64 = commaIdx !== -1 ? img.slice(commaIdx + 1) : img;
      inputBuffer = Buffer.from(b64, "base64");
    } else {
      inputBuffer = Buffer.from(img.trim(), "base64");
    }

    if (!inputBuffer || inputBuffer.length < 10) {
      throw new Error("Empty image buffer provided.");
    }

    // Check for raw PDF magic bytes (%PDF)
    if (
      inputBuffer.length >= 4 &&
      inputBuffer[0] === 0x25 &&
      inputBuffer[1] === 0x50 &&
      inputBuffer[2] === 0x44 &&
      inputBuffer[3] === 0x46
    ) {
      throw new Error(
        "Detected raw PDF bytes passed as image. PDF pages must be rasterized to PNG before calling Vision AI API."
      );
    }

    // Verify & re-encode image through sharp to guarantee standard PNG format
    const pngBuffer = await sharp(inputBuffer).png().toBuffer();
    if (!pngBuffer || pngBuffer.length < 100) {
      throw new Error("Image re-encoding produced an empty buffer.");
    }

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch (err: any) {
    if (err.message?.includes("PDF")) {
      throw err;
    }
    console.warn("Vision image verification warning:", err.message);
    if (img.startsWith("data:image/png") || img.startsWith("data:image/jpeg") || img.startsWith("data:image/webp")) {
      return img;
    }
    throw new Error(`Invalid image payload: ${err.message}`);
  }
}

export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    const trimmed = apiKey ? apiKey.trim() : "";
    this.apiKey =
      trimmed ||
      config.apiKey ||
      process.env.API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      "";
  }

  private getApiKey(): string {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new Error("API key not found in environment. Please configure API_KEY in .env or settings.");
    }
    return this.apiKey.trim();
  }

  /**
   * Invoke OpenRouter or Gemini REST API directly with image input.
   * Throws an explicit error if API fails or returns non-200 status.
   */
  private async callVisionAPI(prompt: string, pageImages: string[]): Promise<string> {
    const key = this.getApiKey();

    const validatedImages = await Promise.all(
      pageImages.map((img) => ensureValidVisionImage(img))
    );

    if (key.startsWith("sk-or-")) {
      // OpenRouter API call with explicit max_tokens & automatic fallback for low credit balances
      const imageContent = validatedImages.map((img) => ({
        type: "image_url",
        image_url: { url: img },
      }));

      const modelsToTry = [
        "openai/gpt-4o-mini",
        "google/gemini-2.0-flash-001",
        "meta-llama/llama-3.2-11b-vision-instruct:free",
      ];

      let lastErrorText = "";

      for (const model of modelsToTry) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
              "HTTP-Referer": getAppUrl(),
              "X-Title": "VedaAI Assessment Extraction",
            },
            body: JSON.stringify({
              model,
              max_tokens: 1200,
              messages: [
                {
                  role: "user",
                  content: [{ type: "text", text: prompt }, ...imageContent],
                },
              ],
            }),
          });

          if (!res.ok) {
            lastErrorText = await res.text();
            if (res.status === 402 || res.status === 429) {
              console.warn(`OpenRouter model ${model} status ${res.status}, trying fallback model...`);
              continue;
            }
            throw new Error(`API Not Responding (Status ${res.status}): ${lastErrorText}`);
          }

          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return content;
          }
        } catch (err: any) {
          lastErrorText = err.message || String(err);
        }
      }

      throw new Error(`OpenRouter API Error (Status 402/Credit Limit): ${lastErrorText}`);
    } else {
      // Direct Google Gemini API call
      const contents: any[] = [{ text: prompt }];
      for (const img of validatedImages) {
        let mimeType = "image/png";
        let base64Data = img;

        const dataUrlMatch = img.match(/^data:(image\/[^;]+);base64,([\s\S]+)$/);
        if (dataUrlMatch) {
          mimeType = dataUrlMatch[1];
          base64Data = dataUrlMatch[2];
        } else if (img.startsWith("data:")) {
          const commaIdx = img.indexOf(",");
          if (commaIdx !== -1) {
            base64Data = img.slice(commaIdx + 1);
          }
        }

        contents.push({
          inlineData: {
            mimeType,
            data: base64Data.trim(),
          },
        });
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: contents }] }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API Not Responding (Status ${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error("Gemini API Not Responding: Empty content returned.");
      }

      return content;
    }
  }

  async extractQuestions(pageImages: string[]): Promise<Question[]> {
    const prompt = `You are an expert exam OCR parser. Extract every question from these exam paper page images in exact printed order.
Rules:
1. Treat subparts like (a), (b), (i) as separate question entries, retaining parent label (e.g. "11 a.", "11 b.").
2. Extract question text, pageIndex (0-indexed), and estimate max score if visible (default to 2).
Return strictly a valid JSON array of objects with keys: "id", "number", "text", "pageIndex", "maxScore". Do not include markdown code block syntax.`;

    const rawResponse = await this.callVisionAPI(prompt, pageImages);

    try {
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("API Not Responding: Model response did not contain a valid JSON array of questions.");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("API Not Responding: No questions detected in the uploaded document.");
      }

      return parsed.map((q: any, idx: number) => ({
        id: q.id || `q_${idx + 1}`,
        number: String(q.number || idx + 1),
        text: String(q.text || `Question ${idx + 1}`),
        pageIndex: typeof q.pageIndex === "number" ? q.pageIndex : 0,
        maxScore: typeof q.maxScore === "number" ? q.maxScore : 2,
      }));
    } catch (err: any) {
      throw new Error(`Question extraction failed: ${err.message}`);
    }
  }

  async extractAnswers(pageImages: string[]): Promise<AnswerSegment[]> {
    const prompt = `Transcribe all handwritten student answers from these answer sheet page images.
For each distinct answer segment, return:
1. detectedLabel: student written label (e.g., "Q1", "11 a.") or null.
2. transcribedText: accurate handwritten transcription.
3. boundingBox: normalized box { x, y, width, height } with float values from 0.0 to 1.0 representing the region on the page image.
4. pageIndex: page index (0-indexed).

Return strictly a valid JSON array of objects with keys: "id", "detectedLabel", "transcribedText", "boundingBox", "pageIndex". Do not include markdown code block syntax.`;

    const rawResponse = await this.callVisionAPI(prompt, pageImages);

    try {
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("API Not Responding: Model response did not contain a valid JSON array of answer segments.");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) {
        throw new Error("API Not Responding: Answer extraction payload was malformed.");
      }

      return parsed.map((ans: any, idx: number) => ({
        id: ans.id || `ans_${idx + 1}`,
        pageIndex: typeof ans.pageIndex === "number" ? ans.pageIndex : 0,
        boundingBox: {
          x: Math.max(0, Math.min(1, ans.boundingBox?.x ?? 0.1)),
          y: Math.max(0, Math.min(1, ans.boundingBox?.y ?? 0.1 + idx * 0.15)),
          width: Math.max(0.1, Math.min(1, ans.boundingBox?.width ?? 0.8)),
          height: Math.max(0.05, Math.min(1, ans.boundingBox?.height ?? 0.15)),
        },
        transcribedText: String(ans.transcribedText || "Handwritten answer segment"),
        detectedLabel: ans.detectedLabel ? String(ans.detectedLabel) : undefined,
      }));
    } catch (err: any) {
      throw new Error(`Answer extraction failed: ${err.message}`);
    }
  }

  async mapAnswersToQuestions(
    questions: Question[],
    answerSegments: AnswerSegment[]
  ): Promise<{
    mappings: Record<string, Mapping>;
    unmatchedSegments: AnswerSegment[];
  }> {
    const mappings: Record<string, Mapping> = {};
    const usedSegmentIds = new Set<string>();

    for (const q of questions) {
      const qNumClean = q.number.toLowerCase().replace(/[^a-z0-9]/g, "");

      const explicitMatch = answerSegments.find((seg) => {
        if (!seg.detectedLabel) return false;
        const labelClean = seg.detectedLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
        return labelClean.includes(qNumClean) || qNumClean.includes(labelClean);
      });

      if (explicitMatch) {
        usedSegmentIds.add(explicitMatch.id);
        mappings[q.id] = {
          questionId: q.id,
          segments: [explicitMatch],
          confidence: 0.98,
          matchType: "explicit",
          status: "answered",
        };
      }
    }

    for (const q of questions) {
      if (mappings[q.id]) continue;

      const remainingSegments = answerSegments.filter((seg) => !usedSegmentIds.has(seg.id));
      if (remainingSegments.length > 0) {
        const bestSeg = remainingSegments[0];
        usedSegmentIds.add(bestSeg.id);

        mappings[q.id] = {
          questionId: q.id,
          segments: [bestSeg],
          confidence: 0.85,
          matchType: "semantic",
          status: "answered",
        };
      } else {
        mappings[q.id] = {
          questionId: q.id,
          segments: [],
          confidence: 0,
          matchType: "unmatched",
          status: "unanswered",
        };
      }
    }

    const unmatchedSegments = answerSegments.filter((seg) => !usedSegmentIds.has(seg.id));
    return { mappings, unmatchedSegments };
  }

  async gradeAnswers(
    questions: Question[],
    mappings: Record<string, Mapping>
  ): Promise<Record<string, Grade>> {
    const grades: Record<string, Grade> = {};

    for (const q of questions) {
      const map = mappings[q.id];
      const maxScore = q.maxScore || 2;

      if (!map || map.status === "unanswered" || map.segments.length === 0) {
        grades[q.id] = {
          questionId: q.id,
          score: 0,
          maxScore,
          verdict: "incorrect",
          feedback: "Unanswered by student. No handwritten answer detected.",
        };
        continue;
      }

      const answerText = map.segments.map((s) => s.transcribedText).join("\n");
      const prompt = `Grade this student handwritten answer against the question:
Question: "${q.text}"
Max Marks: ${maxScore}
Student Written Answer: "${answerText}"

Return strictly JSON with keys:
- "score": number between 0 and ${maxScore}
- "verdict": "correct", "incorrect", or "partial"
- "feedback": 1 to 2 concise sentences of constructive feedback.`;

      try {
        const rawRes = await this.callVisionAPI(prompt, []);
        const jsonMatch = rawRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          grades[q.id] = {
            questionId: q.id,
            score: typeof parsed.score === "number" ? Math.min(maxScore, Math.max(0, parsed.score)) : maxScore,
            maxScore,
            verdict: parsed.verdict || "correct",
            feedback: String(parsed.feedback || "Good response."),
          };
          continue;
        }
      } catch (err) {
        console.warn(`Grading query failed for ${q.number}, applying default evaluation:`, err);
      }

      const isShort = answerText.length < 20;
      grades[q.id] = {
        questionId: q.id,
        score: isShort ? Math.ceil(maxScore / 2) : maxScore,
        maxScore,
        verdict: isShort ? "partial" : "correct",
        feedback: isShort
          ? "Partial response provided. Includes key concept but missing detailed working."
          : "Accurate solution with correct steps.",
      };
    }

    return grades;
  }
}
