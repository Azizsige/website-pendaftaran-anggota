import React from 'react';
import { useIdCardSettingStore } from '@/store/useIdCardSettingStore';
import { useGeneralSettingStore } from '@/store/useGeneralSettingStore';
import { IdCard } from '@/components/ui/id-card';

export const IdCardPreview = () => {
  const { formData, frontBgPreview, backBgPreview, signaturePreview } = useIdCardSettingStore();
  const { formData: generalData, logoPreview } = useGeneralSettingStore();

  let terms: string[] = [];
  try {
    if (formData.kta_terms) terms = JSON.parse(formData.kta_terms);
  } catch (e) {}

  // Data sampel untuk pratinjau tampilan KTA
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
    showMemberId: formData.kta_show_member_id === 'true',
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h3 className="text-base font-semibold text-on-surface">Pratinjau KTA</h3>
      <IdCard member={sampleMember} config={config} scaled />
    </div>
  );
};
