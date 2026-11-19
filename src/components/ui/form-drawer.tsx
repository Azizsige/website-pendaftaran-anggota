"use client";

import * as React from "react";
import { Loader2, Save, X } from "lucide-react";

import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
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
          "flex w-[92%] flex-col overflow-hidden border-l border-[#e2e8f0] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] dark:text-[#eef2f4] shadow-2xl md:w-[600px] lg:w-[45%] xl:w-[40%]",
          contentClassName
        )}
      >
        {isSubmitting && (
          <div
            role="status"
            aria-live="polite"
            className="animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-[#0d1412]/85 backdrop-blur-[2px]"
          >
            <Loader2 className="mb-3 h-9 w-9 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
            <h4 className="text-base font-bold text-[#0f172a] dark:text-[#eef2f4]">{overlayTitle}</h4>
            <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">Mohon tunggu sebentar...</p>
          </div>
        )}

        <DrawerHeader className="flex shrink-0 flex-row items-start justify-between gap-4 border-b border-[#f1f5f9] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] px-6 py-5">
          <div>
            <DrawerTitle className="text-left text-lg font-semibold tracking-tight text-[#0f172a] dark:text-[#eef2f4]">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="mt-1 text-left text-sm text-[#475569] dark:text-[#cbd6d0]">
                {description}
              </DrawerDescription>
            )}
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Tutup"
              disabled={isSubmitting}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#475569] dark:text-[#cbd6d0] transition-colors hover:bg-[#f1f5f9] dark:hover:bg-[#1a2723] hover:text-[#0f172a] dark:hover:text-[#eef2f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <CustomScrollArea className="min-h-0 flex-1 overscroll-contain" contentClassName="flex flex-col gap-5 p-6">
          {children}
        </CustomScrollArea>

        {!hideFooter && (
          <DrawerFooter className="flex shrink-0 flex-row items-center justify-end gap-3 border-t border-[#f1f5f9] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] px-6 py-4">
            {footer ?? (
              <>
                <DrawerClose asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="min-h-[44px] cursor-pointer rounded-lg border border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] px-4 py-2 text-sm font-semibold text-[#334155] dark:text-[#eef2f4] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#22322d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                </DrawerClose>
                <button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={isSubmitting}
                  className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#006c49] dark:bg-[#057a55] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005236] dark:hover:bg-[#046c4e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#131d1a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      {submittingLabel}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" aria-hidden />
                      {submitLabel}
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
