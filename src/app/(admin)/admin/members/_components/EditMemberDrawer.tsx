"use client";

import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { updateMember } from "@/actions/admin-members";
import { FAKULTAS_LIST, ANGKATAN_LIST, inputClasses } from "@/app/(auth)/daftar/_components/types";
import { FormDrawer } from "@/components/ui/form-drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { logger } from "@/lib/logger";

import type { MemberWithUser } from "@/types/member";

interface EditMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithUser | null;
  onSuccess?: () => void;
}

export const EditMemberDrawer = ({ open, onOpenChange, member, onSuccess }: EditMemberDrawerProps) => {
  const [formData, setFormData] = useState({
    noTelepon: "",
    fakultas: "",
    jurusan: "",
    angkatan: "",
    alamat: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && member) {
      setFormData({
        noTelepon: member.phoneNumber || "",
        fakultas: member.faculty || "",
        jurusan: member.major || "",
        angkatan: member.batchYear || "",
        alamat: member.address || "",
      });
    } else if (!open) {
      // Reset form when drawer closes
      setFormData({
        noTelepon: "",
        fakultas: "",
        jurusan: "",
        angkatan: "",
        alamat: "",
      });
    }
  }, [open, member]);

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
        toast.success("Member berhasil diperbarui!");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal memperbarui member.");
      }
    } catch (error) {
      logger.error("Gagal memperbarui member:", error);
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
      title="Edit Member"
      description={`Update contact and location details for ${member.user?.name || "member"}.`}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      overlayTitle="Menyimpan Data"
    >
      <div className="space-y-4">
        <h3 className="font-sans text-[16px] font-semibold text-[#191c1e] border-b pb-2">Locked Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-[#191c1e] mb-1">Full Name</label>
            <input type="text" readOnly value={member.user?.name || "-"} className={inputClasses(false) + " bg-gray-50"} />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-[#191c1e] mb-1">NIM</label>
            <input type="text" readOnly value={member.nim || member.id} className={inputClasses(false) + " bg-gray-50"} />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-[#191c1e] mb-1">Email</label>
            <input type="email" readOnly value={member.user?.email || "-"} className={inputClasses(false) + " bg-gray-50"} />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-[#191c1e] mb-1">Date of Birth</label>
            <input type="text" readOnly value={formatDate(member.dateOfBirth)} className={inputClasses(false) + " bg-gray-50"} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-sans text-[16px] font-semibold text-[#191c1e] border-b pb-2">Editable Information</h3>

        <div>
          <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42] text-[14px] font-sans">+62</span>
            <input
              type="tel"
              placeholder="812-3456-7890"
              maxLength={15}
              value={formData.noTelepon}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '').substring(0, 13);
                let formatted = val;
                if (val.length > 3 && val.length <= 7) formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                else if (val.length > 7) formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
                updateField("noTelepon", formatted);
              }}
              className={inputClasses(false) + " pl-[44px]"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Fakultas
            </label>
            <Select
              value={formData.fakultas}
              onValueChange={(val) => updateField("fakultas", val)}
            >
              <SelectTrigger className={cn("w-full h-auto py-[10px] px-[16px] rounded-[10px] border bg-[#ffffff] hover:border-[#6c7a71] text-[#191c1e]", "border-[#bbcabf]")}>
                <SelectValue placeholder="Pilih Fakultas" />
              </SelectTrigger>
              <SelectContent className="text-[#191c1e]">
                {FAKULTAS_LIST.map((fak) => (
                  <SelectItem key={fak} value={fak}>
                    {fak}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Jurusan
            </label>
            <input
              type="text"
              placeholder="Nama Jurusan"
              value={formData.jurusan}
              onChange={(e) => updateField("jurusan", e.target.value)}
              className={inputClasses(false)}
            />
          </div>
        </div>

        <div>
          <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
            Angkatan
          </label>
          <Select
            value={formData.angkatan}
            onValueChange={(val) => updateField("angkatan", val)}
          >
            <SelectTrigger className={cn("w-full h-auto py-[10px] px-[16px] rounded-[10px] border bg-[#ffffff] hover:border-[#6c7a71] text-[#191c1e]", "border-[#bbcabf]")}>
              <SelectValue placeholder="Pilih Angkatan" />
            </SelectTrigger>
            <SelectContent className="text-[#191c1e]">
              {ANGKATAN_LIST.map((angkatan) => (
                <SelectItem key={angkatan} value={angkatan}>
                  {angkatan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
            Residential Address
          </label>
          <textarea
            rows={3}
            placeholder="Enter your full address here..."
            value={formData.alamat}
            onChange={(e) => updateField("alamat", e.target.value)}
            className={inputClasses(false) + " resize-none"}
          ></textarea>
        </div>
      </div>
    </FormDrawer>
  );
};
