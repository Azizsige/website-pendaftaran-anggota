"use client";

import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTheme } from "@/components/providers/ThemeProvider";
import { FormData, Errors } from "../types";
import { useOcrValidation, type ValidationStatusType } from "../hooks/useOcrValidation";
import { ConfirmationSummary } from "./ConfirmationSummary";

interface StepKonfirmasiProps {
  formData: FormData;
  errors: Errors;
  updateField: (
    field: keyof FormData,
    value: string | File | null | boolean
  ) => void;
  onValidationChange?: (isValid: boolean) => void;
  onValidationStatusChange?: (status: ValidationStatusType) => void;
  reqKtm?: boolean;
  reqFoto?: boolean;
  hideHeader?: boolean;
  isInline?: boolean;
}

export default function StepKonfirmasi({
  formData,
  errors,
  updateField,
  onValidationChange,
  onValidationStatusChange,
  reqKtm = true,
  reqFoto = true,
  hideHeader = false,
  isInline = false,
}: StepKonfirmasiProps) {
  const { validationStatus, validationError } = useOcrValidation({
    fotoKTM: formData.fotoKTM,
    nim: formData.nim,
    reqKtm,
    onValidationChange,
    onValidationStatusChange,
  });

  const { resolvedTheme } = useTheme();
  const isAgreementDisabled =
    validationStatus !== "SUCCESS" && validationStatus !== "BYPASSED";

  const agreementAndTurnstile = (
    <div className="bg-[#f7f9fb] dark:bg-[#1a2723] rounded-xl border border-[#5c6b62]/25 dark:border-[#3c4d46] p-3.5 sm:p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <div className="pt-0.5">
          <input
            type="checkbox"
            id="agreement"
            disabled={isAgreementDisabled}
            checked={formData.persetujuan}
            onChange={(e) => updateField("persetujuan", e.target.checked)}
            className="w-5 h-5 rounded border-[#5c6b62] dark:border-[#768f84] text-[#006c49] dark:text-[#057a55] accent-[#006c49] dark:accent-[#10b981] focus:ring-[#006c49] dark:focus:ring-[#34d399] focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#131d1a] transition-colors cursor-pointer bg-white dark:bg-[#1a2723] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <label
          htmlFor="agreement"
          className={`font-sans text-[13px] leading-[19px] select-none ${
            isAgreementDisabled
              ? "text-[#4b5850]/70 dark:text-[#a8bab0]/60 cursor-not-allowed"
              : "text-[#191c1e] dark:text-[#eef2f4] cursor-pointer"
          }`}
        >
          Saya menyatakan bahwa seluruh data yang saya masukkan adalah benar dan
          dapat dipertanggungjawabkan.
        </label>
      </div>
      {errors.persetujuan && (
        <p className="text-[12px] text-[#ba1a1a] dark:text-[#fca5a5]">
          {errors.persetujuan}
        </p>
      )}

      {!isInline && (
        <>
          <div className="w-full flex justify-center overflow-x-auto pt-1">
            <Turnstile
              key={resolvedTheme}
              siteKey={
                process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                "1x00000000000000000000AA"
              }
              options={{ theme: resolvedTheme, size: "flexible" }}
              onSuccess={(token) => updateField("turnstileToken", token)}
            />
          </div>
          {errors.turnstileToken && (
            <p className="text-[12px] text-[#ba1a1a] dark:text-[#fca5a5] text-center">
              {errors.turnstileToken}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      {!hideHeader && (
        <div className="text-center mb-4">
          <h2 className="font-sans text-xl md:text-2xl font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-1">
            Konfirmasi Pendaftaran
          </h2>
          <p className="font-sans text-[13px] leading-[19px] text-[#3c4a42] dark:text-[#cbd6d0]">
            Silakan periksa kembali data Anda sebelum mengirimkan pendaftaran.
          </p>
        </div>
      )}

      <ConfirmationSummary
        formData={formData}
        reqKtm={reqKtm}
        reqFoto={reqFoto}
        validationStatus={validationStatus}
        validationError={validationError}
        isInline={isInline}
        rightPanelFooter={agreementAndTurnstile}
      />
    </div>
  );
}
