"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { createAdmin } from "@/actions/admin-management";
import { useAdminStore } from "@/store/useAdminStore";
import type { Role } from "@/lib/constants/roles";
import { FormDrawer } from "@/components/ui/form-drawer";
import { FormField, TextField } from "@/components/ui/form-field";
import { Dropdown } from "@/components/ui/dropdown";

const EMPTY_ADMIN_FORM = {
  fullName: "",
  email: "",
  role: "",
};

export const AddAdminDrawer = ({ children }: { children?: React.ReactNode }) => {
  const {
    isAddAdminOpen: open,
    setIsAddAdminOpen: onOpenChange,
    fetchAdmins,
  } = useAdminStore();

  const [formData, setFormData] = useState(EMPTY_ADMIN_FORM);
  const [prevOpen, setPrevOpen] = useState(open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setFormData(EMPTY_ADMIN_FORM);
      setErrors({});
    }
  }

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
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
    if (!formData.fullName.trim()) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Alamat email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format email tidak valid";
    if (!formData.role) newErrors.role = "Peran administrator wajib dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const res = await createAdmin({
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role as Role,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Administrator berhasil ditambahkan.");
      onOpenChange(false);
      fetchAdmins();
    } else {
      toast.error(res.error || "Gagal menambahkan administrator.");
    }
  };

  const roles = [
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Koordinator", value: "COORDINATOR" },
    { label: "Staff", value: "STAFF" },
  ];

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Admin Baru"
      description="Masukkan identitas dan peran administrator untuk mengakses dashboard pengelola."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Simpan Admin"
      submittingLabel="Menyimpan..."
      trigger={children}
    >
      <TextField
        id="add-admin-fullname"
        label="Nama Lengkap"
        required
        inputRef={firstInputRef}
        value={formData.fullName}
        onChange={(e) => updateField("fullName", e.target.value)}
        placeholder="Budi Santoso"
        error={errors.fullName}
      />

      <TextField
        id="add-admin-email"
        label="Alamat Email"
        required
        type="email"
        value={formData.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="budi.santoso@kampus.ac.id"
        error={errors.email}
      />

      <div className="mt-1 border-t border-[#f1f5f9] pt-5 dark:border-[#24332d]">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]">
          Akses &amp; Peran
        </h3>
        <FormField label="Peran Administrator" htmlFor="add-admin-role" required error={errors.role}>
          <Dropdown
            id="add-admin-role"
            options={roles}
            value={formData.role}
            onChange={(val) => updateField("role", val)}
            placeholder="Pilih peran"
            triggerClassName={
              errors.role
                ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/20 dark:border-[#f87171] dark:focus:border-[#f87171] dark:focus:ring-[#f87171]/25"
                : undefined
            }
          />
        </FormField>
      </div>
    </FormDrawer>
  );
};
