"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  hasStep2?: boolean;
}

export default function StepIndicator({ currentStep, hasStep2 = true }: StepIndicatorProps) {
  const steps = [
    { num: 1, displayNum: 1, label: "Data Diri" },
    ...(hasStep2 ? [{ num: 2, displayNum: 2, label: "Dokumen" }] : []),
    { num: 3, displayNum: hasStep2 ? 3 : 2, label: "Konfirmasi" },
  ];

  return (
    <nav aria-label="Tahapan pendaftaran" className="w-full">
      <ol className="flex items-center justify-between gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.num}>
              <li
                aria-current={isActive ? "step" : undefined}
                className="flex items-center gap-2 shrink-0"
              >
                {isCompleted ? (
                  <div className="w-7 h-7 rounded-full bg-[#006c49] dark:bg-[#057a55] text-white flex items-center justify-center shrink-0">
                    <Check size={15} aria-hidden="true" />
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full bg-[#e6f4ee] dark:bg-[#0a3326] border-2 border-[#006c49] dark:border-[#34d399] text-[#005236] dark:text-[#6ee7b7] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {step.displayNum}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#f2f4f6] dark:bg-[#1a2723] border border-[#5c6b62] dark:border-[#768f84] text-[#3c4a42] dark:text-[#a8bab0] font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                    {step.displayNum}
                  </div>
                )}
                <span
                  className={`font-sans text-xs sm:text-[13px] leading-tight font-semibold ${
                    isCompleted || isActive
                      ? "text-[#005236] dark:text-[#6ee7b7]"
                      : "text-[#3c4a42] dark:text-[#cbd6d0]"
                  }`}
                >
                  {step.label}
                </span>
              </li>

              {!isLast && (
                <li
                  aria-hidden="true"
                  className="flex-1 h-[2px] min-w-[16px] sm:min-w-[28px] rounded-full bg-[#d5dcd8] dark:bg-[#3c4d46] overflow-hidden"
                >
                  <div
                    className={`h-full bg-[#006c49] dark:bg-[#34d399] transition-all duration-300 ${
                      isCompleted ? "w-full" : "w-0"
                    }`}
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
