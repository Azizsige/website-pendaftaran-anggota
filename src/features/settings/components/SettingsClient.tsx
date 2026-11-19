"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Wrench } from "lucide-react";

import { SettingsNavigation } from "./SettingsNavigation";

const TabLoadingFallback = () => (
  <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8 dark:border-[#3c4d46] dark:bg-[#131d1a]">
    <div className="flex flex-col items-center gap-2.5">
      <Loader2 className="h-7 w-7 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
      <p className="text-sm font-medium text-[#475569] dark:text-[#cbd6d0]">
        Memuat panel pengaturan...
      </p>
    </div>
  </div>
);

const GeneralSettingsTab = dynamic(
  () => import("./GeneralSettingsTab").then((m) => m.GeneralSettingsTab),
  { loading: TabLoadingFallback }
);
const RegistrationSettingsTab = dynamic(
  () => import("./RegistrationSettingsTab").then((m) => m.RegistrationSettingsTab),
  { loading: TabLoadingFallback }
);
const AdminManagementTab = dynamic(
  () => import("./AdminManagementTab").then((m) => m.AdminManagementTab),
  { loading: TabLoadingFallback }
);
const IdCardSettingsTab = dynamic(
  () => import("./IdCardSettingsTab").then((m) => m.IdCardSettingsTab),
  { loading: TabLoadingFallback }
);

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "general_settings";

  const [activeTab, setActiveTab] = useState(currentTab);
  const [prevTab, setPrevTab] = useState(currentTab);

  if (prevTab !== currentTab) {
    setPrevTab(currentTab);
    setActiveTab(currentTab);
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`?tab=${tabId}`);
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-[#f4f6f8] p-4 sm:p-6 lg:p-8 dark:bg-[#0d1412]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 pb-12">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl dark:text-[#eef2f4]">
            Pengaturan Portal
          </h1>
          <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
            Kelola profil organisasi, konfigurasi pendaftaran anggota, hak akses administrator, dan desain Kartu Tanda Anggota (KTA).
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <SettingsNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-6 overflow-x-clip">
            {activeTab === "general_settings" && <GeneralSettingsTab />}
            {activeTab === "registration" && <RegistrationSettingsTab />}
            {activeTab === "admin_management" && <AdminManagementTab />}
            {activeTab === "id_card" && <IdCardSettingsTab />}

            {!["general_settings", "registration", "admin_management", "id_card"].includes(
              activeTab
            ) && (
              <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-8 dark:border-[#3c4d46] dark:bg-[#131d1a]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
                    <Wrench className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    Panel Belum Tersedia
                  </h3>
                  <p className="text-sm text-[#475569] dark:text-[#cbd6d0]">
                    Silakan pilih salah satu tab pengaturan di atas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center gap-2 p-8 text-sm text-[#475569] dark:text-[#cbd6d0]">
          <Loader2 className="h-5 w-5 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
          <span>Memuat pengaturan...</span>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
