"use client";

import React, { useState } from "react";
import { Upload, X, FileText, Sparkles, Inbox } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadCardProps {
  onStartMapping: (qpFile: File | null, ansFile: File | null, isSample?: boolean) => void;
}

interface UploadedFileInfo {
  file: File | null;
  name: string;
  size: string;
  pages: number;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onStartMapping }) => {
  const [qpInfo, setQpInfo] = useState<UploadedFileInfo | null>(null);
  const [ansInfo, setAnsInfo] = useState<UploadedFileInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Question Paper Dropzone
  const qpDropzone = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setErrorMsg("File exceeds maximum 10MB limit or is an unsupported format.");
        return;
      }
      setErrorMsg(null);
      const file = acceptedFiles[0];
      if (file) {
        setQpInfo({
          file,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          pages: file.type.includes("pdf") ? 2 : 1,
        });
      }
    },
  });

  // Answer Sheet Dropzone
  const ansDropzone = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setErrorMsg("File exceeds maximum 10MB limit or is an unsupported format.");
        return;
      }
      setErrorMsg(null);
      const file = acceptedFiles[0];
      if (file) {
        setAnsInfo({
          file,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          pages: file.type.includes("pdf") ? 2 : 1,
        });
      }
    },
  });

  const isBothUploaded = Boolean(qpInfo && ansInfo);

  const handleStart = () => {
    if (isBothUploaded) {
      onStartMapping(qpInfo?.file || null, ansInfo?.file || null, false);
    }
  };

  const handleSampleClick = () => {
    setQpInfo({
      file: null,
      name: "Class_10_maths_unit_test.pdf",
      size: "1.8 MB",
      pages: 2,
    });
    setAnsInfo({
      file: null,
      name: "Student_Answer_Sheet_Rahul.pdf",
      size: "2.4 MB",
      pages: 2,
    });
    onStartMapping(null, null, true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg border border-[#E5E5E5] flex flex-col items-center my-2 sm:my-6">
      {/* Title Header with Figma exact peach pill highlight */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2B2B2B] tracking-tight leading-snug sm:leading-tight">
          Upload{" "}
          <span className="bg-[#F4E3D9] text-[#FF5722] px-3 sm:px-4 py-1 rounded-full inline-block shadow-2xs mt-1 sm:mt-0">
            Question Paper & Answer Sheets
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-2 font-medium">
          Upload both files to get started
        </p>
      </div>

      {/* Center Teacher Avatar Illustration */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 my-2 sm:my-3 flex items-center justify-center shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F4E3D9] flex items-center justify-center p-1.5 shadow-xs relative">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#2B2B2B] to-[#404040] text-white flex items-center justify-center overflow-hidden relative border-2 border-white">
            <span className="text-xl sm:text-2xl">👩‍🏫</span>
          </div>

          <span className="absolute top-0 right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5722] border-2 border-white"></span>
          <span className="absolute bottom-1 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF7C55] border-2 border-white"></span>
          <span className="absolute bottom-2 left-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5722] border-2 border-white"></span>
          <span className="absolute top-2 left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF7C55] border-2 border-white"></span>
        </div>
      </div>

      {/* Error alert if size exceeds 10MB */}
      {errorMsg && (
        <div className="w-full mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      {/* Dropzones Side-by-Side (Stacked on Mobile) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-4 sm:my-6">
        {/* Dropzone 1: Question Paper */}
        <div className="flex flex-col">
          {qpInfo ? (
            <div className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#FDBB93] flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4E3D9] text-[#FF5722] flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#2B2B2B] truncate">
                    {qpInfo.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] mt-0.5 font-medium">
                    {qpInfo.size} · {qpInfo.pages} Pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQpInfo(null)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...qpDropzone.getRootProps()}
              className={`p-6 sm:p-8 bg-white rounded-2xl border-2 border-dashed border-[#D5D5D5] transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] sm:min-h-[170px] ${
                qpDropzone.isDragActive
                  ? "border-[#FF5722] bg-orange-50/40 scale-[0.99]"
                  : "hover:border-[#FF5722] hover:bg-gray-50/80"
              }`}
            >
              <input {...qpDropzone.getInputProps()} />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 text-[#2B2B2B] flex items-center justify-center mb-2.5">
                <Inbox className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B6B6B]" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-[#2B2B2B]">
                Upload <span className="text-[#FF5722]">Question Paper</span>
              </p>
              <p className="text-[11px] sm:text-xs text-[#6B6B6B] mt-1 font-medium">
                Max 10MB
              </p>
            </div>
          )}
        </div>

        {/* Dropzone 2: Answer Sheet */}
        <div className="flex flex-col">
          {ansInfo ? (
            <div className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#FDBB93] flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4E3D9] text-[#FF5722] flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#2B2B2B] truncate">
                    {ansInfo.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] mt-0.5 font-medium">
                    {ansInfo.size} · {ansInfo.pages} Pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnsInfo(null)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...ansDropzone.getRootProps()}
              className={`p-6 sm:p-8 bg-white rounded-2xl border-2 border-dashed border-[#D5D5D5] transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] sm:min-h-[170px] ${
                ansDropzone.isDragActive
                  ? "border-[#FF5722] bg-orange-50/40 scale-[0.99]"
                  : "hover:border-[#FF5722] hover:bg-gray-50/80"
              }`}
            >
              <input {...ansDropzone.getInputProps()} />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 text-[#2B2B2B] flex items-center justify-center mb-2.5">
                <Inbox className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B6B6B]" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-[#2B2B2B]">
                Upload <span className="text-[#FF5722]">Answer Sheet</span>
              </p>
              <p className="text-[11px] sm:text-xs text-[#6B6B6B] mt-1 font-medium">
                Max 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Start Mapping Action Section */}
      <div className="w-full flex flex-col items-center space-y-3 sm:space-y-4 pt-2 sm:pt-4">
        <button
          onClick={handleStart}
          disabled={!isBothUploaded}
          className={`w-full sm:w-72 py-3 sm:py-3.5 px-6 sm:px-8 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 ${
            isBothUploaded
              ? "bg-[#2B2B2B] text-white hover:bg-[#303030] cursor-pointer hover:shadow-lg active:scale-98"
              : "bg-[#CCCACA] text-white cursor-not-allowed shadow-none"
          }`}
        >
          <span>Start Mapping</span>
          <span className="text-sm sm:text-lg">→</span>
        </button>

        <p className="text-[11px] sm:text-xs text-[#6B6B6B] font-medium text-center">
          Once both files are uploaded, you&apos;ll be able to map answers with questions
        </p>

        {/* Quick Demo Button */}
        <div className="pt-1 sm:pt-2 w-full sm:w-auto">
          <button
            onClick={handleSampleClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#F4E3D9] text-[#FF5722] text-xs font-bold hover:bg-orange-100 transition border border-[#FDBB93] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow shrink-0" />
            <span className="truncate">Try Sample Exam & Answer Sheet (Instant Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
