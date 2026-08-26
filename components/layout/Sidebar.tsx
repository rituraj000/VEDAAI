"use client";

import React, { useState } from "react";
import {
  Grid,
  Users,
  FileText,
  BookOpen,
  FolderKanban,
  Plus,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = "Exams",
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Home", icon: Grid },
    { label: "My Classroom", icon: Users },
    { label: "Assignments", icon: FileText },
    { label: "Exams", icon: BookOpen, active: true },
    { label: "My Library", icon: FolderKanban },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white border-r border-[#E5E5E5] flex flex-col justify-between h-screen fixed md:sticky top-0 z-50 md:z-30 shrink-0 select-none transition-all duration-300 ${
          isOpenMobile ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Top Branding & AI Toolkit Pill */}
        <div>
          {/* Logo Bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#2B2B2B] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                V
              </div>
              {(!collapsed || isOpenMobile) && (
                <span className="font-extrabold text-xl tracking-tight text-[#2B2B2B]">
                  Veda<span className="text-[#FF5722]">AI</span>
                </span>
              )}
            </div>

            {/* Mobile Close Button */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-[#6B6B6B] hover:text-[#2B2B2B] rounded-lg hover:bg-gray-100 transition md:hidden cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#2B2B2B] rounded-lg hover:bg-gray-100 transition hidden md:block cursor-pointer"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* AI Teacher's Toolkit Pill Button */}
          <div className="px-3 py-4">
            <button
              className={`w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-full bg-[#2B2B2B] text-white text-xs font-bold border-2 border-[#E2704E] hover:bg-[#303030] transition shadow-xs cursor-pointer ${
                collapsed && !isOpenMobile ? "px-0" : ""
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#FF5722]" />
              {(!collapsed || isOpenMobile) && <span>AI Teacher&apos;s Toolkit</span>}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === currentTab || item.active;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (onTabChange) onTabChange(item.label);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title={collapsed && !isOpenMobile ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed && !isOpenMobile ? "justify-center px-0" : "space-x-3 px-4"
                  } py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F0F0F0] text-[#2B2B2B] shadow-2xs"
                      : "text-[#6B6B6B] hover:bg-gray-50 hover:text-[#2B2B2B]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#FF5722]" : "text-[#6B6B6B]"
                    }`}
                  />
                  {(!collapsed || isOpenMobile) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Settings & School Footer */}
        <div className="p-3 border-t border-[#E5E5E5] space-y-3">
          {/* Settings link */}
          <button
            className={`w-full flex items-center ${
              collapsed && !isOpenMobile ? "justify-center px-0" : "space-x-3 px-4"
            } py-2 text-xs font-semibold text-[#6B6B6B] hover:text-[#2B2B2B] transition cursor-pointer`}
          >
            <Settings className="w-4 h-4 text-[#6B6B6B]" />
            {(!collapsed || isOpenMobile) && <span>Settings</span>}
          </button>

          {/* School Footer Card */}
          {!collapsed || isOpenMobile ? (
            <div className="flex items-center space-x-3 p-2.5 bg-[#F6F6F6] rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                DPS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#2B2B2B] truncate">
                  Delhi Public School
                </p>
                <p className="text-[10px] text-[#6B6B6B] truncate font-medium">
                  Bokaro Steel City
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs mx-auto shadow-xs">
              DPS
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
