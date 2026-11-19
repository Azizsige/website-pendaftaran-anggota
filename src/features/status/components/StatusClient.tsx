"use client";

import { useEffect, useRef } from "react";
import { useCekStatusStore } from "../store";
import { PublicIdCard } from "./PublicIdCard";
import { SearchForm } from "./SearchForm";
import { StatusResult } from "./StatusResult";
import { LoadingOverlay } from "./LoadingOverlay";

export function StatusClient() {
  const { statusData, isLoading, setStatusData } = useCekStatusStore();
  const searchCardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return () => {
      useCekStatusStore.getState().setStatusData(null);
    };
  }, []);

  useEffect(() => {
    if (!isLoading || statusData || !searchCardRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollTimer = window.setTimeout(() => {
      searchCardRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 60);

    return () => window.clearTimeout(scrollTimer);
  }, [isLoading, statusData]);

  const handleCekDataLain = () => {
    const { reset } = useCekStatusStore.getState();
    reset();
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }, 100);
  };

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#f7f9fb] dark:bg-[#0c1311] text-[#191c1e] dark:text-[#e9f1ee] flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        {!statusData ? (
          <section
            ref={searchCardRef}
            className="scroll-mt-20 w-full max-w-[540px] bg-white dark:bg-[#121c19] rounded-[16px] shadow-sm border border-[#5c6b62]/25 dark:border-[#2a3b36] p-6 sm:p-7"
          >
            <div className="text-center mb-6">
              <h1 className="font-display text-[20px] sm:text-[22px] font-bold text-[#191c1e] dark:text-[#e9f1ee] tracking-tight">
                Cek status pendaftaran
              </h1>
              <p className="text-[#3c4a42] dark:text-[#9fb3ac] text-[13px] mt-1">
                Masukkan NIM dan email pendaftaran untuk melihat status serta mengunduh KTA Anda.
              </p>
            </div>

            <SearchForm />
          </section>
        ) : (
          <StatusResult
            onBack={() => setStatusData(null)}
            onReset={handleCekDataLain}
          />
        )}
      </div>

      {/* Hidden print-ready full-bleed container for PNG HD & CR80 PDF generation */}
      {statusData && (statusData.status === "APPROVED" || statusData.status === "ACTIVE") && (
        <div className="absolute -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
          <PublicIdCard
            userData={statusData}
            printMode
            frontId="id-card-print-front"
            backId="id-card-print-back"
          />
        </div>
      )}

      <LoadingOverlay />
    </div>
  );
}
