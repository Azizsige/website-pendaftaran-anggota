import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";

import { useIdCardSettingStore } from "@/store/useIdCardSettingStore";
import { fieldClass } from "@/components/ui/form-field";
import { logger } from "@/lib/logger";

type TermItem = { id: string; text: string };

interface DragSession {
  activeId: string;
  pointerId: number;
  startClientY: number;
  lastClientY: number;
  offsetY: number;
  pendingPrevLayoutTop: number | null;
  moved: boolean;
}

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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const nextSeqRef = useRef(0);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const sessionRef = useRef<DragSession | null>(null);
  const termsRef = useRef<TermItem[]>(terms);
  const dragCleanupRef = useRef<(() => void) | null>(null);

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

  useLayoutEffect(() => {
    termsRef.current = terms;

    const session = sessionRef.current;
    if (!session || session.pendingPrevLayoutTop === null) return;

    const activeEl = itemRefs.current.get(session.activeId);
    if (!activeEl) {
      session.pendingPrevLayoutTop = null;
      return;
    }

    const newVisualTop = activeEl.getBoundingClientRect().top;
    const newLayoutTop = newVisualTop - session.offsetY;
    const layoutShift = newLayoutTop - session.pendingPrevLayoutTop;

    session.startClientY += layoutShift;
    session.offsetY = session.lastClientY - session.startClientY;
    session.pendingPrevLayoutTop = null;
    activeEl.style.transform = `translate3d(0, ${session.offsetY}px, 0) scale(1.01)`;
  }, [terms]);

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
    };
  }, []);

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

  const startPointerDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    termId: string
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (termsRef.current.length < 2) return;

    event.preventDefault();
    dragCleanupRef.current?.();

    const activeEl = itemRefs.current.get(termId);
    if (activeEl) {
      activeEl.style.transform = "translate3d(0, 0px, 0) scale(1.01)";
    }

    sessionRef.current = {
      activeId: termId,
      pointerId: event.pointerId,
      startClientY: event.clientY,
      lastClientY: event.clientY,
      offsetY: 0,
      pendingPrevLayoutTop: null,
      moved: false,
    };
    setDraggedId(termId);

    const finishDrag = (ev: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || ev.pointerId !== session.pointerId) return;

      const el = itemRefs.current.get(session.activeId);
      if (el) {
        el.style.transform = "";
      }

      const hasMoved = session.moved;
      const finalTerms = termsRef.current;
      sessionRef.current = null;
      setDraggedId(null);

      dragCleanupRef.current?.();
      dragCleanupRef.current = null;

      if (hasMoved) {
        updateStore(finalTerms);
      }
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || moveEvent.pointerId !== session.pointerId) return;

      const el = itemRefs.current.get(session.activeId);
      if (!el) return;

      session.lastClientY = moveEvent.clientY;
      session.offsetY = moveEvent.clientY - session.startClientY;
      el.style.transform = `translate3d(0, ${session.offsetY}px, 0) scale(1.01)`;

      const currentTerms = termsRef.current;
      const currentIndex = currentTerms.findIndex(
        (item) => item.id === session.activeId
      );
      if (currentIndex === -1) return;

      let swapTargetIndex: number | null = null;

      if (currentIndex > 0) {
        const prevTerm = currentTerms[currentIndex - 1];
        const prevEl = itemRefs.current.get(prevTerm.id);
        if (prevEl) {
          const prevRect = prevEl.getBoundingClientRect();
          if (moveEvent.clientY < prevRect.top + prevRect.height * 0.55) {
            swapTargetIndex = currentIndex - 1;
          }
        }
      }

      if (swapTargetIndex === null && currentIndex < currentTerms.length - 1) {
        const nextTerm = currentTerms[currentIndex + 1];
        const nextEl = itemRefs.current.get(nextTerm.id);
        if (nextEl) {
          const nextRect = nextEl.getBoundingClientRect();
          if (moveEvent.clientY > nextRect.top + nextRect.height * 0.45) {
            swapTargetIndex = currentIndex + 1;
          }
        }
      }

      if (swapTargetIndex !== null) {
        session.pendingPrevLayoutTop =
          el.getBoundingClientRect().top - session.offsetY;
        session.moved = true;

        const nextTerms = [...currentTerms];
        const [movedItem] = nextTerms.splice(currentIndex, 1);
        nextTerms.splice(swapTargetIndex, 0, movedItem);
        termsRef.current = nextTerms;
        setTerms(nextTerms);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    dragCleanupRef.current = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
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
            Atur maksimal 5 poin ketentuan pada sisi belakang kartu. Tahan ikon titik di kiri atau gunakan tombol panah untuk mengurutkan.
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
            {terms.map((term, index) => {
              const isDragging = draggedId === term.id;
              return (
                <div
                  key={term.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(term.id, el);
                    else itemRefs.current.delete(term.id);
                  }}
                  className={`relative flex items-start gap-2.5 rounded-xl border p-3 ${
                    isDragging
                      ? "z-20 border-[#006c49] bg-white shadow-xl ring-2 ring-[#006c49]/25 dark:border-[#34d399] dark:bg-[#1e2d28] dark:ring-[#34d399]/35"
                      : draggedId
                        ? "border-dashed border-[#cbd5e1] bg-[#f8fafc]/90 transition-colors duration-150 dark:border-[#4b6058] dark:bg-[#1a2723]/90"
                        : "border-[#e2e8f0] bg-[#f8fafc] transition-colors duration-150 dark:border-[#3c4d46] dark:bg-[#1a2723]"
                  }`}
                >
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onPointerDown={(e) => startPointerDrag(e, term.id)}
                      disabled={terms.length < 2}
                      aria-label={`Seret untuk mengubah urutan poin ${index + 1}`}
                      title="Tahan & seret untuk mengubah urutan"
                      className="flex h-8 w-8 cursor-grab touch-none select-none items-center justify-center rounded text-[#64748b] transition-colors hover:bg-[#e2e8f0] hover:text-[#0f172a] active:cursor-grabbing disabled:cursor-default disabled:opacity-40 dark:text-[#94a89e] dark:hover:bg-[#22322d] dark:hover:text-[#eef2f4]"
                    >
                      <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </button>
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor={`kta-term-${term.id}`}
                        className="text-[11px] font-semibold uppercase tracking-wide text-[#52606d] dark:text-[#94a89e]"
                      >
                        Poin {index + 1}
                      </label>
                      {isDragging && (
                        <span className="rounded-full bg-[#e6f4ee] px-2 py-0.5 text-[11px] font-semibold text-[#005236] dark:bg-[#0c3528] dark:text-[#6ee7b7]">
                          Posisi #{index + 1}
                        </span>
                      )}
                    </div>
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
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748b] dark:text-[#94a89e]">
        Perubahan langsung terlihat pada pratinjau kartu. Klik &quot;Simpan Perubahan&quot; di bawah untuk menyimpan ke database.
      </p>
    </div>
  );
};
