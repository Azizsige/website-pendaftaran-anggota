"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  { id: 'general_settings', label: 'General Settings', icon: 'tune' },
  { id: 'registration', label: 'Registration', icon: 'how_to_reg' },
  { id: 'admin_management', label: 'Admin Management', icon: 'admin_panel_settings' },
  { id: 'id_card', label: 'ID Card (KTA)', icon: 'badge' },
];

export const SettingsNavigation = ({ activeTab, onTabChange }: SettingsNavigationProps) => {
  return (
    <div className="w-full relative z-20">
      <div className="bg-surface border border-outline-variant/20 rounded-xl p-2 flex flex-row gap-2 overflow-x-auto shadow-sm custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg text-sm shrink-0 transition-colors whitespace-nowrap cursor-pointer",
              activeTab === tab.id
                ? "bg-primary/10 text-primary-container font-semibold"
                : "text-on-surface-variant hover:bg-surface-variant/50 font-medium"
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined text-[20px]",
                activeTab === tab.id && "fill-current"
              )}
              style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
