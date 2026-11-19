"use client";

import React, { useEffect, useImperativeHandle, useMemo, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { EventListeners, ScrollbarsAutoHideBehavior } from "overlayscrollbars";

import {
  createScrollbarOptions,
  ensureOverlayScrollbarsPlugins,
  type ScrollAxis,
} from "@/lib/scrollbars";

export interface CustomScrollAreaProps {
  children: React.ReactNode;
  axis?: ScrollAxis;
  autoHide?: ScrollbarsAutoHideBehavior;
  defer?: boolean;
  element?: "div" | "nav" | "section" | "aside";
  className?: string;
  contentClassName?: string;
  viewportRef?: React.MutableRefObject<HTMLElement | null>;
  onInitialized?: (viewport: HTMLElement) => void;
  "aria-label"?: string;
}

/**
 * Menghentikan propagasi wheel & touchmove sebelum mencapai document agar
 * react-remove-scroll (Drawer/Dialog) tidak mengunci scroll pada konten Portal.
 */
export function usePortalScrollRef<T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>
): React.RefCallback<T> {
  const [portalEl, setPortalEl] = useState<T | null>(null);

  useImperativeHandle(forwardedRef, () => portalEl as T, [portalEl]);

  useEffect(() => {
    if (!portalEl) return;
    const stopBubble = (event: Event) => {
      event.stopPropagation();
    };
    portalEl.addEventListener("wheel", stopBubble, { passive: true });
    portalEl.addEventListener("touchmove", stopBubble, { passive: true });
    return () => {
      portalEl.removeEventListener("wheel", stopBubble);
      portalEl.removeEventListener("touchmove", stopBubble);
    };
  }, [portalEl]);

  return setPortalEl;
}

export function CustomScrollArea({
  children,
  axis = "y",
  autoHide = "leave",
  defer = true,
  element = "div",
  className,
  contentClassName,
  viewportRef,
  onInitialized,
  "aria-label": ariaLabel,
}: CustomScrollAreaProps) {
  useEffect(() => {
    ensureOverlayScrollbarsPlugins();
  }, []);

  const options = useMemo(
    () => createScrollbarOptions(axis, autoHide),
    [axis, autoHide]
  );

  const events = useMemo<EventListeners | undefined>(() => {
    if (!viewportRef && !onInitialized) return undefined;
    return {
      initialized: (instance) => {
        const viewport = instance.elements().viewport;
        if (viewportRef) viewportRef.current = viewport;
        onInitialized?.(viewport);
      },
      destroyed: () => {
        if (viewportRef) viewportRef.current = null;
      },
    };
  }, [viewportRef, onInitialized]);

  return (
    <OverlayScrollbarsComponent
      element={element}
      defer={defer}
      options={options}
      events={events}
      aria-label={ariaLabel}
      className={className}
    >
      {contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        children
      )}
    </OverlayScrollbarsComponent>
  );
}
