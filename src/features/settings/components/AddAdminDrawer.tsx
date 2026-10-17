"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { createAdmin } from "@/actions/admin-management";
import { useAdminStore } from '@/store/useAdminStore';
import type { Role } from "@/lib/constants/roles";
import { FormDrawer } from "@/components/ui/form-drawer";
import { FormField, TextField } from "@/components/ui/form-field";
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
      role: formData.role as Role
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
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Admin"
      description="Fill in the details to add a new administrator."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Admin"
      submittingLabel="Saving..."
      trigger={children}
    >
      <TextField
        label="Full Name"
        required
        inputRef={firstInputRef}
        value={formData.fullName}
        onChange={(e) => updateField('fullName', e.target.value)}
        placeholder="Budi Santoso"
        error={errors.fullName}
      />

      <TextField
        label="Email Address"
        required
        type="email"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="budi.santoso@example.com"
        error={errors.email}
      />

      <div className="pt-6 border-t border-[#bbcabf]/10 mt-2">
        <h3 className="font-semibold text-on-surface mb-6">Access & Permission</h3>
        <FormField label="Role" required error={errors.role}>
          <Dropdown
            options={roles}
            value={formData.role}
            onChange={(val) => updateField('role', val)}
            placeholder="Pilih Role"
            triggerClassName={`bg-white text-black border-outline-variant/30 ${errors.role ? "border-error focus:ring-error/50 focus:border-error" : ""}`}
          />
        </FormField>
      </div>
    </FormDrawer>
  );
};
