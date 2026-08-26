"use client";

import React from "react";
import { ArrowLeft, HelpCircle, Bell, Sparkles, ChevronDown, BookOpen, Menu } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBack, onOpenMobileSidebar }) => {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-[#E5E5E5] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Breadcrumb / Mobile Menu Toggle Left */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 text-[#2B2B2B] hover:bg-gray-100 rounded-lg md:hidden transition cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#2B2B2B] transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#2B2B2B]">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B6B6B]" />
          <span>Exams</span>
        </div>
      </div>

      {/* Header Actions Right */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Help Icon */}
        <button className="p-1.5 sm:p-2 text-[#6B6B6B] hover:text-[#2B2B2B] rounded-full hover:bg-gray-100 transition cursor-pointer">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Notification Bell with Orange Dot */}
        <button className="p-1.5 sm:p-2 text-[#6B6B6B] hover:text-[#2B2B2B] rounded-full hover:bg-gray-100 relative transition cursor-pointer">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-[#FF5722]"></span>
        </button>

        {/* Sparkle Icon */}
        <button className="p-1.5 sm:p-2 text-[#FF5722] hover:bg-orange-50 rounded-full transition cursor-pointer hidden sm:block">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* User Profile Avatar with Halo Ring & Dropdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 pl-2 sm:pl-3 border-l border-gray-200 cursor-pointer group">
          {/* Avatar Ring */}
          <div className="relative p-0.5 rounded-full bg-[#F4E3D9] flex items-center justify-center shadow-xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2B2B2B] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs overflow-hidden">
              <span className="bg-gradient-to-tr from-[#FF5722] to-[#2B2B2B] w-full h-full flex items-center justify-center">
                MR
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <span className="text-xs font-extrabold text-[#2B2B2B] group-hover:text-[#FF5722] transition">
              Madhur Rastogi
            </span>
            <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />
          </div>
        </div>
      </div>
    </header>
  );
};
