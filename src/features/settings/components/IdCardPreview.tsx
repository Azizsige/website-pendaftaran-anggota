import React from "react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { useGeneralSettingStore } from "@/store/useGeneralSettingStore";
import { IdCard } from "@/components/ui/id-card";

export const IdCardPreview = () => {
  const { formData, frontBgPreview, backBgPreview, signaturePreview } =
    useIdCardSettingStore();
  const { formData: generalData, logoPreview } = useGeneralSettingStore();

  let terms: string[] = [];
  try {
    if (formData.kta_terms) terms = JSON.parse(formData.kta_terms);
  } catch {
    terms = [];
  }

  const sampleMember = {
    name: "Ahmad Rizky Pratama",
    nim: "2026012345",
    faculty: "Teknik",
    major: "Teknik Informatika",
    joinDate: new Date(),
  };

  const config = {
    orgName: formData.kta_org_name || generalData.org_name || "BEM FT UNSRI",
    memberPrefix: formData.kta_member_prefix || "BEM-2026-",
    validityMonths: formData.kta_validity_months || 12,
    frontBgUrl: frontBgPreview || undefined,
    backBgUrl: backBgPreview || undefined,
    signatureUrl: signaturePreview || undefined,
    signatureName: formData.kta_signature_name || "Nama Penanda Tangan",
    logoUrl: logoPreview || undefined,
    terms,
    orgAddress: generalData?.org_address,
    orgEmail: generalData?.org_email,
    orgInstagram: generalData?.org_instagram,
    showMemberId: formData.kta_show_member_id === "true",
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 dark:border-[#3c4d46] dark:bg-[#1a2723]">
      <div>
        <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          Pratinjau KTA Digital
        </h3>
        <p className="text-xs text-[#64748b] dark:text-[#94a89e]">
          Simulasi tampilan kartu anggota aktif dengan data sampel.
        </p>
      </div>
      <IdCard member={sampleMember} config={config} scaled />
    </div>
  );
};
