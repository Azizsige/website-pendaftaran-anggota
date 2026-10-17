import React from 'react';
import { useIdCardSettingStore } from '@/store/useIdCardSettingStore';

export const IdCardFieldsSection = () => {
  const { formData, handleCheckboxChange } = useIdCardSettingStore();

  const fields = [
    { key: 'kta_show_photo', label: 'Foto Member', desc: 'Menampilkan foto profil member' },
    { key: 'kta_show_name', label: 'Nama Lengkap', desc: 'Menampilkan nama lengkap member' },
    { key: 'kta_show_nim', label: 'NIM', desc: 'Menampilkan Nomor Induk Mahasiswa' },
    { key: 'kta_show_member_id', label: 'Nomor Anggota', desc: 'Menampilkan ID anggota dengan prefix' },
    { key: 'kta_show_faculty', label: 'Fakultas', desc: 'Menampilkan fakultas' },
    { key: 'kta_show_major', label: 'Jurusan', desc: 'Menampilkan jurusan' },
    { key: 'kta_show_validity', label: 'Masa Berlaku', desc: 'Menampilkan tanggal masa berlaku' },
    { key: 'kta_show_qr', label: 'QR Code', desc: 'Menampilkan QR Code untuk verifikasi' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-on-surface">Display Fields</h3>
      <p className="text-sm text-on-surface-variant">Pilih informasi apa saja yang ingin ditampilkan di sisi depan kartu anggota.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
        {fields.map((field) => (
          <label 
            key={field.key} 
            className="flex items-start gap-3 p-3 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer bg-surface-container-low/50"
          >
            <input 
              type="checkbox"
              checked={formData[field.key as keyof typeof formData] === 'true'}
              onChange={(e) => handleCheckboxChange(field.key, e.target.checked)}
              className="mt-1 rounded border-outline-variant/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-on-surface">{field.label}</span>
              <span className="text-xs text-on-surface-variant">{field.desc}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
