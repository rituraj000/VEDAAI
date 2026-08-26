"use client";

import React from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface LoadingScreenProps {
  currentStep?: number;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  currentStep = 2,
  message = "Extracting questions & handwritten answers...",
}) => {
  const steps = [
    { step: 1, label: "Uploading files" },
    { step: 2, label: "Extracting questions from question paper" },
    { step: 3, label: "Extracting handwritten answers & bounding boxes" },
    { step: 4, label: "Mapping student answers to questions" },
    { step: 5, label: "Generating AI scores & feedback" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-10 shadow-xl border border-[#E5E5E5] text-center my-12 animate-fade-in">
      {/* Animated Sparkle Icon */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#F4E3D9] animate-ping opacity-30"></div>
        <div className="w-20 h-20 rounded-full bg-[#F4E3D9] flex items-center justify-center text-[#FF5722] shadow-inner">
          <Sparkles className="w-10 h-10 animate-bounce" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[#2B2B2B]">Extracting...</h2>
      <p className="text-sm text-[#6B6B6B] mt-1 font-medium">
        This may take a while depending on file complexity.
      </p>

      {/* Progress Steps List */}
      <div className="mt-8 space-y-3 text-left bg-[#F6F6F6] p-5 rounded-2xl border border-gray-200">
        {steps.map((item) => {
          const isDone = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <div
              key={item.step}
              className="flex items-center space-x-3 transition-all"
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-[#FF5722] animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
              )}
              <span
                className={`text-xs font-semibold ${
                  isDone
                    ? "text-[#2B2B2B]"
                    : isCurrent
                    ? "text-[#FF5722] font-bold"
                    : "text-[#6B6B6B]"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6B6B6B] mt-6 italic">
        Powered by Gemini 2.0 Flash Vision Multimodal Model
      </p>
    </div>
  );
};
