"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Question,
  AnswerSegment,
  Mapping,
  Grade,
  SessionData,
} from "@/lib/types";
import { generateFigmaAnswerSheetSVG } from "@/lib/ai/fallback-data";
import {
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck2,
  AlertCircle,
  Eye,
  ArrowRight,
} from "lucide-react";

interface MappingWorkspaceProps {
  session: SessionData;
}

export const MappingWorkspace: React.FC<MappingWorkspaceProps> = ({
  session,
}) => {
  const {
    questions,
    answerSheetPages,
    mappings,
    grades,
    unmatchedSegments,
  } = session;

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    questions[1]?.id || questions[0]?.id || ""
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<string>(
    questions[1]?.id || questions[0]?.id || ""
  );
  const [isExpandAll, setIsExpandAll] = useState<boolean>(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [mobileTab, setMobileTab] = useState<"questions" | "answers">("questions");

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const activeOverlayRef = useRef<HTMLDivElement>(null);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);
  const selectedMapping = mappings[selectedQuestionId];
  const selectedGrade = grades[selectedQuestionId];
  const selectedSegments = selectedMapping?.segments || [];

  useEffect(() => {
    if (selectedSegments.length > 0) {
      const segPage = selectedSegments[0].pageIndex;
      setActivePageIndex(segPage);

      setTimeout(() => {
        if (activeOverlayRef.current && viewerContainerRef.current) {
          activeOverlayRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 150);
    }
  }, [selectedQuestionId]);

  const handleSelectQuestion = (qId: string, isMobileAction = false) => {
    setSelectedQuestionId(qId);
    setExpandedQuestionId((prev) => (prev === qId && !isExpandAll ? "" : qId));
    if (isMobileAction) {
      setMobileTab("answers");
    }
  };

  const toggleExpandAll = () => {
    setIsExpandAll(!isExpandAll);
  };

  const pageCount = (answerSheetPages && answerSheetPages.length > 0) ? answerSheetPages.length : 1;
  const rawImage =
    (answerSheetPages && answerSheetPages[activePageIndex]) ||
    (answerSheetPages && answerSheetPages[0]);

  let isBlankPlaceholder = !rawImage || typeof rawImage !== "string" || rawImage.length < 50;

  if (!isBlankPlaceholder && (rawImage.includes("svg") || rawImage.startsWith("data:"))) {
    try {
      let decodedSvg = rawImage;
      if (rawImage.includes(";base64,")) {
        const b64 = rawImage.split(";base64,")[1];
        if (typeof window !== "undefined" && typeof window.atob === "function") {
          const binStr = window.atob(b64);
          const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
          decodedSvg = new TextDecoder().decode(bytes);
        } else if (typeof Buffer !== "undefined") {
          decodedSvg = Buffer.from(b64, "base64").toString("utf-8");
        }
      } else if (rawImage.includes(";utf8,")) {
        decodedSvg = decodeURIComponent(rawImage.split(";utf8,")[1]);
      }

      const textMatches = decodedSvg.match(/<text[\s\S]*?<\/text>/gi) || [];
      if (textMatches.length < 2 || decodedSvg.includes("Uploaded Document Sheet")) {
        isBlankPlaceholder = true;
      }
    } catch (e) {
      isBlankPlaceholder = true;
    }
  }

  const currentAnswerImage = isBlankPlaceholder
    ? generateFigmaAnswerSheetSVG(activePageIndex + 1)
    : rawImage;

  const totalScore = Object.values(grades).reduce((acc, g) => acc + (g.score || 0), 0);
  const maxPossibleScore = questions.reduce((acc, q) => acc + (q.maxScore || 2), 0);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-[#E2E2E2] overflow-hidden">
      {/* Top Header Summary Bar */}
      <div className="bg-white border-b border-[#E5E5E5] px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs z-10 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-hidden">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#6B6B6B] uppercase tracking-wider truncate">
              Assessment Mapping
            </span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#F4E3D9] text-[#FF5722] font-extrabold shrink-0">
              {questions.length} Qs
            </span>
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#6B6B6B]">Total Score:</span>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#91D381]/20 text-[#2E7D32] border border-[#91D381]">
              {totalScore} / {maxPossibleScore} Marks
            </span>
          </div>
        </div>

        {/* Figma Phone Segmented Control Tab Toggle */}
        <div className="flex md:hidden bg-[#2B2B2B] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setMobileTab("questions")}
            className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${mobileTab === "questions"
                ? "bg-white text-[#2B2B2B] shadow-2xs"
                : "text-gray-300 hover:text-white"
              }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setMobileTab("answers")}
            className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${mobileTab === "answers"
                ? "bg-[#FF5722] text-white shadow-2xs"
                : "text-gray-300 hover:text-white"
              }`}
          >
            Answer Sheet
          </button>
        </div>
      </div>

      {/* Main Split Screen / Tabbed Area */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-3 sm:gap-4">
        {/* LEFT PANEL: Extracted Questions List */}
        <div
          className={`w-full md:w-[420px] lg:w-[480px] bg-white rounded-2xl border border-[#E5E5E5] flex flex-col shadow-sm shrink-0 overflow-hidden ${mobileTab === "answers" ? "hidden md:flex" : "flex"
            }`}
        >
          {/* Header matching Figma */}
          <div className="p-3.5 sm:p-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-[11px] sm:text-xs font-extrabold text-[#2B2B2B] uppercase tracking-wider">
              Extracted Questions (from question paper)
            </h2>
            <button
              onClick={toggleExpandAll}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white border border-[#E5E5E5] text-[#2B2B2B] text-[10px] sm:text-[11px] font-bold rounded-full hover:bg-gray-50 transition shadow-2xs cursor-pointer"
            >
              {isExpandAll ? "Collapse All" : "Expand All"}
            </button>
          </div>

          {/* Scrollable Questions List */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 sm:space-y-3">
            {questions.map((q) => {
              const isSelected = q.id === selectedQuestionId;
              const isExpanded = isExpandAll || q.id === expandedQuestionId;
              const mapping = mappings[q.id];
              const grade = grades[q.id];
              const isUnanswered = mapping?.status === "unanswered";

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q.id)}
                  className={`rounded-2xl transition-all duration-200 cursor-pointer border p-3.5 sm:p-4 bg-white shadow-2xs ${isSelected
                      ? "border-2 border-[#FDBB93] bg-orange-50/15 ring-2 ring-[#FF5722]/10"
                      : "border-[#E5E5E5] hover:border-gray-300"
                    }`}
                >
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-2.5">
                      {/* Figma Number Circle Badge */}
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-extrabold text-[11px] sm:text-xs shrink-0 transition mt-0.5 ${isSelected
                            ? "bg-[#FF7C55] text-white shadow-xs"
                            : "bg-[#2B2B2B] text-white"
                          }`}
                      >
                        {q.number}
                      </div>

                      {/* Question Text */}
                      <p className="text-xs font-bold text-[#2B2B2B] leading-snug">
                        {q.text}
                      </p>
                    </div>

                    {/* Figma Score Pill */}
                    <div className="shrink-0">
                      {isUnanswered ? (
                        <span className="px-2 sm:px-3 py-0.5 rounded-full bg-gray-100 text-[#6B6B6B] text-[10px] sm:text-[11px] font-bold border border-gray-200">
                          0/{q.maxScore || 2}
                        </span>
                      ) : grade ? (
                        <span
                          className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border ${grade.verdict === "correct"
                              ? "bg-[#91D381] text-[#2E7D32] border-[#91D381]"
                              : grade.verdict === "partial"
                                ? "bg-[#F4CBBF] text-[#D9534F] border-[#F4CBBF]"
                                : "bg-[#F4CBBF] text-[#D9534F] border-[#F4CBBF]"
                            }`}
                        >
                          {grade.score}/{grade.maxScore}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Mobile Quick Action Pill */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectQuestion(q.id, true);
                      }}
                      className="text-[#FF5722] font-extrabold flex items-center gap-1 hover:underline md:hidden"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Answer on Sheet</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedQuestionId(expandedQuestionId === q.id ? "" : q.id);
                      }}
                      className="text-gray-400 hover:text-[#2B2B2B] ml-auto inline-block"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded View: AI Feedback Section */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100 animate-fade-in space-y-2.5">
                      {grade && (
                        <div className="p-3 bg-[#F6F6F6] rounded-xl border border-[#FDBB93] text-xs">
                          <p className="font-extrabold text-[#2B2B2B] mb-1 text-[11px]">
                            AI Feedback
                          </p>
                          <p className="text-[#303030] leading-relaxed font-medium text-[11px] sm:text-xs">
                            {grade.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unmatched Segments Notice */}
            {unmatchedSegments && unmatchedSegments.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Unmatched Answer Segments ({unmatchedSegments.length})</p>
                  <p className="text-[11px] mt-0.5">
                    Found handwritten content that could not be mapped to any printed question.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Answer Sheet Document Viewer with Bounding Box Overlay */}
        <div
          className={`flex-1 bg-white rounded-2xl border border-[#E5E5E5] flex flex-col shadow-sm overflow-hidden ${mobileTab === "questions" ? "hidden md:flex" : "flex"
            }`}
        >
          {/* Controls Toolbar matching Figma */}
          <div className="p-2.5 sm:p-3 bg-[#2B2B2B] text-white flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-[#FF5722]" />
              <span className="font-bold">Answer Sheet</span>
              {selectedQuestion && (
                <span className="px-2 py-0.5 bg-[#FF5722] text-white rounded-md font-extrabold text-[10px] hidden sm:inline-block">
                  Active: Q{selectedQuestion.number}
                </span>
              )}
            </div>

            {/* Zoom & Page controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 bg-[#303030] px-2 py-1 rounded-xl border border-gray-700 text-[11px] sm:text-xs">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="hover:text-[#FF5722] px-1 font-bold"
                >
                  -
                </button>
                <span className="font-bold min-w-[32px] sm:min-w-[36px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                  className="hover:text-[#FF5722] px-1 font-bold"
                >
                  +
                </button>
              </div>

              <div className="flex items-center space-x-1 bg-[#303030] px-2 py-1 rounded-xl border border-gray-700 text-[11px] sm:text-xs">
                <button
                  onClick={() =>
                    setActivePageIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={activePageIndex === 0}
                  className="disabled:opacity-30 hover:text-[#FF5722] px-1 font-bold"
                >
                  ‹
                </button>
                <span className="font-bold px-1">
                  {activePageIndex + 1}/{pageCount}
                </span>
                <button
                  onClick={() =>
                    setActivePageIndex((prev) =>
                      Math.min(pageCount - 1, prev + 1)
                    )
                  }
                  disabled={activePageIndex === pageCount - 1}
                  className="disabled:opacity-30 hover:text-[#FF5722] px-1 font-bold"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Document Viewer & Bounding Box Overlay Canvas */}
          <div
            ref={viewerContainerRef}
            className="flex-1 overflow-auto bg-[#E2E2E2] p-2 sm:p-6 flex justify-center items-start relative select-none"
          >
            <div
              className="relative bg-white shadow-xl rounded-lg transition-transform duration-200"
              style={{
                width: `${zoomLevel * 7.5}px`,
                maxWidth: "100%",
              }}
            >
              {/* Answer Sheet Page Image */}
              <img
                src={currentAnswerImage}
                alt={`Answer Sheet Page ${activePageIndex + 1}`}
                className="w-full h-auto min-h-[600px] sm:min-h-[800px] block rounded-lg pointer-events-none bg-white object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = generateFigmaAnswerSheetSVG(activePageIndex + 1);
                }}
              />

              {/* Bounding Box Overlays with Figma attached top-left badge tag */}
              {selectedQuestion &&
                selectedSegments
                  .filter((seg) => seg.pageIndex === activePageIndex)
                  .map((seg) => {
                    const box = seg.boundingBox;
                    return (
                      <div
                        key={seg.id}
                        ref={activeOverlayRef}
                        className="absolute border-2 border-[#91D381] bg-[#91D381]/15 rounded-xl shadow-lg transition-all duration-300 pointer-events-none z-10"
                        style={{
                          left: `${box.x * 100}%`,
                          top: `${box.y * 100}%`,
                          width: `${box.width * 100}%`,
                          height: `${box.height * 100}%`,
                        }}
                      >
                        {/* Figma Attached Badge Tag anchored to Top-Left of Box */}
                        <div className="absolute -top-3 -left-3 bg-[#91D381] text-[#2E7D32] font-black px-2 py-0.5 rounded-lg text-xs shadow-md border border-[#2E7D32]/20 flex items-center space-x-1">
                          <span>Q{selectedQuestion.number}</span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
