import { Question, AnswerSegment, Mapping, Grade } from "../types";

export function generateFigmaAnswerSheetSVG(pageNum: number): string {
  const width = 800;
  const height = 1100;

  const bg = `<rect width="100%" height="100%" fill="#FCFAF8"/>
    <line x1="70" y1="0" x2="70" y2="${height}" stroke="#F4CBBF" stroke-width="2" opacity="0.6"/>`;

  let svgContent = "";
  if (pageNum === 1) {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        ${bg}
        <text x="90" y="55" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="16" fill="#4B5563">Name: Rahul Kumar         Roll No: 10482</text>
        <text x="90" y="80" font-family="'Comic Sans MS', cursive, sans-serif" font-size="13" fill="#6B7280">Testing note: Answers are intentionally arranged out of order.</text>

        {/* Q3 Section - y: ~110px */}
        <g transform="translate(90, 130)">
          <text x="0" y="0" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="16" fill="#1F2937">Q3</text>
          <text x="0" y="24" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">The instruction cycle is the sequence of operations performed by the CPU to execute an instruction.</text>
          <text x="0" y="46" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">The main stages are <tspan font-weight="bold">Fetch</tspan>, <tspan font-weight="bold">Decode</tspan>, <tspan font-weight="bold">Execute</tspan>, <tspan font-weight="bold">Memory access</tspan> and <tspan font-weight="bold">Write-back</tspan>.</text>
        </g>

        {/* Q6 Section - y: ~308px */}
        <g transform="translate(90, 325)">
          <text x="0" y="0" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="16" fill="#1F2937">Q6</text>
          <text x="0" y="24" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">Instructions = 100, CPI = 2, clock rate = 1 GHz.</text>
          <text x="0" y="46" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">CPU cycles = 100 * 2 = 200 cycles.</text>
          <text x="0" y="68" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">Execution time = 200 / (1 * 10^9) = <tspan font-weight="bold" fill="#059669">200 ns</tspan>.</text>
        </g>

        {/* Q1 Section - y: ~506px */}
        <g transform="translate(90, 520)">
          <text x="0" y="0" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="16" fill="#1F2937">Q1</text>
          <text x="0" y="24" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">RISC uses a smaller and simpler instruction set. CISC uses a larger and more complex instruction</text>
          <text x="0" y="46" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">set. RISC emphasizes simple instructions and efficient pipelining, while CISC provides more powerful</text>
          <text x="0" y="68" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">instructions.</text>
        </g>

        {/* Q8 (b) Section - y: ~704px */}
        <g transform="translate(90, 720)">
          <text x="0" y="0" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="16" fill="#1F2937">Q8 (b)</text>
          <text x="0" y="24" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">The Control Unit controls and coordinates CPU operations. It fetches and decodes instructions and</text>
          <text x="0" y="46" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">generates control signals for registers, ALU, memory and other components.</text>
        </g>

        {/* Q5 Section - y: ~902px */}
        <g transform="translate(90, 915)">
          <text x="0" y="0" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="16" fill="#1F2937">Q5</text>
          <text x="0" y="24" font-family="'Comic Sans MS', cursive, sans-serif" font-size="14" fill="#374151">Clock frequency = 2 GHz. Clock cycle time = 1 / (2 * 10^9) seconds = <tspan font-weight="bold" fill="#059669">0.5 ns</tspan>.</text>
        </g>
      </svg>
    `;
  } else {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        ${bg}
        <g transform="translate(90, 60)">
          <text x="0" y="30" font-family="'Comic Sans MS', sans-serif" font-weight="bold" font-size="16" fill="#2B2B2B">Page 2 — Student Answers (Continued)</text>
          <text x="0" y="70" font-family="'Comic Sans MS', sans-serif" font-size="14" fill="#303030">Q5) Alveoli diagram: Thin one-cell thick walls surrounded by blood capillaries.</text>
          <text x="0" y="120" font-family="'Comic Sans MS', sans-serif" font-size="14" fill="#303030">Q6) Digestive system: Most absorption occurs in the small intestine (ileum).</text>
          <text x="0" y="170" font-family="'Comic Sans MS', sans-serif" font-size="14" fill="#303030">11 a.) Plant A has green leaves due to chlorophyll. Plant B lacks light so etiolated.</text>
          <text x="0" y="220" font-family="'Comic Sans MS', sans-serif" font-size="14" fill="#303030">11 b.) Move Plant B into indirect sunlight and water moderately.</text>
        </g>
      </svg>
    `;
  }

  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
}

export function getSampleDataset() {
  const questions: Question[] = [
    {
      id: "q1",
      number: "1",
      text: "Which blood vessel carries blood away from the heart?",
      pageIndex: 0,
      maxScore: 2,
    },
    {
      id: "q2",
      number: "2",
      text: "Which of the following organelles is primarily involved in photosynthesis?",
      pageIndex: 0,
      maxScore: 2,
    },
    {
      id: "q3",
      number: "3",
      text: "Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.",
      pageIndex: 0,
      maxScore: 2,
    },
    {
      id: "q4",
      number: "4",
      text: "Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta, include the names of valves crossed.",
      pageIndex: 0,
      maxScore: 2,
    },
    {
      id: "q5",
      number: "5",
      text: "Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).",
      pageIndex: 1,
      maxScore: 2,
    },
    {
      id: "q6",
      number: "6",
      text: "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.",
      pageIndex: 1,
      maxScore: 5,
    },
    {
      id: "q7",
      number: "7",
      text: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
      pageIndex: 1,
      maxScore: 5,
    },
    {
      id: "q8",
      number: "8",
      text: "Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.",
      pageIndex: 1,
      maxScore: 5,
    },
    {
      id: "q9",
      number: "9",
      text: "Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.",
      pageIndex: 1,
      maxScore: 5,
    },
    {
      id: "q10",
      number: "10",
      text: "Explain how the structure of xylem vessels facilitates water transport in plants (mention one structural feature and its role).",
      pageIndex: 1,
      maxScore: 5,
    },
    {
      id: "q11a",
      number: "11 a.",
      text: "A diagram shows two potted plants — Plant A in bright light with broad green leaves; Plant B left in dark room with pale, elongated leaves.",
      pageIndex: 1,
      maxScore: 2,
    },
    {
      id: "q11b",
      number: "11 b.",
      text: "Suggest one practical measure to help Plant B recover.",
      pageIndex: 1,
      maxScore: 3,
    },
    {
      id: "q12",
      number: "12",
      text: "A resting person has a tidal volume (air per breath) of 0.5 L and breathes 12 times per minute. Show working.",
      pageIndex: 1,
      maxScore: 5,
    },
    {
      id: "q13",
      number: "13",
      text: "If dead space is 0.15 L per breath, calculate the alveolar ventilation per minute. Show working.",
      pageIndex: 1,
      maxScore: 5,
    },
  ];

  const answerSegments: AnswerSegment[] = [
    {
      id: "ans_q1",
      pageIndex: 0,
      boundingBox: { x: 0.1, y: 0.03, width: 0.8, height: 0.04 },
      transcribedText: "Q1. Arteries carry oxygenated blood away from the heart.",
      detectedLabel: "1",
    },
    {
      id: "ans_q2",
      pageIndex: 0,
      boundingBox: { x: 0.1, y: 0.38, width: 0.8, height: 0.15 },
      transcribedText: "The process mainly occurs in the chloroplast of the plant cell. It has two main stages: 1. Light reaction - Captures light energy. 2. Dark reaction - Uses energy to make glucose.",
      detectedLabel: "2",
    },
    {
      id: "ans_q3",
      pageIndex: 0,
      boundingBox: { x: 0.1, y: 0.54, width: 0.8, height: 0.12 },
      transcribedText: "Q3. Chloroplasts contain chlorophyll pigment which absorbs solar light energy. Stage 1: Photolysis. Stage 2: Carbon fixation.",
      detectedLabel: "3",
    },
    {
      id: "ans_q5",
      pageIndex: 1,
      boundingBox: { x: 0.1, y: 0.05, width: 0.8, height: 0.08 },
      transcribedText: "Q5) Alveoli diagram: Thin one-cell thick walls surrounded by capillaries.",
      detectedLabel: "5",
    },
    {
      id: "ans_q6",
      pageIndex: 1,
      boundingBox: { x: 0.1, y: 0.14, width: 0.8, height: 0.08 },
      transcribedText: "Q6) Digestive system: Most absorption occurs in the small intestine (ileum).",
      detectedLabel: "6",
    },
    {
      id: "ans_q11a",
      pageIndex: 1,
      boundingBox: { x: 0.1, y: 0.23, width: 0.8, height: 0.08 },
      transcribedText: "11 a.) Plant A has green leaves due to chlorophyll. Plant B lacks light so etiolated.",
      detectedLabel: "11 a.",
    },
    {
      id: "ans_q11b",
      pageIndex: 1,
      boundingBox: { x: 0.1, y: 0.32, width: 0.8, height: 0.08 },
      transcribedText: "11 b.) Move Plant B into indirect sunlight and water moderately.",
      detectedLabel: "11 b.",
    },
  ];

  const mappings: Record<string, Mapping> = {
    q1: { questionId: "q1", segments: [answerSegments[0]], confidence: 0.98, matchType: "explicit", status: "answered" },
    q2: { questionId: "q2", segments: [answerSegments[1]], confidence: 0.99, matchType: "explicit", status: "answered" },
    q3: { questionId: "q3", segments: [answerSegments[2]], confidence: 0.97, matchType: "explicit", status: "answered" },
    q4: { questionId: "q4", segments: [], confidence: 0, matchType: "unmatched", status: "unanswered" },
    q5: { questionId: "q5", segments: [answerSegments[3]], confidence: 0.95, matchType: "explicit", status: "answered" },
    q6: { questionId: "q6", segments: [answerSegments[4]], confidence: 0.94, matchType: "explicit", status: "answered" },
    q7: { questionId: "q7", segments: [], confidence: 0.95, matchType: "explicit", status: "answered" },
    q8: { questionId: "q8", segments: [], confidence: 0.90, matchType: "semantic", status: "answered" },
    q9: { questionId: "q9", segments: [], confidence: 0.98, matchType: "explicit", status: "answered" },
    q10: { questionId: "q10", segments: [], confidence: 0.92, matchType: "explicit", status: "answered" },
    q11a: { questionId: "q11a", segments: [answerSegments[5]], confidence: 0.98, matchType: "explicit", status: "answered" },
    q11b: { questionId: "q11b", segments: [answerSegments[6]], confidence: 0.96, matchType: "explicit", status: "answered" },
    q12: { questionId: "q12", segments: [], confidence: 0.92, matchType: "explicit", status: "answered" },
    q13: { questionId: "q13", segments: [], confidence: 0.94, matchType: "explicit", status: "answered" },
  };

  const grades: Record<string, Grade> = {
    q1: { questionId: "q1", score: 2, maxScore: 2, verdict: "correct", feedback: "Accurate! Arteries carry oxygenated blood away from the heart." },
    q2: {
      questionId: "q2",
      score: 2,
      maxScore: 2,
      verdict: "correct",
      feedback: "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!",
    },
    q3: { questionId: "q3", score: 2, maxScore: 2, verdict: "correct", feedback: "Well stated explanation of light absorption and stages of photosynthesis." },
    q4: { questionId: "q4", score: 0, maxScore: 2, verdict: "incorrect", feedback: "Unanswered by student. No written response detected on answer sheet." },
    q5: { questionId: "q5", score: 2, maxScore: 2, verdict: "correct", feedback: "Clear diagram of alveolar sac and capillary gas exchange." },
    q6: { questionId: "q6", score: 4, maxScore: 5, verdict: "partial", feedback: "Good diagram of digestive system, but missed labeling pancreas explicitly." },
    q7: { questionId: "q7", score: 5, maxScore: 5, verdict: "correct", feedback: "Flawless nephron diagram with all tubule segments labeled." },
    q8: { questionId: "q8", score: 3, maxScore: 5, verdict: "partial", feedback: "Correctly differentiated palisade vs spongy mesophyll structure." },
    q9: { questionId: "q9", score: 5, maxScore: 5, verdict: "correct", feedback: "Accurate description of transpiration stream and environmental factors." },
    q10: { questionId: "q10", score: 4, maxScore: 5, verdict: "partial", feedback: "Identified lignified walls facilitating capillary water conduction." },
    q11a: { questionId: "q11a", score: 2, maxScore: 2, verdict: "correct", feedback: "Correct interpretation of etiolated Plant B in dark room." },
    q11b: { questionId: "q11b", score: 1, maxScore: 3, verdict: "partial", feedback: "Suggested moving to light, but missed detailing light intensity acclimation." },
    q12: { questionId: "q12", score: 4, maxScore: 5, verdict: "correct", feedback: "Correct calculation: Total Ventilation = 0.5 L × 12 = 6.0 L/min." },
    q13: { questionId: "q13", score: 4, maxScore: 5, verdict: "correct", feedback: "Correct working: Alveolar Ventilation = (0.5 - 0.15) × 12 = 4.2 L/min." },
  };

  const page1 = generateFigmaAnswerSheetSVG(1);
  const page2 = generateFigmaAnswerSheetSVG(2);

  return {
    questions,
    answerSegments,
    mappings,
    unmatchedSegments: [],
    grades,
    questionPaperPages: [page1, page2],
    answerSheetPages: [page1, page2],
  };
}
