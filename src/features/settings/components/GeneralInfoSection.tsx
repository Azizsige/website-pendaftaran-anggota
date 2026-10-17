import React from 'react';
import { useGeneralSettingStore } from '@/store/useGeneralSettingStore';

export const GeneralInfoSection = () => {
  const { formData, emailError, handleChange } = useGeneralSettingStore();
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.name, e.target.value);

  const inputClass = "w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="flex flex-col gap-2 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Organization Name</label>
        <input name="org_name" value={formData.org_name} onChange={onChange} className={inputClass} type="text" placeholder="Nama Organisasi / BEM"/>
      </div>
      
      <div className="flex flex-col gap-2 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Official Email</label>
        <input name="org_email" value={formData.org_email} onChange={onChange} 
               className={`${inputClass} ${emailError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`} 
               type="email" placeholder="email@kampus.ac.id"/>
        {emailError && <span className="text-xs text-red-500 font-medium">{emailError}</span>}
      </div>

      <div className="flex flex-col gap-2 md:col-span-2 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Description / About</label>
        <textarea name="org_description" value={formData.org_description} onChange={onChange} className={`${inputClass} resize-none`} rows={3} placeholder="Deskripsi singkat..."></textarea>
      </div>

      <div className="flex flex-col gap-2 md:col-span-2 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Alamat Sekretariat</label>
        <textarea name="org_address" value={formData.org_address} onChange={onChange} className={`${inputClass} resize-none`} rows={2} placeholder="Contoh: Gedung Rektorat..."></textarea>
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <label className="text-sm font-semibold text-on-surface">No. WhatsApp (Contact Person)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">+62</span>
          <input name="org_whatsapp" value={formData.org_whatsapp} onChange={onChange} className={`${inputClass} pl-12`} type="tel" placeholder="812-3456-7890" maxLength={15}/>
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <label className="text-sm font-semibold text-on-surface">Link Instagram</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">@</span>
          <input name="org_instagram" value={formData.org_instagram} onChange={onChange} className={`${inputClass} pl-10`} type="text" placeholder="bem_xyz"/>
        </div>
      </div>
    </div>
  );
};
