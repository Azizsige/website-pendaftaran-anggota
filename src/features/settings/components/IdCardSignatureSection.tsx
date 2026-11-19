import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { TextField } from "@/components/ui/form-field";

export const IdCardSignatureSection = () => {
  const { formData, signaturePreview, handleSignatureUpload, handleChange } =
    useIdCardSettingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSignatureUpload(file);
  };

  const removeSignature = () => {
    handleChange("kta_signature_url", "");
    useIdCardSettingStore.setState({ signaturePreview: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          Tanda Tangan Pengesah
        </h3>
        <p className="mt-0.5 text-sm text-[#475569] dark:text-[#cbd6d0]">
          Unggah gambar tanda tangan PNG berlatar transparan beserta nama pejabat penanda tangan.
        </p>
      </div>

      <div className="mt-1 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="kta-signature-upload"
            className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]"
          >
            Gambar Tanda Tangan
          </label>
          <div className="flex items-start gap-4">
            <div
              className={`relative flex h-24 w-44 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${signaturePreview
                  ? "border-[#006c49] bg-white dark:border-[#34d399]"
                  : "border-[#85929f] bg-[#f8fafc] hover:border-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:hover:border-[#34d399]"
                }`}
            >
              {signaturePreview ? (
                <>
                  <Image
                    src={signaturePreview}
                    alt="Pratinjau Tanda Tangan"
                    width={176}
                    height={96}
                    className="h-full w-full object-contain p-2"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={removeSignature}
                    aria-label="Hapus tanda tangan"
                    title="Hapus tanda tangan"
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#dc2626] text-white shadow-sm transition-colors hover:bg-[#b91c1c]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </>
              ) : (
                <div className="pointer-events-none flex flex-col items-center gap-1 px-2 text-center text-[#475569] dark:text-[#cbd6d0]">
                  <Upload className="h-5 w-5" aria-hidden />
                  <span className="text-[11px] font-medium">Unggah TTD (PNG)</span>
                </div>
              )}

              {!signaturePreview && (
                <input
                  id="kta-signature-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={onFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              )}
            </div>
          </div>
          <p className="text-xs text-[#64748b] dark:text-[#94a89e]">
            Disarankan PNG transparan agar menyatu dengan latar kartu. Maksimal 2 MB.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            id="kta-signature-name"
            label="Nama Penanda Tangan"
            value={formData.kta_signature_name}
            onChange={(e) => handleChange("kta_signature_name", e.target.value)}
            placeholder="Contoh: M. Hafiz Al-Fath"
            hint="Nama lengkap pejabat yang dicetak di bawah tanda tangan."
          />

          <TextField
            id="kta-signature-title"
            label="Jabatan / NIM Pengesah (Opsional)"
            value={formData.kta_signature_title}
            onChange={(e) => handleChange("kta_signature_title", e.target.value)}
            placeholder="Contoh: Ketua Umum · NIM 2024098112"
            hint="Ditampilkan di bawah nama pengesah pada sisi depan kartu."
          />
        </div>
      </div>
    </div>
  );
};
