"use client";

import { useState, useEffect, useRef } from "react";
import { preprocessImageForOCR } from "@/lib/image-processing";
import { verifyKtpWithVision } from "@/actions/ocr-vision";
import { logger } from "@/lib/logger";

export type ValidationStatusType =
  | "IDLE"
  | "VALIDATING"
  | "SUCCESS"
  | "FAILED"
  | "BYPASSED";

interface UseOcrValidationProps {
  fotoKTM?: File | null;
  nim: string;
  reqKtm?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  onValidationStatusChange?: (status: ValidationStatusType) => void;
}

export function useOcrValidation({
  fotoKTM,
  nim,
  reqKtm = true,
  onValidationChange,
  onValidationStatusChange,
}: UseOcrValidationProps) {
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatusType>("IDLE");
  const [validationError, setValidationError] = useState<string>("");

  const onValidationStatusChangeRef = useRef(onValidationStatusChange);
  onValidationStatusChangeRef.current = onValidationStatusChange;

  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;

  useEffect(() => {
    onValidationStatusChangeRef.current?.(validationStatus);
  }, [validationStatus]);

  useEffect(() => {
    if (!reqKtm || !fotoKTM) {
      setValidationStatus("SUCCESS");
      onValidationChangeRef.current?.(true);
      return;
    }

    let isMounted = true;

    const validateWithOCR = async () => {
      if (isMounted) {
        setValidationStatus("VALIDATING");
        onValidationChangeRef.current?.(false);
      }

      try {
        const preprocessedImageUrl = await preprocessImageForOCR(fotoKTM);
        const result = await verifyKtpWithVision(preprocessedImageUrl);

        if (!isMounted) return;

        if (!result.success) {
          setValidationStatus("FAILED");
          setValidationError(
            result.error || "Gagal memproses gambar KTM dengan Google Vision API."
          );
          onValidationChangeRef.current?.(false);
          return;
        }

        const rawText = result.text || "";
        const normalizedText = rawText
          .replace(/\s/g, "")
          .replace(/O/gi, "0")
          .replace(/l/g, "1")
          .replace(/I/g, "1")
          .replace(/B/gi, "8")
          .replace(/S/gi, "5")
          .replace(/Z/gi, "2")
          .replace(/G/gi, "6")
          .replace(/A/gi, "4");

        const digitsOnly = normalizedText.replace(/\D/g, "");
        const targetNik = nim;
        const isMatch = digitsOnly.includes(targetNik);

        if (isMatch) {
          setValidationStatus("SUCCESS");
          onValidationChangeRef.current?.(true);
        } else {
          setValidationStatus("FAILED");

          const detectedNumbers = Array.from(
            new Set<string>(normalizedText.match(/\d{5,}/g) ?? [])
          );

          let bestMatch = "";
          let highestScore = -999;

          for (const num of detectedNumbers) {
            let score = 0;
            const lenDiff = Math.abs(num.length - targetNik.length);
            score -= lenDiff;

            const minLen = Math.min(num.length, targetNik.length);
            for (let i = 0; i < minLen; i++) {
              if (num[i] === targetNik[i]) score += 2;
            }

            if (score > highestScore) {
              highestScore = score;
              bestMatch = num;
            }
          }

          const detectedStr = bestMatch || "Tidak ada angka";
          setValidationError(
            `Data NIM tidak cocok dengan foto KTM. (NIM Input: ${targetNik} | Terdeteksi di foto: ${detectedStr}). Mohon periksa kembali inputan Anda atau pastikan foto KTM terlihat jelas.`
          );
          onValidationChangeRef.current?.(false);
        }
      } catch (error) {
        logger.error("OCR Error:", error);
        if (isMounted) {
          setValidationStatus("FAILED");
          setValidationError(
            "Gagal memproses gambar KTM. Pastikan file yang diunggah valid."
          );
          onValidationChangeRef.current?.(false);
        }
      }
    };

    validateWithOCR();

    return () => {
      isMounted = false;
    };
  }, [fotoKTM, nim, reqKtm]);

  useEffect(() => {
    if (validationStatus === "VALIDATING") {
      setTimeout(() => {
        const el = document.getElementById("ktm-loading-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 1500);
    }
  }, [validationStatus]);

  return {
    validationStatus,
    validationError,
  };
}
