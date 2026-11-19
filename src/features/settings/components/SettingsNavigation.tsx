"use client";

import React from "react";
import { IdCard, ShieldCheck, SlidersHorizontal, UserCheck } from "lucide-react";

import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { cn } from "@/lib/utils";

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  { id: "general_settings", label: "Pengaturan Umum", icon: SlidersHorizontal },
  { id: "registration", label: "Pendaftaran", icon: UserCheck },
  { id: "admin_management", label: "Manajemen Admin", icon: ShieldCheck },
  { id: "id_card", label: "Kartu Anggota (KTA)", icon: IdCard },
];

export const SettingsNavigation = ({
  activeTab,
  onTabChange,
}: SettingsNavigationProps) => {
  return (
    <nav aria-label="Kategori pengaturan" className="relative z-20 w-full">
      <CustomScrollArea
        axis="x"
        className="rounded-xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a]"
        contentClassName="flex flex-row gap-2 p-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
                isActive
                  ? "bg-[#e6f4ee] font-semibold text-[#005236] dark:bg-[#0c3528] dark:text-[#6ee7b7]"
                  : "font-medium text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723] dark:hover:text-[#eef2f4]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </CustomScrollArea>
    </nav>
  );
};
