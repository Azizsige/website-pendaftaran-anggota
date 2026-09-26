"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createAdmin } from "@/actions/admin-management";
import { useAdminStore } from '@/store/useAdminStore';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Dropdown } from "@/components/ui/dropdown";

export const AddAdminDrawer = ({ children }: { children?: React.ReactNode }) => {
  const { isAddAdminOpen: open, setIsAddAdminOpen: onOpenChange, fetchAdmins } = useAdminStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFormData({ fullName: '', email: '', role: '' });
      setErrors({});
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email Address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    
    const res = await createAdmin({
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Admin berhasil ditambahkan");
      onOpenChange(false);
      fetchAdmins();
    } else {
      toast.error(res.error || "Gagal menambahkan admin");
    }
  };

  const roles = [
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Koordinator", value: "COORDINATOR" },
    { label: "Staff", value: "STAFF" },
  ];

  return (
    <Drawer open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)} direction="right">
      {children}
      <DrawerContent className="w-[90%] md:w-[600px] lg:w-[45%] xl:w-[40%] bg-white shadow-2xl border-l border-[#bbcabf]/20 flex flex-col overflow-hidden">
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] animate-fade-in">
            <span className="material-symbols-outlined text-primary text-[40px] animate-spin mb-3">progress_activity</span>
            <h4 className="font-headline-md font-bold text-on-surface text-lg">Menyimpan Data</h4>
            <p className="text-sm text-on-surface-variant mt-1">Mohon tunggu sebentar...</p>
          </div>
        )}
        <DrawerHeader className="border-b border-[#bbcabf]/10 p-6 flex flex-row items-center justify-between shrink-0">
          <div>
            <DrawerTitle className="font-headline-md text-[20px] font-semibold text-[#191c1e] tracking-tight text-left">Add New Admin</DrawerTitle>
            <DrawerDescription className="text-left mt-1 text-[#3c4a42]">Fill in the details to add a new administrator.</DrawerDescription>
          </div>
            <DrawerClose asChild>
              <button disabled={isSubmitting} className="p-2 text-[#3c4a42] hover:bg-black/5 rounded-full transition-colors cursor-pointer -mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface">Full Name <span className="text-error">*</span></label>
            <input
              ref={firstInputRef}
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Budi Santoso"
              className={`w-full px-4 py-2.5 bg-surface-container-low border ${errors.fullName ? 'border-error' : 'border-outline-variant/30'} rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 ${errors.fullName ? 'focus:ring-error/50 focus:border-error' : 'focus:ring-primary/50 focus:border-primary'} transition-all`}
            />
            {errors.fullName && <p className="text-xs text-error mt-1">{errors.fullName}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface">Email Address <span className="text-error">*</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="budi.santoso@example.com"
              className={`w-full px-4 py-2.5 bg-surface-container-low border ${errors.email ? 'border-error' : 'border-outline-variant/30'} rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-error/50 focus:border-error' : 'focus:ring-primary/50 focus:border-primary'} transition-all`}
            />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
          </div>

          <div className="pt-6 border-t border-[#bbcabf]/10 mt-2">
            <h3 className="font-semibold text-on-surface mb-6">Access & Permission</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Role <span className="text-error">*</span></label>
              <Dropdown
                options={roles}
                value={formData.role}
                onChange={(val) => updateField('role', val)}
                placeholder="Pilih Role"
                triggerClassName={`bg-white text-black border-outline-variant/30 ${errors.role ? "border-error focus:ring-error/50 focus:border-error" : ""}`}
              />
              {errors.role && <p className="text-xs text-error mt-1">{errors.role}</p>}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-[#bbcabf]/10 flex flex-row justify-between gap-3 bg-white shrink-0 p-6">
          <DrawerClose asChild>
            <button disabled={isSubmitting} className="px-6 py-2.5 font-semibold text-sm text-red-500 hover:text-red-600 border border-red-500 hover:border-red-500 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
          </DrawerClose>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold py-[8px] px-[24px] rounded-lg transition-colors flex items-center gap-[4px] shadow-sm ${isSubmitting
              ? "bg-[#006c49]/50 text-[#ffffff] cursor-not-allowed"
              : "bg-[#006c49] text-[#ffffff] hover:bg-[#006c49]/90 cursor-pointer"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Admin
                <Send size={18} />
              </>
            )}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
