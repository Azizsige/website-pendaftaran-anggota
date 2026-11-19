"use client";

import { useEffect } from "react";
import { useOverlayScrollbars } from "overlayscrollbars-react";

import {
  BODY_SCROLLBAR_OPTIONS,
  ensureOverlayScrollbarsPlugins,
} from "@/lib/scrollbars";

export function BodyScrollbars() {
  const [initialize] = useOverlayScrollbars({
    options: BODY_SCROLLBAR_OPTIONS,
    defer: true,
  });

  useEffect(() => {
    ensureOverlayScrollbarsPlugins();
    initialize(document.body);
  }, [initialize]);

  return null;
}
