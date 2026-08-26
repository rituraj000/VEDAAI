"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UploadCard } from "@/components/upload/UploadCard";
import { LoadingScreen } from "@/components/extraction/LoadingScreen";
import { MappingWorkspace } from "@/components/mapping/MappingWorkspace";
import { SessionData } from "@/lib/types";

export default function Home() {
  const [viewState, setViewState] = useState<"upload" | "loading" | "mapping" | "error">("upload");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load saved API key from localStorage if available
    const savedKey = localStorage.getItem("vedaai_gemini_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("vedaai_gemini_key", key);
  };

  const handleStartMapping = async (
    qpFile: File | null,
    ansFile: File | null,
    isSample = false
  ) => {
    setViewState("loading");
    setCurrentStep(1);
    setErrorMessage(null);

    try {
      let uploadRes;

      if (isSample || (!qpFile && !ansFile)) {
        // Sample demo mode upload request
        uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sample: true }),
        });
      } else {
        // Real file upload request
        const formData = new FormData();
        if (qpFile) formData.append("questionPaper", qpFile);
        if (ansFile) formData.append("answerSheet", ansFile);

        uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }

      if (!uploadRes.ok) {
        throw new Error("Failed to upload files.");
      }

      const uploadData = await uploadRes.json();
      const newSessionId = uploadData.sessionId;
      setSessionId(newSessionId);

      // Trigger AI Extraction Pipeline
      setCurrentStep(2);

      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSessionId,
          apiKey,
        }),
      });

      if (!extractRes.ok) {
        throw new Error("Failed during AI extraction & mapping phase.");
      }

      const extractData = await extractRes.json();
      if (extractData.data) {
        setSessionData(extractData.data);
        setViewState("mapping");
      } else {
        throw new Error("Received malformed session payload.");
      }
    } catch (err: any) {
      console.error("Pipeline error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setViewState("error");
    }
  };

  const handleBackToUpload = () => {
    setViewState("upload");
    setSessionId(null);
    setSessionData(null);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex bg-[#E2E2E2] font-sans antialiased text-[#2B2B2B]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          onBack={viewState !== "upload" ? handleBackToUpload : undefined}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-auto">
          {viewState === "upload" && (
            <UploadCard onStartMapping={handleStartMapping} />
          )}

          {viewState === "loading" && (
            <LoadingScreen currentStep={currentStep} />
          )}

          {viewState === "mapping" && sessionData && (
            <MappingWorkspace session={sessionData} />
          )}

          {viewState === "error" && (
            <div className="bg-white rounded-3xl p-8 max-w-md mx-auto text-center border border-red-200 shadow-xl animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                !
              </div>
              <h3 className="text-lg font-bold text-[#2B2B2B]">API Not Responding</h3>
              <p className="text-xs text-red-600 mt-2 mb-6 font-mono bg-red-50 p-3 rounded-xl border border-red-100 text-left overflow-auto max-h-36">
                {errorMessage || "The AI API did not respond correctly. Please check your API key or network connection."}
              </p>
              <button
                onClick={handleBackToUpload}
                className="px-6 py-2.5 rounded-full bg-[#2B2B2B] text-white text-xs font-bold hover:bg-[#303030] transition cursor-pointer"
              >
                Back to Upload
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
