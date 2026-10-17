"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { updateAdmin } from "@/actions/admin-management";
import { useAdminStore } from '@/store/useAdminStore';
import { FormDrawer } from "@/components/ui/form-drawer";
import { FormField, TextField } from "@/components/ui/form-field";
import { Dropdown } from "@/components/ui/dropdown";
import type { Role } from "@/lib/constants/roles";
import type { UserStatus } from "@/lib/constants/status";

export const EditAdminDrawer = ({ children }: { children?: React.ReactNode }) => {
  const { isEditAdminOpen: open, setIsEditAdminOpen: onOpenChange, selectedAdmin: adminData, fetchAdmins } = useAdminStore();
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    role: Role | "";
    status: UserStatus;
  }>({
    fullName: '',
    email: '',
    role: '',
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (adminData) {
        setFormData({
          fullName: adminData.name || '',
          email: adminData.email || '',
          role: adminData.role,
          status: adminData.status || 'ACTIVE',
        });
      } else {
        setFormData({ fullName: '', email: '', role: '', status: 'ACTIVE' });
      }
      setErrors({});
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open, adminData]);

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
    if (!adminData || !validate()) return;
    setIsSubmitting(true);

    const res = await updateAdmin(adminData.id, {
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role as Role,
      status: formData.status as UserStatus
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Perubahan admin berhasil disimpan");
      onOpenChange(false);
      fetchAdmins();
    } else {
      toast.error(res.error || "Gagal mengubah admin");
    }
  };

  const roles = [
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Koordinator", value: "COORDINATOR" },
    { label: "Staff", value: "STAFF" },
  ];

  const statuses = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
  ];

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Admin"
      description="Modify the details of this administrator."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      overlayTitle="Menyimpan Perubahan"
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

        <div className="mt-4">
          <FormField label="Status" required>
            <Dropdown
              options={statuses}
              value={formData.status}
              onChange={(val) => updateField('status', val)}
              placeholder="Pilih Status"
              triggerClassName="bg-white text-black border-outline-variant/30"
            />
          </FormField>
        </div>
      </div>
    </FormDrawer>
  );
};
