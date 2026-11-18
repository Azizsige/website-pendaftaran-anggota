"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ToasterProvider() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-center" richColors theme={resolvedTheme} />;
}
