"use client";

import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { FormData, Errors } from "./types";
import { useOcrValidation, type ValidationStatusType } from "./useOcrValidation";
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
}

export default function StepKonfirmasi({
  formData,
  errors,
  updateField,
  onValidationChange,
  onValidationStatusChange,
  reqKtm = true,
  reqFoto = true,
}: StepKonfirmasiProps) {
  const { validationStatus, validationError } = useOcrValidation({
    fotoKTM: formData.fotoKTM,
    nim: formData.nim,
    reqKtm,
    onValidationChange,
    onValidationStatusChange,
  });

  const isAgreementDisabled =
    validationStatus !== "SUCCESS" && validationStatus !== "BYPASSED";

  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      <div className="text-center mb-[24px]">
        <h2 className="font-sans text-[24px] md:text-[32px] md:leading-[40px] font-semibold text-[#191c1e] mb-[8px]">
          Konfirmasi Pendaftaran
        </h2>
        <p className="font-sans text-[16px] leading-[24px] text-[#3c4a42]">
          Silakan periksa kembali data Anda sebelum mengirimkan pendaftaran.
        </p>
      </div>

      {/* Confirmation Summary Sections */}
      <ConfirmationSummary
        formData={formData}
        reqKtm={reqKtm}
        reqFoto={reqFoto}
        validationStatus={validationStatus}
        validationError={validationError}
      />

      {/* Agreement Section */}
      <div className="flex items-start gap-[8px] mb-[16px]">
        <div className="pt-[2px]">
          <input
            type="checkbox"
            id="agreement"
            disabled={isAgreementDisabled}
            checked={formData.persetujuan}
            onChange={(e) => updateField("persetujuan", e.target.checked)}
            className="w-5 h-5 rounded border-[#bbcabf] text-[#006c49] focus:ring-[#006c49] focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <label
          htmlFor="agreement"
          className={`font-sans text-[14px] leading-[20px] select-none ${
            isAgreementDisabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-[#3c4a42] cursor-pointer"
          }`}
        >
          Saya menyatakan bahwa semua data yang saya masukkan adalah benar dan
          dapat dipertanggungjawabkan.
        </label>
      </div>
      {errors.persetujuan && (
        <p className="text-[14px] text-[#ba1a1a] mb-[16px]">
          {errors.persetujuan}
        </p>
      )}

      {/* Turnstile Section */}
      <div className="w-full flex justify-center mt-[24px]">
        <Turnstile
          siteKey={
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
            "1x00000000000000000000AA"
          }
          onSuccess={(token) => updateField("turnstileToken", token)}
        />
      </div>
      {errors.turnstileToken && (
        <p className="text-[14px] text-[#ba1a1a] mt-[4px] text-center">
          {errors.turnstileToken}
        </p>
      )}
    </div>
  );
}
