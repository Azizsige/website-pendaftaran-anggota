"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GeneralSettingsTab } from './_components/GeneralSettingsTab';
import { RegistrationSettingsTab } from './_components/RegistrationSettingsTab';
import { AdminManagementTab } from './_components/AdminManagementTab';
import { IdCardSettingsTab } from './_components/IdCardSettingsTab';
import { SettingsNavigation } from './_components/SettingsNavigation';

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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-surface-container-lowest min-h-screen w-full">
      <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6 lg:gap-8 pb-12">
        <div>
          <h1 className="font-display-sm text-[36px] font-bold text-on-surface tracking-tight">Platform Settings</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">Manage global configurations, user roles, and system preferences.</p>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8 w-full">
          <SettingsNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex-1 flex flex-col gap-6 lg:gap-8 min-w-0 w-full overflow-hidden">
            {activeTab === 'general_settings' && <GeneralSettingsTab />}
            {activeTab === 'registration' && <RegistrationSettingsTab />}
            {activeTab === 'admin_management' && <AdminManagementTab />}
            {activeTab === 'id_card' && <IdCardSettingsTab />}

            {!['general_settings', 'registration', 'admin_management', 'id_card'].includes(activeTab) && (
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
