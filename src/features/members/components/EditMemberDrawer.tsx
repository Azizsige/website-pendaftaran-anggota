"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { updateMember } from "../actions";
import { FAKULTAS_LIST, ANGKATAN_LIST } from "@/features/registration";
import { FormDrawer } from "@/components/ui/form-drawer";
import { FormField, fieldClass } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { logger } from "@/lib/logger";
import type { MemberWithUser } from "../types";

interface EditMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithUser | null;
  onSuccess?: () => void;
}

const EMPTY_FORM = {
  noTelepon: "",
  fakultas: "",
  jurusan: "",
  angkatan: "",
  alamat: "",
};

export const EditMemberDrawer = ({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditMemberDrawerProps) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncKey = open && member ? member.id : null;
  if (prevSyncKey !== syncKey) {
    setPrevSyncKey(syncKey);
    setFormData(
      open && member
        ? {
            noTelepon: member.phoneNumber || "",
            fakultas: member.faculty || "",
            jurusan: member.major || "",
            angkatan: member.batchYear || "",
            alamat: member.address || "",
          }
        : EMPTY_FORM
    );
  }

  const handleSubmit = async () => {
    if (!member) return;
    setIsSubmitting(true);
    try {
      const res = await updateMember(member.id, {
        phoneNumber: formData.noTelepon,
        address: formData.alamat,
        faculty: formData.fakultas,
        major: formData.jurusan,
        batchYear: formData.angkatan,
      });

      if (res.success) {
        toast.success("Data anggota berhasil diperbarui.");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal memperbarui data anggota.");
      }
    } catch (error) {
      logger.error("Gagal memperbarui anggota:", error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!member) return null;

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Data Anggota"
      description={`Perbarui informasi kontak, domisili, dan data akademik untuk ${
        member.user?.name || "anggota"
      }.`}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Simpan Perubahan"
      submittingLabel="Menyimpan..."
      overlayTitle="Menyimpan Data"
    >
      <div className="space-y-4">
        <h3 className="border-b border-[#e2e8f0] pb-2 text-sm font-semibold uppercase tracking-wide text-[#52606d] dark:border-[#3c4d46] dark:text-[#94a89e]">
          Informasi Terkunci
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Nama Lengkap" htmlFor="edit-member-name">
            <input
              id="edit-member-name"
              type="text"
              readOnly
              value={member.user?.name || "-"}
              className={fieldClass(
                false,
                "cursor-default border-[#e2e8f0] bg-[#f8fafc] text-[#475569] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#94a89e]"
              )}
            />
          </FormField>
          <FormField label="NIM" htmlFor="edit-member-nim">
            <input
              id="edit-member-nim"
              type="text"
              readOnly
              value={member.nim || member.id}
              className={fieldClass(
                false,
                "cursor-default border-[#e2e8f0] bg-[#f8fafc] font-mono text-[#475569] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#94a89e]"
              )}
            />
          </FormField>
          <FormField label="Email" htmlFor="edit-member-email">
            <input
              id="edit-member-email"
              type="email"
              readOnly
              value={member.user?.email || "-"}
              className={fieldClass(
                false,
                "cursor-default border-[#e2e8f0] bg-[#f8fafc] text-[#475569] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#94a89e]"
              )}
            />
          </FormField>
          <FormField label="Tanggal Lahir" htmlFor="edit-member-dob">
            <input
              id="edit-member-dob"
              type="text"
              readOnly
              value={formatDate(member.dateOfBirth)}
              className={fieldClass(
                false,
                "cursor-default border-[#e2e8f0] bg-[#f8fafc] text-[#475569] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#94a89e]"
              )}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="border-b border-[#e2e8f0] pb-2 text-sm font-semibold uppercase tracking-wide text-[#52606d] dark:border-[#3c4d46] dark:text-[#94a89e]">
          Informasi yang Dapat Diperbarui
        </h3>

        <FormField label="Nomor Telepon / WhatsApp" htmlFor="edit-member-phone">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#475569] dark:text-[#94a89e]">
              +62
            </span>
            <input
              id="edit-member-phone"
              type="tel"
              placeholder="812-3456-7890"
              maxLength={15}
              value={formData.noTelepon}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").substring(0, 13);
                let formatted = val;
                if (val.length > 3 && val.length <= 7) formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                else if (val.length > 7) formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
                updateField("noTelepon", formatted);
              }}
              className={fieldClass(false, "pl-12 tabular-nums")}
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Fakultas" htmlFor="edit-member-faculty">
            <Select
              value={formData.fakultas}
              onValueChange={(val) => updateField("fakultas", val)}
            >
              <SelectTrigger id="edit-member-faculty">
                <SelectValue placeholder="Pilih Fakultas" />
              </SelectTrigger>
              <SelectContent>
                {FAKULTAS_LIST.map((fak) => (
                  <SelectItem key={fak} value={fak}>
                    {fak}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Program Studi / Jurusan" htmlFor="edit-member-major">
            <input
              id="edit-member-major"
              type="text"
              placeholder="Nama program studi"
              value={formData.jurusan}
              onChange={(e) => updateField("jurusan", e.target.value)}
              className={fieldClass(false)}
            />
          </FormField>
        </div>

        <FormField label="Angkatan" htmlFor="edit-member-batch">
          <Select
            value={formData.angkatan}
            onValueChange={(val) => updateField("angkatan", val)}
          >
            <SelectTrigger id="edit-member-batch">
              <SelectValue placeholder="Pilih Angkatan" />
            </SelectTrigger>
            <SelectContent>
              {ANGKATAN_LIST.map((angkatan) => (
                <SelectItem key={angkatan} value={angkatan}>
                  {angkatan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Alamat Domisili" htmlFor="edit-member-address">
          <textarea
            id="edit-member-address"
            rows={3}
            placeholder="Masukkan alamat domisili lengkap..."
            value={formData.alamat}
            onChange={(e) => updateField("alamat", e.target.value)}
            className={fieldClass(false, "min-h-[96px] resize-y")}
          />
        </FormField>
      </div>
    </FormDrawer>
  );
};
