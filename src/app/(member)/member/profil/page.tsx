"use client";

import { useState } from "react";
import { Save, User, Camera } from "lucide-react";

export default function ProfilPage() {
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
        <h1 className="text-2xl font-bold text-white">Profil Saya</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Kelola informasi pribadi dan data diri Anda.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[var(--success)] text-sm">
          ✓ Data berhasil disimpan!
        </div>
      )}

      {/* Avatar */}
      <div className="card-glass">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-2xl font-bold">
              AP
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Andi Pratama</p>
            <p className="text-[var(--text-secondary)] text-sm">
              Member ID: IDN-12345678
            </p>
            <button className="mt-2 text-xs text-[var(--primary-light)] hover:text-[var(--primary)] transition-colors">
              Ganti foto profil
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="card-glass space-y-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <User size={18} className="text-[var(--primary-light)]" />
          Data Diri
        </h3>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="input-label">Nama Lengkap</label>
            <input
              type="text"
              defaultValue="Andi Pratama"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">NIK</label>
            <input
              type="text"
              defaultValue="3275012345678901"
              className="input-field opacity-60 cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              defaultValue="andipratama@email.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">No. Telepon</label>
            <input
              type="tel"
              defaultValue="081234567890"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="input-label">Tempat Lahir</label>
            <input
              type="text"
              defaultValue="Jakarta"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Tanggal Lahir</label>
            <input
              type="date"
              defaultValue="1995-03-15"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="input-label">Alamat Lengkap</label>
          <textarea
            rows={3}
            defaultValue="Jl. Sudirman No. 45, RT 05/RW 03, Kelurahan Setiabudi, Kecamatan Setiabudi, Jakarta Selatan"
            className="input-field resize-none"
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
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
