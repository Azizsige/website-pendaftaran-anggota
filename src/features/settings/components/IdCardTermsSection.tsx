import React, { useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { fieldClass } from "@/components/ui/form-field";
import { logger } from "@/lib/logger";

type TermItem = { id: string; text: string };

const emptySubscribe = () => () => {};

function parseTermsSafe(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    logger.error("Failed to parse kta_terms:", e);
    return [];
  }
}

export const IdCardTermsSection = () => {
  const { formData, handleChange } = useIdCardSettingStore();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [terms, setTerms] = useState<TermItem[]>(() =>
    parseTermsSafe(formData.kta_terms).map((t, i) => ({
      id: `term-init-${i}`,
      text: t,
    }))
  );
  const [prevRaw, setPrevRaw] = useState(formData.kta_terms);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const nextSeqRef = useRef(0);

  if (prevRaw !== formData.kta_terms) {
    setPrevRaw(formData.kta_terms);
    const currentSerialized = JSON.stringify(terms.map((t) => t.text));
    if ((formData.kta_terms || "[]") !== currentSerialized) {
      const parsed = parseTermsSafe(formData.kta_terms);
      setTerms(
        parsed.map((t, i) => ({
          id: `term-sync-${i}-${parsed.length}`,
          text: t,
        }))
      );
    }
  }

  const updateStore = (newTerms: TermItem[]) => {
    const serialized = JSON.stringify(newTerms.map((t) => t.text));
    setTerms(newTerms);
    setPrevRaw(serialized);
    handleChange("kta_terms", serialized);
  };

  const addTerm = () => {
    if (terms.length >= 5) return;
    nextSeqRef.current += 1;
    updateStore([
      ...terms,
      { id: `term-item-${nextSeqRef.current}`, text: "" },
    ]);
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = terms.map((item, i) =>
      i === index ? { ...item, text: value } : item
    );
    updateStore(newTerms);
  };

  const deleteTerm = (index: number) => {
    updateStore(terms.filter((_, i) => i !== index));
  };

  const moveTerm = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= terms.length) return;
    const nextTerms = [...terms];
    const [moved] = nextTerms.splice(index, 1);
    nextTerms.splice(target, 0, moved);
    updateStore(nextTerms);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const nextTerms = [...terms];
    const [moved] = nextTerms.splice(dragIndex, 1);
    nextTerms.splice(targetIndex, 0, moved);
    setDragIndex(null);
    updateStore(nextTerms);
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
            Ketentuan Kartu (Sisi Belakang)
          </h3>
          <p className="mt-0.5 text-sm text-[#475569] dark:text-[#cbd6d0]">
            Atur maksimal 5 poin ketentuan pada sisi belakang kartu. Seret kartu atau gunakan tombol panah untuk mengurutkan.
          </p>
        </div>
        <button
          type="button"
          onClick={addTerm}
          disabled={terms.length >= 5}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#006c49]/20 bg-[#e6f4ee] px-4 py-2 text-xs font-semibold text-[#005236] transition-colors hover:bg-[#cde9dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:hover:bg-[#114d3a] dark:focus-visible:ring-[#34d399]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          <span>Tambah Poin</span>
        </button>
      </div>

      <div>
        {terms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] py-6 text-center text-sm text-[#475569] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
            Belum ada poin ketentuan. Klik &quot;Tambah Poin&quot; untuk menambahkan.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {terms.map((term, index) => (
              <div
                key={term.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => setDragIndex(null)}
                className={`relative flex items-start gap-2.5 rounded-xl border p-3 transition-colors ${
                  dragIndex === index
                    ? "border-[#006c49] bg-[#e6f4ee]/40 opacity-75 dark:border-[#34d399] dark:bg-[#0c3528]/50"
                    : "border-[#e2e8f0] bg-[#f8fafc] dark:border-[#3c4d46] dark:bg-[#1a2723]"
                }`}
              >
                <div className="mt-1 flex flex-col items-center gap-1">
                  <span
                    aria-hidden="true"
                    title="Seret untuk mengubah urutan"
                    className="cursor-grab rounded p-1 text-[#64748b] hover:text-[#0f172a] active:cursor-grabbing dark:text-[#94a89e] dark:hover:text-[#eef2f4]"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveTerm(index, -1)}
                      disabled={index === 0}
                      aria-label={`Naikkan poin ${index + 1}`}
                      title="Naikkan urutan"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#475569] transition-colors hover:bg-[#e2e8f0] hover:text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#cbd6d0] dark:hover:bg-[#22322d] dark:hover:text-[#eef2f4]"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTerm(index, 1)}
                      disabled={index === terms.length - 1}
                      aria-label={`Turunkan poin ${index + 1}`}
                      title="Turunkan urutan"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#475569] transition-colors hover:bg-[#e2e8f0] hover:text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#cbd6d0] dark:hover:bg-[#22322d] dark:hover:text-[#eef2f4]"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label
                    htmlFor={`kta-term-${term.id}`}
                    className="text-[11px] font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]"
                  >
                    Poin {index + 1}
                  </label>
                  <textarea
                    id={`kta-term-${term.id}`}
                    value={term.text}
                    onChange={(e) => updateTerm(index, e.target.value)}
                    rows={2}
                    className={fieldClass(false, "min-h-[68px] resize-y text-sm")}
                    placeholder="Masukkan teks ketentuan anggota..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => deleteTerm(index)}
                  aria-label={`Hapus poin ${index + 1}`}
                  title="Hapus poin"
                  className="mt-5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#fef2f2] text-[#991b1b] transition-colors hover:bg-[#fee2e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] dark:bg-[#3b1214] dark:text-[#fca5a5] dark:hover:bg-[#531a1d] dark:focus-visible:ring-[#f87171]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748b] dark:text-[#94a89e]">
        Perubahan langsung terlihat pada pratinjau kartu. Klik &quot;Simpan Perubahan&quot; di bawah untuk menyimpan ke database.
      </p>
    </div>
  );
};
