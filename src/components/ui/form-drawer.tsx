"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  cancelLabel?: string;
  /** Teks overlay saat menyimpan. */
  overlayTitle?: string;
  /** Elemen pemicu (mis. `<DrawerTrigger asChild>`), dirender sebelum konten. */
  trigger?: React.ReactNode;
  /** Sembunyikan tombol submit (mis. step wizard punya tombol sendiri). */
  hideFooter?: boolean;
  footer?: React.ReactNode;
  contentClassName?: string;
}

/**
 * Drawer form tunggal: header, area scroll, footer (Batal/Simpan), overlay saat menyimpan.
 * Menggantikan AddAdminDrawer, EditAdminDrawer, dan EditMemberDrawer yang duplikat.
 */
export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Simpan",
  submittingLabel = "Menyimpan...",
  cancelLabel = "Batal",
  overlayTitle = "Menyimpan Data",
  trigger,
  hideFooter = false,
  footer,
  contentClassName,
}: FormDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !isSubmitting && onOpenChange(next)}
      direction="right"
    >
      {trigger}
      <DrawerContent
        className={cn(
          "flex w-[90%] flex-col overflow-hidden border-l border-outline-variant/20 bg-white shadow-2xl md:w-[600px] lg:w-[45%] xl:w-[40%]",
          contentClassName
        )}
      >
        {isSubmitting && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] animate-fade-in"
          >
            <span
              className="material-symbols-outlined mb-3 animate-spin text-[40px] text-primary"
              aria-hidden
            >
              progress_activity
            </span>
            <h4 className="text-lg font-bold text-on-surface">{overlayTitle}</h4>
            <p className="mt-1 text-sm text-on-surface-variant">Mohon tunggu sebentar...</p>
          </div>
        )}

        <DrawerHeader className="flex shrink-0 flex-row items-center justify-between border-b border-outline-variant/10 p-6">
          <div>
            <DrawerTitle className="text-left text-[20px] font-semibold tracking-tight text-on-surface">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="mt-1 text-left text-on-surface-variant">
                {description}
              </DrawerDescription>
            )}
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Tutup"
              disabled={isSubmitting}
              className="-mt-4 flex h-8 w-8 items-center justify-center cursor-pointer rounded-full text-on-surface-variant transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px] leading-none select-none flex items-center justify-center" aria-hidden>
                close
              </span>
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto no-scrollbar p-6">{children}</div>

        {!hideFooter && (
          <DrawerFooter className="flex shrink-0 flex-row justify-end gap-3 border-t border-outline-variant/10 bg-white p-6">
            {footer ?? (
              <>
                <DrawerClose asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-lg px-4 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                </DrawerClose>
                <button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={isSubmitting}
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-6 py-2 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {submittingLabel}
                    </>
                  ) : (
                    <>
                      {submitLabel}
                      <Send size={18} />
                    </>
                  )}
                </button>
              </>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
