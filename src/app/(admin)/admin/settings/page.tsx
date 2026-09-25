"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from 'next/navigation';
import { GeneralSettingsTab } from './_components/GeneralSettingsTab';
import { RegistrationSettingsTab } from './_components/RegistrationSettingsTab';
import { AdminManagementTab } from './_components/AdminManagementTab';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'general_settings';

  const [activeTab, setActiveTab] = useState(currentTab);

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`?tab=${tabId}`);
  };

  const tabs = [
    { id: 'general_settings', label: 'General Settings', icon: 'tune' },
    { id: 'registration', label: 'Registration', icon: 'how_to_reg' },
    { id: 'admin_management', label: 'Admin Management', icon: 'admin_panel_settings' },
    { id: 'id_card', label: 'ID Card (KTA)', icon: 'badge' },
  ];

  // Scroll gliding logic for sidebar
  const [sidebarOffset, setSidebarOffset] = useState(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Find the scroll top from either window or the scrolling container
      let currentScroll = 0;
      if (e.target === document || e.target === window) {
        currentScroll = window.scrollY;
      } else {
        currentScroll = (e.target as HTMLElement).scrollTop || 0;
      }

      // If scrolled past header, glide the sidebar down
      if (currentScroll > 60) {
        // Offset by scroll amount plus a fixed margin to position it neatly
        setSidebarOffset(currentScroll + 60);
      } else {
        setSidebarOffset(0);
      }
    };

    // Use capture phase to ensure we catch scroll events from any scrollable container
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-surface-container-lowest min-h-screen w-full">
      <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6 lg:gap-8 pb-12">

        {/* Page Header */}
        <div>
          <h1 className="font-display-sm text-[36px] font-bold text-on-surface tracking-tight">Platform Settings</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">Manage global configurations, user roles, and system preferences.</p>
        </div>

        {/* Settings Layout Wrapper (Sidebar + Content) */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full">

          {/* Settings Navigation (Vertical Tabs) */}
          <div
            className="lg:w-64 shrink-0 w-full relative z-20 transition-transform duration-700 ease-out"
            style={{ transform: `translateY(${sidebarOffset}px)` }}
          >
            <div className="bg-surface border border-outline-variant/20 rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm shrink-0 lg:w-full text-left transition-colors whitespace-nowrap cursor-pointer",
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

          {/* Settings Content Area */}
          <div className="flex-1 flex flex-col gap-6 lg:gap-8 min-w-0 w-full overflow-hidden">
            {activeTab === 'general_settings' && <GeneralSettingsTab />}
            {activeTab === 'registration' && <RegistrationSettingsTab />}
            {activeTab === 'admin_management' && <AdminManagementTab />}

            {activeTab !== 'general_settings' && activeTab !== 'registration' && activeTab !== 'admin_management' && (
              <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[400px] shadow-sm">
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="material-symbols-outlined text-[48px] text-surface-variant/80">construction</span>
                  <h3 className="text-lg font-semibold text-on-surface">Under Construction</h3>
                  <p className="text-sm text-on-surface-variant">This settings panel is currently being built.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant">Loading Settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
