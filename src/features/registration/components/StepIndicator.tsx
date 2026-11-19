"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  hasStep2?: boolean;
}

export default function StepIndicator({ currentStep, hasStep2 = true }: StepIndicatorProps) {
  const steps = [
    { num: 1, displayNum: 1, label: "Data diri" },
    ...(hasStep2 ? [{ num: 2, displayNum: 2, label: "Dokumen" }] : []),
    { num: 3, displayNum: hasStep2 ? 3 : 2, label: "Konfirmasi" },
  ];

  return (
    <nav aria-label="Tahapan pendaftaran">
      <ol className="flex items-center gap-2 sm:gap-2.5 text-[13px]">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.num}>
              <li
                aria-current={isActive ? "step" : undefined}
                className="flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                {isCompleted ? (
                  <span className="w-6 h-6 rounded-full bg-[#006c49] dark:bg-[#0f7a58] text-white flex items-center justify-center shrink-0">
                    <Check size={13} aria-hidden="true" />
                  </span>
                ) : isActive ? (
                  <span className="w-6 h-6 rounded-full border-[1.5px] border-[#006c49] dark:border-[#34d399] bg-[#e6f4ee] dark:bg-[#0f7a58]/15 text-[#005236] dark:text-[#34d399] font-sans text-[12px] font-bold flex items-center justify-center shrink-0">
                    {step.displayNum}
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full border-[1.5px] border-[#5c6b62] dark:border-[#3b524b] text-[#4b5850] dark:text-[#9fb3ac] font-sans text-[12px] font-bold flex items-center justify-center shrink-0">
                    {step.displayNum}
                  </span>
                )}
                <span
                  className={`font-sans text-[13px] leading-none ${
                    isActive
                      ? "font-semibold text-[#005236] dark:text-[#34d399]"
                      : isCompleted
                      ? "hidden sm:inline font-semibold text-[#005236] dark:text-[#34d399]"
                      : "hidden sm:inline font-medium text-[#4b5850] dark:text-[#9fb3ac]"
                  }`}
                >
                  {step.label}
                </span>
              </li>

              {!isLast && (
                <li
                  aria-hidden="true"
                  className={`w-4 sm:w-5 h-px shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-[#006c49] dark:bg-[#34d399]"
                      : "bg-[#5c6b62]/40 dark:bg-[#3b524b]"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
