"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { updateAdmin } from "@/actions/admin-management";
import { useAdminStore } from "@/store/useAdminStore";
import { FormDrawer } from "@/components/ui/form-drawer";
import { FormField, TextField, fieldClass } from "@/components/ui/form-field";
import { Dropdown } from "@/components/ui/dropdown";
import type { Role } from "@/lib/constants/roles";
import type { UserStatus } from "@/lib/constants/status";

type EditAdminForm = {
  fullName: string;
  email: string;
  role: Role | "";
  status: UserStatus;
  newPassword: string;
};

const EMPTY_EDIT_FORM: EditAdminForm = {
  fullName: "",
  email: "",
  role: "",
  status: "ACTIVE",
  newPassword: "",
};

const PASSWORD_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";

function generateStrongPassword(length = 12): string {
  const bytes = new Uint32Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (val) => PASSWORD_CHARSET[val % PASSWORD_CHARSET.length]).join("");
}

export const EditAdminDrawer = ({ children }: { children?: React.ReactNode }) => {
  const { data: session } = useSession();
  const isOwner = session?.user?.role === "OWNER";

  const {
    isEditAdminOpen: open,
    setIsEditAdminOpen: onOpenChange,
    selectedAdmin: adminData,
    fetchAdmins,
  } = useAdminStore();

  const [formData, setFormData] = useState<EditAdminForm>(EMPTY_EDIT_FORM);
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  const syncKey = open ? adminData?.id ?? "open" : null;
  if (prevSyncKey !== syncKey) {
    setPrevSyncKey(syncKey);
    if (open) {
      setFormData(
        adminData
          ? {
              fullName: adminData.name || "",
              email: adminData.email || "",
              role: adminData.role,
              status: adminData.status || "ACTIVE",
              newPassword: "",
            }
          : EMPTY_EDIT_FORM
      );
      setShowPassword(false);
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

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(12);
    updateField("newPassword", generated);
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    if (!formData.newPassword.trim()) return;
    try {
      await navigator.clipboard.writeText(formData.newPassword.trim());
      toast.success("Kata sandi baru berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin kata sandi. Silakan salin secara manual.");
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Alamat email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format email tidak valid";
    if (!formData.role) newErrors.role = "Peran administrator wajib dipilih";
    if (formData.newPassword.trim() && formData.newPassword.trim().length < 6) {
      newErrors.newPassword = "Kata sandi baru minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!adminData || !validate()) return;
    setIsSubmitting(true);

    const trimmedPassword = formData.newPassword.trim();
    const res = await updateAdmin(adminData.id, {
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role as Role,
      status: formData.status as UserStatus,
      password: trimmedPassword || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        trimmedPassword
          ? "Data dan kata sandi baru administrator berhasil disimpan."
          : "Perubahan data admin berhasil disimpan."
      );
      onOpenChange(false);
      fetchAdmins();
    } else {
      toast.error(res.error || "Gagal menyimpan perubahan admin.");
    }
  };

  const roles = [
    ...(isOwner && adminData?.role === "OWNER" ? [{ label: "Owner", value: "OWNER" }] : []),
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Koordinator", value: "COORDINATOR" },
    { label: "Staff", value: "STAFF" },
  ];

  const statuses = [
    { label: "Aktif", value: "ACTIVE" },
    { label: "Tidak Aktif", value: "INACTIVE" },
    { label: "Dibekukan", value: "SUSPENDED" },
  ];

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Data Admin"
      description="Perbarui identitas, peran, status keaktifan, atau atur ulang kata sandi administrator."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Simpan Perubahan"
      submittingLabel="Menyimpan..."
      overlayTitle="Menyimpan Perubahan"
      trigger={children}
    >
      <TextField
        id="edit-admin-fullname"
        label="Nama Lengkap"
        required
        inputRef={firstInputRef}
        value={formData.fullName}
        onChange={(e) => updateField("fullName", e.target.value)}
        placeholder="Budi Santoso"
        error={errors.fullName}
      />

      <TextField
        id="edit-admin-email"
        label="Alamat Email"
        required
        type="email"
        value={formData.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="budi.santoso@kampus.ac.id"
        error={errors.email}
      />

      <div className="mt-1 space-y-4 border-t border-[#f1f5f9] pt-5 dark:border-[#24332d]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]">
          Akses &amp; Status
        </h3>
        <FormField label="Peran Administrator" htmlFor="edit-admin-role" required error={errors.role}>
          <Dropdown
            id="edit-admin-role"
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

        <FormField
          label="Status Akun"
          htmlFor="edit-admin-status"
          required
          hint="Mengubah status menjadi Tidak Aktif atau Dibekukan langsung mencabut sesi aktif administrator pada permintaan berikutnya."
        >
          <Dropdown
            id="edit-admin-status"
            options={statuses}
            value={formData.status}
            onChange={(val) => updateField("status", val)}
            placeholder="Pilih status"
          />
        </FormField>
      </div>

      <div className="mt-1 space-y-4 border-t border-[#f1f5f9] pt-5 dark:border-[#24332d]">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#006c49] dark:text-[#34d399]" aria-hidden />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]">
            Keamanan &amp; Reset Kata Sandi
          </h3>
        </div>

        <FormField
          label="Kata Sandi Baru (Opsional)"
          htmlFor="edit-admin-new-password"
          error={errors.newPassword}
          hint="Kosongkan bila tidak ingin mengubah kata sandi saat ini. Minimal 6 karakter jika diisi."
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                id="edit-admin-new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                placeholder="Masukkan kata sandi baru..."
                aria-invalid={!!errors.newPassword}
                className={fieldClass(!!errors.newPassword, "pr-11 font-mono")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#52606d] transition-colors hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:text-[#94a89e] dark:hover:text-[#eef2f4] dark:focus-visible:ring-[#34d399]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>

            {formData.newPassword.trim() && (
              <button
                type="button"
                onClick={handleCopyPassword}
                aria-label="Salin kata sandi baru"
                title="Salin kata sandi baru"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#85929f] bg-white text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
              >
                <Copy className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </FormField>

        <button
          type="button"
          onClick={handleGeneratePassword}
          className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#85929f] bg-[#f8fafc] px-4 py-2 text-xs font-semibold text-[#0f172a] transition-colors hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          <span>Buat Sandi Acak (12 Karakter)</span>
        </button>
      </div>
    </FormDrawer>
  );
};
