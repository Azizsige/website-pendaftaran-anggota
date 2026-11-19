"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  src?: string | null;
  name?: string | null;
  fallbackInitials?: string;
  sizeClass?: string;
  className?: string;
}

export function getMemberInitials(
  name?: string | null,
  fallbackInitials = "AG"
): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallbackInitials;
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isSafeImageUrl(src?: string | null): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  );
}

/** Avatar tabel anggota/pendaftar: menampilkan pas foto bila tersedia, fallback ke inisial nama. */
export function MemberAvatar({
  src,
  name,
  fallbackInitials = "AG",
  sizeClass = "h-9 w-9",
  className,
}: MemberAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const validSrc = isSafeImageUrl(src) ? src.trim() : null;
  const showImage = Boolean(validSrc && failedSrc !== validSrc);

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#006c49]/15 bg-[#e6f4ee] text-xs font-semibold text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]",
        sizeClass,
        className
      )}
    >
      {showImage && validSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={validSrc}
          alt=""
          onError={() => setFailedSrc(validSrc)}
          className="h-full w-full object-cover"
        />
      ) : (
        getMemberInitials(name, fallbackInitials)
      )}
    </div>
  );
}
