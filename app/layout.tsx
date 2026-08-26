import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Extraction & Answer Mapping",
  description: "Extract exam questions, map student handwritten answers, highlight matching bounding boxes, and grade automatically with Gemini AI.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[#E2E2E2] font-sans text-[#2B2B2B] flex flex-col selection:bg-[#FF5722] selection:text-white">
        {children}
      </body>
    </html>
  );
}
