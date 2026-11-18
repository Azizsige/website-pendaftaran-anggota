import React from "react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { CheckboxField } from "@/components/ui/form-field";

export const IdCardFieldsSection = () => {
  const { formData, handleCheckboxChange } = useIdCardSettingStore();

  const fields = [
    { key: "kta_show_photo", label: "Foto Anggota", desc: "Menampilkan pas foto resmi anggota" },
    { key: "kta_show_name", label: "Nama Lengkap", desc: "Menampilkan nama lengkap anggota" },
    { key: "kta_show_nim", label: "NIM", desc: "Menampilkan Nomor Induk Mahasiswa" },
    {
      key: "kta_show_member_id",
      label: "Nomor Anggota",
      desc: "Menampilkan ID anggota dengan prefix organisasi",
    },
    { key: "kta_show_faculty", label: "Fakultas", desc: "Menampilkan asal fakultas anggota" },
    { key: "kta_show_major", label: "Program Studi", desc: "Menampilkan nama jurusan atau prodi" },
    {
      key: "kta_show_validity",
      label: "Masa Berlaku",
      desc: "Menampilkan tanggal masa berlaku KTA",
    },
    { key: "kta_show_qr", label: "QR Code Verifikasi", desc: "Menampilkan QR Code validasi kartu" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          Komponen Tampilan Kartu
        </h3>
        <p className="mt-0.5 text-sm text-[#475569] dark:text-[#cbd6d0]">
          Pilih elemen informasi yang akan ditampilkan pada sisi depan Kartu Tanda Anggota.
        </p>
      </div>

      <div className="mt-1 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <CheckboxField
            key={field.key}
            id={`field-${field.key}`}
            checked={formData[field.key as keyof typeof formData] === "true"}
            onChange={(checked) => handleCheckboxChange(field.key, checked)}
            label={field.label}
            description={field.desc}
          />
        ))}
      </div>
    </div>
  );
};
