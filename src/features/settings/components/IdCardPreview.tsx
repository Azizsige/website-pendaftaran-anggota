import React, { useState } from "react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { useGeneralSettingStore } from "@/store/useGeneralSettingStore";
import { IdCard } from "@/components/ui/id-card";

type PreviewSide = "both" | "front" | "back";

export const IdCardPreview = () => {
  const { formData, frontBgPreview, backBgPreview, signaturePreview } =
    useIdCardSettingStore();
  const { formData: generalData, logoPreview } = useGeneralSettingStore();
  const [viewSide, setViewSide] = useState<PreviewSide>("both");
  const [printMode, setPrintMode] = useState(false);

  let terms: string[] = [];
  try {
    if (formData.kta_terms) terms = JSON.parse(formData.kta_terms);
  } catch {
    terms = [];
  }

  const sampleMember = {
    name: "Ahmad Rizky Pratama",
    nim: "2026012345",
    faculty: "Ilmu Komputer",
    major: "Teknik Informatika",
    batchYear: "2024",
    status: "ACTIVE",
    joinDate: new Date(),
    verificationUrl: "/verifikasi?nim=2026012345",
  };

  const config = {
    orgName: formData.kta_org_name || generalData.org_name || "Organisasi Mahasiswa",
    orgSubtitle: formData.kta_org_subtitle || undefined,
    periodLabel: formData.kta_period_label || undefined,
    memberPrefix: formData.kta_member_prefix,
    validityMonths: formData.kta_validity_months || 12,
    frontBgUrl: frontBgPreview || undefined,
    backBgUrl: backBgPreview || undefined,
    signatureUrl: signaturePreview || undefined,
    signatureName: formData.kta_signature_name,
    signatureTitle: formData.kta_signature_title || undefined,
    logoUrl: logoPreview || generalData.org_logo || undefined,
    terms,
    orgAddress: generalData?.org_address,
    orgEmail: generalData?.org_email,
    orgInstagram: generalData?.org_instagram,
    showPhoto: formData.kta_show_photo === "true",
    showName: formData.kta_show_name === "true",
    showNim: formData.kta_show_nim === "true",
    showMemberId: formData.kta_show_member_id === "true",
    showFaculty: formData.kta_show_faculty === "true",
    showMajor: formData.kta_show_major === "true",
    showValidity: formData.kta_show_validity === "true",
    showQr: formData.kta_show_qr === "true",
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 dark:border-[#3c4d46] dark:bg-[#1a2723]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
            Pratinjau Real-Time KTA
          </h3>
          <p className="text-xs text-[#475569] dark:text-[#94a89e]">
            Ukuran cetak CR80 (54 x 85,6 mm) siap lanyard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPrintMode((prev) => !prev)}
          aria-pressed={printMode}
          className={`min-h-[36px] cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] ${
            printMode
              ? "border-[#006c49] bg-[#e6f4ee] text-[#005236] dark:border-[#34d399] dark:bg-[#0c3528] dark:text-[#6ee7b7]"
              : "border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#f1f5f9] dark:border-[#5f736b] dark:bg-[#131d1a] dark:text-[#cbd6d0] dark:hover:bg-[#22322d]"
          }`}
        >
          {printMode ? "Mode Cetak (Full-Bleed)" : "Mode Preview Layar"}
        </button>
      </div>

      <div
        role="group"
        aria-label="Pilih sisi kartu pratinjau"
        className="grid grid-cols-3 gap-1 rounded-lg border border-[#e2e8f0] bg-white p-1 dark:border-[#3c4d46] dark:bg-[#131d1a]"
      >
        {(
          [
            { id: "both", label: "Keduanya" },
            { id: "front", label: "Sisi Depan" },
            { id: "back", label: "Sisi Belakang" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewSide(tab.id)}
            aria-pressed={viewSide === tab.id}
            className={`min-h-[36px] cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] ${
              viewSide === tab.id
                ? "bg-[#006c49] text-white dark:bg-[#057a55]"
                : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <IdCard
        member={sampleMember}
        config={config}
        scaled
        printMode={printMode}
        viewSide={viewSide}
        className="justify-center"
      />
    </div>
  );
};
