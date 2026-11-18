"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  hasStep2?: boolean;
}

export default function StepIndicator({ currentStep, hasStep2 = true }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Data Diri" },
    ...(hasStep2 ? [{ num: 2, label: "Dokumen" }] : []),
    { num: 3, label: "Konfirmasi" },
  ];

  return (
    <div className="flex items-center justify-between relative">
      {/* Background line */}
      <div className="absolute left-0 top-[16px] w-full h-[2px] bg-[#e0e3e5] dark:bg-[#3c4d46] z-0"></div>
      {/* Progress line */}
      <div
        className={`absolute left-0 top-[16px] h-[2px] bg-[#006c49] dark:bg-[#10b981] z-0 transition-all duration-300 ease-in-out ${
          currentStep === 1 ? "w-0" : currentStep === 2 ? "w-1/2" : "w-full"
        }`}
      ></div>

      {steps.map((step) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <div key={step.num} className="relative z-10 flex flex-col items-center gap-[8px]">
            {isCompleted ? (
              <div className="w-8 h-8 rounded-full bg-[#006c49] dark:bg-[#057a55] text-white flex items-center justify-center shadow-sm">
                <Check size={18} />
              </div>
            ) : isActive ? (
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#131d1a] border-2 border-[#006c49] dark:border-[#34d399] flex items-center justify-center relative">
                <div className="w-3 h-3 rounded-full bg-[#006c49] dark:bg-[#34d399]"></div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#e0e3e5] dark:bg-[#1a2723] border border-transparent dark:border-[#4b5c55] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#6c7a71] dark:bg-[#94a89e]"></div>
              </div>
            )}
            <span className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold ${
              isCompleted || isActive ? "text-[#006c49] dark:text-[#34d399]" : "text-[#191c1e] dark:text-[#cbd6d0]"
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
