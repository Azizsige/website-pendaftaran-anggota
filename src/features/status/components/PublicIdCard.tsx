"use client";

import React, { useEffect, useState } from 'react';
import { getSystemSettings } from '@/actions/setting-actions';
import { IdCard } from '@/components/ui/id-card';
import { SETTING_KEYS } from '@/lib/constants/settings';
import { logger } from '@/lib/logger';

export interface PublicIdCardProps {
  userData: {
    name?: string | null;
    nim?: string;
    faculty?: string | null;
    major?: string | null;
    joinDate?: Date | string | null;
    photoUrl?: string | null;
  };
}

export const PublicIdCard = ({ userData }: PublicIdCardProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generalData, setGeneralData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSystemSettings();
        if (res.success && res.data) {
          const newFormData: Record<string, string> = {};
          const newGeneralData: Record<string, string> = {};
          res.data.forEach((s) => {
            if (s.key.startsWith('kta_')) {
              newFormData[s.key] = s.value;
            } else {
              newGeneralData[s.key] = s.value;
            }
          });
          
          if (!newFormData[SETTING_KEYS.KTA_ORG_NAME]) newFormData[SETTING_KEYS.KTA_ORG_NAME] = 'BEM FT UNSRI';
          if (!newFormData[SETTING_KEYS.KTA_MEMBER_PREFIX]) newFormData[SETTING_KEYS.KTA_MEMBER_PREFIX] = 'BEM-2026-';
          if (!newFormData[SETTING_KEYS.KTA_VALIDITY_MONTHS]) newFormData[SETTING_KEYS.KTA_VALIDITY_MONTHS] = '12';
          
          setFormData(newFormData);
          setGeneralData(newGeneralData);
        }
      } catch (error) {
        logger.error("Failed to load settings in PublicIdCard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-[#3c4a42]">Memuat ID Card...</p>
      </div>
    );
  }

  let terms: string[] = [];
  try {
    if (formData.kta_terms) terms = JSON.parse(formData.kta_terms);
  } catch (e) {}

  const config = {
    orgName: formData.kta_org_name || generalData.org_name || 'BEM FT UNSRI',
    memberPrefix: formData.kta_member_prefix || 'BEM-2026-',
    validityMonths: formData.kta_validity_months || 12,
    frontBgUrl: formData.kta_bg_front_url || undefined,
    backBgUrl: formData.kta_bg_back_url || undefined,
    signatureUrl: formData.kta_signature_url || undefined,
    signatureName: formData.kta_signature_name || 'Nama Penanda Tangan',
    logoUrl: generalData.org_logo || undefined,
    terms,
    orgAddress: generalData.org_address,
    orgEmail: generalData.org_email,
    orgInstagram: generalData.org_instagram,
    showMemberId: formData.kta_show_member_id !== 'false',
  };

  return (
    <IdCard
      member={userData}
      config={config}
      frontId="id-card-element"
      backId="id-card-back-element"
    />
  );
};
