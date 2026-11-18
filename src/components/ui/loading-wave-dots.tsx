import React from "react";
import { cn } from "@/lib/utils";

interface LoadingWaveDotsProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const DOT_SIZE: Record<NonNullable<LoadingWaveDotsProps["size"]>, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

const WRAPPER_HEIGHT: Record<NonNullable<LoadingWaveDotsProps["size"]>, string> = {
  sm: "h-4 gap-1",
  md: "h-5 gap-1.5",
  lg: "h-8 sm:h-9 gap-1.5",
};

/**
 * Indikator loading berupa tiga titik bergerak bergelombang (wave).
 * Warna titik mengikuti `currentColor` dari container induknya.
 */
export function LoadingWaveDots({
  size = "md",
  label = "Memuat data",
  className,
}: LoadingWaveDotsProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "inline-flex items-center select-none",
        WRAPPER_HEIGHT[size],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("rounded-full bg-current animate-wave-dot", DOT_SIZE[size])}
      />
      <span
        aria-hidden="true"
        style={{ animationDelay: "160ms" }}
        className={cn("rounded-full bg-current animate-wave-dot", DOT_SIZE[size])}
      />
      <span
        aria-hidden="true"
        style={{ animationDelay: "320ms" }}
        className={cn("rounded-full bg-current animate-wave-dot", DOT_SIZE[size])}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
