import React from "react";

interface ApplicantNotesCardProps {
  adminNotes?: string | null;
  tempNotes: string;
  isEditingNotes: boolean;
  onTempNotesChange: (val: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveNotes: () => void;
  isPending: boolean;
  titleMode: "pendaftar" | "member";
  userRole?: string;
}

export function ApplicantNotesCard({
  adminNotes,
  tempNotes,
  isEditingNotes,
  onTempNotesChange,
  onStartEditing,
  onCancelEditing,
  onSaveNotes,
  isPending,
  titleMode,
  userRole,
}: ApplicantNotesCardProps) {
  const canEditNotes = titleMode === "pendaftar" && userRole !== "STAFF";

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <label className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500 text-[20px]">
            rate_review
          </span>{" "}
          Catatan Admin
        </label>
        {!isEditingNotes && canEditNotes && (
          <button
            type="button"
            onClick={onStartEditing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden>
              edit
            </span>
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditingNotes ? (
        <div className="flex flex-col gap-2 w-full">
          <textarea
            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-body-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:border-transparent min-h-[80px]"
            value={tempNotes}
            onChange={(e) => onTempNotesChange(e.target.value)}
            placeholder="Masukkan catatan admin di sini..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              onClick={onCancelEditing}
            >
              Batal
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium bg-[#006c49] text-white rounded hover:bg-[#005236] transition-colors cursor-pointer"
              disabled={isPending}
              onClick={onSaveNotes}
            >
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`w-full p-3 border border-slate-200 rounded-lg text-xs font-body-sm min-h-[44px] ${
            canEditNotes
              ? "bg-slate-50 cursor-pointer hover:bg-slate-100 text-slate-800 transition-colors"
              : "bg-slate-50/50 text-slate-500"
          }`}
          onClick={() => {
            if (canEditNotes) onStartEditing();
          }}
        >
          {adminNotes ||
            (canEditNotes
              ? "Tidak ada catatan admin. Klik untuk menambahkan."
              : "Tidak ada catatan admin.")}
        </div>
      )}
    </div>
  );
}
