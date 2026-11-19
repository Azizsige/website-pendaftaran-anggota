"use client";

import React, { useEffect, useState } from "react";
import { getSystemSettings } from "@/actions/setting-actions";
import { IdCard } from "@/components/ui/id-card";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";

export interface PublicIdCardProps {
  userData: {
    name?: string | null;
    nim?: string;
    faculty?: string | null;
    major?: string | null;
    batchYear?: string | null;
    status?: string | null;
    joinDate?: Date | string | null;
    photoUrl?: string | null;
    verificationCode?: string | null;
  };
  frontId?: string;
  backId?: string;
  scaled?: boolean;
  printMode?: boolean;
  viewSide?: "both" | "front" | "back";
  className?: string;
}

export const PublicIdCard = ({
  userData,
  frontId = "id-card-element",
  backId = "id-card-back-element",
  scaled = false,
  printMode = false,
  viewSide = "both",
  className = "",
}: PublicIdCardProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generalData, setGeneralData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await getSystemSettings();
        if (active && res.success && res.data) {
          const newFormData: Record<string, string> = {};
          const newGeneralData: Record<string, string> = {};
          res.data.forEach((s) => {
            if (s.key.startsWith("kta_")) {
              newFormData[s.key] = s.value;
            } else {
              newGeneralData[s.key] = s.value;
            }
          });

          if (!(SETTING_KEYS.KTA_ORG_NAME in newFormData)) {
            newFormData[SETTING_KEYS.KTA_ORG_NAME] =
              newGeneralData[SETTING_KEYS.ORG_NAME] || "Organisasi Mahasiswa";
          }
          if (!(SETTING_KEYS.KTA_MEMBER_PREFIX in newFormData)) {
            newFormData[SETTING_KEYS.KTA_MEMBER_PREFIX] = "BEM-2026-";
          }
          if (!(SETTING_KEYS.KTA_VALIDITY_MONTHS in newFormData)) {
            newFormData[SETTING_KEYS.KTA_VALIDITY_MONTHS] = "12";
          }

          setFormData(newFormData);
          setGeneralData(newGeneralData);
        }
      } catch (error) {
        logger.error("Failed to load settings in PublicIdCard:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-[#006c49] dark:border-[#34d399] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-[#3c4a42] dark:text-[#cbd6d0]">
          Memuat ID Card...
        </p>
      </div>
    );
  }

  let terms: string[] = [];
  try {
    if (formData.kta_terms) terms = JSON.parse(formData.kta_terms);
  } catch {
    terms = [];
  }

  const parseBoolSetting = (key: string, defaultValue = true): boolean =>
    key in formData ? formData[key] === "true" : defaultValue;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verificationUrl =
    userData.nim && userData.verificationCode
      ? `${origin}/verifikasi?nim=${encodeURIComponent(userData.nim)}&code=${encodeURIComponent(
          userData.verificationCode
        )}`
      : undefined;

  const config = {
    orgName:
      formData[SETTING_KEYS.KTA_ORG_NAME] ||
      generalData[SETTING_KEYS.ORG_NAME] ||
      "Organisasi Mahasiswa",
    orgSubtitle: formData[SETTING_KEYS.KTA_ORG_SUBTITLE] || undefined,
    periodLabel: formData[SETTING_KEYS.KTA_PERIOD_LABEL] || undefined,
    memberPrefix: formData[SETTING_KEYS.KTA_MEMBER_PREFIX] ?? "BEM-2026-",
    validityMonths: formData[SETTING_KEYS.KTA_VALIDITY_MONTHS] || 12,
    frontBgUrl: formData[SETTING_KEYS.KTA_BG_FRONT_URL] || undefined,
    backBgUrl: formData[SETTING_KEYS.KTA_BG_BACK_URL] || undefined,
    signatureUrl: formData[SETTING_KEYS.KTA_SIGNATURE_URL] || undefined,
    signatureName: formData[SETTING_KEYS.KTA_SIGNATURE_NAME] || "Nama Penanda Tangan",
    signatureTitle: formData[SETTING_KEYS.KTA_SIGNATURE_TITLE] || undefined,
    logoUrl: generalData[SETTING_KEYS.ORG_LOGO] || undefined,
    terms,
    orgAddress: generalData[SETTING_KEYS.ORG_ADDRESS],
    orgEmail: generalData[SETTING_KEYS.ORG_EMAIL],
    orgInstagram: generalData[SETTING_KEYS.ORG_INSTAGRAM],
    showPhoto: parseBoolSetting(SETTING_KEYS.KTA_SHOW_PHOTO, true),
    showName: parseBoolSetting(SETTING_KEYS.KTA_SHOW_NAME, true),
    showNim: parseBoolSetting(SETTING_KEYS.KTA_SHOW_NIM, true),
    showMemberId: parseBoolSetting(SETTING_KEYS.KTA_SHOW_MEMBER_ID, true),
    showFaculty: parseBoolSetting(SETTING_KEYS.KTA_SHOW_FACULTY, true),
    showMajor: parseBoolSetting(SETTING_KEYS.KTA_SHOW_MAJOR, true),
    showValidity: parseBoolSetting(SETTING_KEYS.KTA_SHOW_VALIDITY, true),
    showQr: parseBoolSetting(SETTING_KEYS.KTA_SHOW_QR, true),
  };

  return (
    <IdCard
      member={{ ...userData, verificationUrl }}
      config={config}
      frontId={frontId}
      backId={backId}
      scaled={scaled}
      printMode={printMode}
      viewSide={viewSide}
      className={className}
    />
  );
};
