import React from "react";

import { useGeneralSettingStore } from "@/store/useGeneralSettingStore";
import { FormField, TextField, TextareaField, fieldClass } from "@/components/ui/form-field";

export const GeneralInfoSection = () => {
  const { formData, emailError, handleChange } = useGeneralSettingStore();
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    handleChange(e.target.name, e.target.value);

  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
      <TextField
        id="org_name"
        name="org_name"
        label="Nama Organisasi"
        value={formData.org_name}
        onChange={onChange}
        placeholder="Contoh: BEM Fakultas Ilmu Komputer"
      />

      <TextField
        id="org_email"
        name="org_email"
        type="email"
        label="Email Resmi"
        value={formData.org_email}
        onChange={onChange}
        error={emailError || undefined}
        placeholder="sekretariat@organisasi.ac.id"
      />

      <TextareaField
        id="org_description"
        name="org_description"
        label="Deskripsi Organisasi"
        value={formData.org_description}
        onChange={onChange}
        rows={3}
        placeholder="Ringkasan visi, peran, atau tujuan organisasi..."
        wrapperClassName="md:col-span-2"
      />

      <TextareaField
        id="org_address"
        name="org_address"
        label="Alamat Sekretariat"
        value={formData.org_address}
        onChange={onChange}
        rows={2}
        placeholder="Contoh: Gedung Student Center Lt. 2, Kampus Utama"
        wrapperClassName="md:col-span-2"
      />

      <FormField label="Nomor WhatsApp (Narahubung)" htmlFor="org_whatsapp">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#475569] dark:text-[#94a89e]">
            +62
          </span>
          <input
            id="org_whatsapp"
            name="org_whatsapp"
            value={formData.org_whatsapp}
            onChange={onChange}
            className={fieldClass(false, "pl-12 tabular-nums")}
            type="tel"
            placeholder="812-3456-7890"
            maxLength={15}
          />
        </div>
      </FormField>

      <FormField label="Akun Instagram" htmlFor="org_instagram">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#475569] dark:text-[#94a89e]">
            @
          </span>
          <input
            id="org_instagram"
            name="org_instagram"
            value={formData.org_instagram}
            onChange={onChange}
            className={fieldClass(false, "pl-9")}
            type="text"
            placeholder="bem_fasilkom"
          />
        </div>
      </FormField>
    </div>
  );
};
