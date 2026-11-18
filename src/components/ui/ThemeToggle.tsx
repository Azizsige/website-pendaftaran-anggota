"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** Menampilkan label teks di sebelah ikon (mis. di sidebar atau drawer mobile). */
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();

  const isDark = theme === "dark";
  const labelText = isDark ? "Mode Terang" : "Mode Gelap";
  const ariaLabel = !mounted
    ? "Ubah tema tampilan"
    : isDark
      ? "Aktifkan mode terang"
      : "Aktifkan mode gelap";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      aria-pressed={mounted ? isDark : undefined}
      title={ariaLabel}
      className={cn(
        "inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors",
        "border-[#5c6b62]/60 bg-white text-[#191c1e] hover:bg-[#f2f4f6]",
        "dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
        showLabel ? "px-3.5 py-2" : "w-11 px-0",
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 shrink-0 text-[#fcd34d]" aria-hidden />
        ) : (
          <Moon className="h-4 w-4 shrink-0 text-[#3c4a42]" aria-hidden />
        )
      ) : (
        <span className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {showLabel && <span>{mounted ? labelText : "Tema Tampilan"}</span>}
    </button>
  );
}
