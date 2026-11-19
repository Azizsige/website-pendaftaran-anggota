import React from "react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { FormField, TextField } from "@/components/ui/form-field";
import { Dropdown } from "@/components/ui/dropdown";

const VALIDITY_OPTIONS = [
  { label: "6 Bulan", value: "6" },
  { label: "1 Tahun", value: "12" },
  { label: "2 Tahun", value: "24" },
  { label: "3 Tahun", value: "36" },
  { label: "4 Tahun", value: "48" },
];

export const IdCardIdentitySection = () => {
  const { formData, handleChange } = useIdCardSettingStore();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          Identitas Kartu
        </h3>
        <p className="mt-0.5 text-sm text-[#475569] dark:text-[#cbd6d0]">
          Atur judul organisasi, periode kepengurusan, format nomor anggota, dan masa berlaku KTA.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
        <TextField
          id="kta-org-name"
          label="Nama Organisasi di KTA"
          value={formData.kta_org_name}
          onChange={(e) => handleChange("kta_org_name", e.target.value)}
          placeholder="Contoh: BEM Fakultas Ilmu Komputer"
        />

        <TextField
          id="kta-org-subtitle"
          label="Subjudul / Nama Kampus (Opsional)"
          value={formData.kta_org_subtitle}
          onChange={(e) => handleChange("kta_org_subtitle", e.target.value)}
          placeholder="Contoh: Universitas Indonesia"
          hint="Ditampilkan ringkas di atas nama organisasi dan sisi belakang kartu."
        />

        <TextField
          id="kta-period-label"
          label="Periode Kepengurusan"
          value={formData.kta_period_label}
          onChange={(e) => handleChange("kta_period_label", e.target.value)}
          placeholder="Contoh: 2026/2027"
          className="font-mono"
        />

        <TextField
          id="kta-member-prefix"
          label="Prefix Nomor Anggota"
          value={formData.kta_member_prefix}
          onChange={(e) => handleChange("kta_member_prefix", e.target.value)}
          placeholder="Contoh: BEM-2026-"
          className="font-mono"
        />

        <FormField label="Masa Berlaku KTA" htmlFor="kta-validity-months">
          <Dropdown
            id="kta-validity-months"
            options={VALIDITY_OPTIONS}
            value={formData.kta_validity_months}
            onChange={(val) => handleChange("kta_validity_months", val)}
            placeholder="Pilih masa berlaku"
          />
        </FormField>
      </div>
    </div>
  );
};
