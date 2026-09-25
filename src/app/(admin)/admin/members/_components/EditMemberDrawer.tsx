"use client";

import React, { useState, useEffect } from 'react';
import { Send } from "lucide-react";
import { toast } from "sonner";
import { updateMember } from "@/actions/admin-members";
import { FAKULTAS_LIST, ANGKATAN_LIST, inputClasses } from "@/app/(auth)/daftar/_components/types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EditMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any | null;
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
      console.error(error);
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
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-[90%] md:w-[600px] lg:w-[45%] xl:w-[40%] bg-white shadow-2xl border-l border-[#bbcabf]/20 flex flex-col">
        <DrawerHeader className="border-b border-[#bbcabf]/10 p-6 flex flex-row items-center justify-between shrink-0">
          <div>
            <DrawerTitle className="font-headline-md text-[20px] font-semibold text-[#191c1e] tracking-tight text-left">Edit Member</DrawerTitle>
            <DrawerDescription className="text-left mt-1 text-[#3c4a42]">Update contact and location details for {member.user?.name}.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button className="p-2 text-[#3c4a42] hover:bg-black/5 rounded-full transition-colors cursor-pointer -mt-4">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                <input type="text" readOnly value={member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('id-ID') : "-"} className={inputClasses(false) + " bg-gray-50"} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans text-[16px] font-semibold text-[#191c1e] border-b pb-2">Editable Information</h3>

            <div>
              <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+62 812..."
                value={formData.noTelepon}
                onChange={(e) => updateField("noTelepon", e.target.value)}
                className={inputClasses(false)}
              />
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
        </div>

        <DrawerFooter className="border-t border-[#bbcabf]/10 flex flex-row justify-end gap-3 bg-white shrink-0 p-6">
          <DrawerClose asChild>
            <button className="px-[16px] py-[8px] font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer">
              Cancel
            </button>
          </DrawerClose>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm ${
              !isSubmitting
                ? "bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 cursor-pointer"
                : "bg-[#006c49]/50 text-[#ffffff] opacity-50 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Changes
                <Send size={18} />
              </>
            )}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
