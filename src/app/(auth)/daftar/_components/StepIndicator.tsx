"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const STEPS = [
  { num: 1, label: "Data Diri" },
  { num: 2, label: "Dokumen" },
  { num: 3, label: "Konfirmasi" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progressWidth = currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%";

  return (
    <div className="flex items-center justify-between relative">
      {/* Background line */}
      <div className="absolute left-0 top-[16px] w-full h-[2px] bg-[#e0e3e5] z-0"></div>
      {/* Progress line */}
      <div
        className="absolute left-0 top-[16px] h-[2px] bg-[#006c49] z-0 transition-all duration-500 ease-in-out"
        style={{ width: progressWidth }}
      ></div>

      {STEPS.map((step) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <div key={step.num} className="relative z-10 flex flex-col items-center gap-[8px]">
            {isCompleted ? (
              <div className="w-8 h-8 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-sm">
                <Check size={18} />
              </div>
            ) : isActive ? (
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#006c49] flex items-center justify-center relative">
                <div className="w-3 h-3 rounded-full bg-[#006c49] animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#006c49] animate-ping opacity-20"></div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#e0e3e5] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#6c7a71]"></div>
              </div>
            )}
            <span className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold ${
              isCompleted || isActive ? "text-[#006c49]" : "text-[#191c1e]"
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
