import React from 'react';
import { useIdCardSettingStore } from '@/store/useIdCardSettingStore';

export const IdCardIdentitySection = () => {
  const { formData, handleChange } = useIdCardSettingStore();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-on-surface">Card Identity</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Nama Organisasi */}
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Nama Organisasi</label>
          <input 
            type="text" 
            value={formData.kta_org_name}
            onChange={(e) => handleChange('kta_org_name', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/50"
            placeholder="Contoh: BEM FT UNSRI"
          />
        </div>

        {/* Prefix Nomor Anggota */}
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Prefix Nomor Anggota</label>
          <input 
            type="text" 
            value={formData.kta_member_prefix}
            onChange={(e) => handleChange('kta_member_prefix', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/50"
            placeholder="Contoh: BEM-2026-"
          />
        </div>

        {/* Masa Berlaku */}
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Masa Berlaku KTA</label>
          <select 
            value={formData.kta_validity_months}
            onChange={(e) => handleChange('kta_validity_months', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="6">6 Bulan</option>
            <option value="12">1 Tahun</option>
            <option value="24">2 Tahun</option>
            <option value="36">3 Tahun</option>
            <option value="48">4 Tahun</option>
          </select>
        </div>
      </div>
    </div>
  );
};
