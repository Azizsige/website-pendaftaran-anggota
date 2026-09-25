"use client";

import { useState } from "react";
import { Settings, Lock, Eye, EyeOff, Save } from "lucide-react";

export default function PengaturanPage() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Kelola keamanan dan preferensi akun Anda.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[var(--success)] text-sm">
          ✓ Password berhasil diubah!
        </div>
      )}

      {/* Change Password */}
      <form onSubmit={handleSave} className="card-glass space-y-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lock size={18} className="text-[var(--primary-light)]" />
          Ubah Password
        </h3>

        <div>
          <label className="input-label">Password Lama</label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Masukkan password lama"
              className="input-field !pr-12"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="input-label">Password Baru</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Masukkan password baru"
              className="input-field !pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="input-label">Konfirmasi Password Baru</label>
          <input
            type="password"
            placeholder="Ulangi password baru"
            className="input-field"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Menyimpan..." : "Ubah Password"}
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="card-glass space-y-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings size={18} className="text-[var(--primary-light)]" />
          Preferensi Notifikasi
        </h3>
        <div className="space-y-4">
          {[
            {
              label: "Email Notifikasi",
              desc: "Terima notifikasi melalui email",
              defaultChecked: true,
            },
            {
              label: "Update Status",
              desc: "Notifikasi perubahan status keanggotaan",
              defaultChecked: true,
            },
            {
              label: "Newsletter",
              desc: "Terima informasi dan berita terbaru",
              defaultChecked: false,
            },
          ].map((pref) => (
            <div
              key={pref.label}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            >
              <div>
                <p className="text-sm font-medium text-white">{pref.label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {pref.desc}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={pref.defaultChecked}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--bg-elevated)] rounded-full peer peer-checked:bg-[var(--primary)] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
