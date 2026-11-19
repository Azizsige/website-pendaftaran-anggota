"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { DropdownProps } from "react-day-picker";

import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { cn } from "@/lib/utils";

interface DropdownOptionItem {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
}

/**
 * Dropdown bulan/tahun custom di dalam DOM React agar klik dropdown tidak
 * memicu native OS `<select>` focus-out yang menutup Popover induknya.
 */
export function CalendarCaptionDropdown({
  name,
  caption,
  children,
  className,
  style,
  value,
  onChange,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const centerSelectedOption = useCallback((viewport: HTMLElement | null) => {
    const item = selectedItemRef.current;
    if (!viewport || !item) return;
    const targetTop = item.offsetTop - viewport.clientHeight / 2 + item.offsetHeight / 2;
    viewport.scrollTop = Math.max(0, targetTop);
  }, []);

  const options = useMemo<DropdownOptionItem[]>(() => {
    const items: DropdownOptionItem[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ value?: string | number; children?: React.ReactNode; disabled?: boolean }>(child)) {
        const optionValue = child.props.value;
        if (optionValue !== undefined && optionValue !== null) {
          items.push({
            value: String(optionValue),
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
          });
        }
      }
    });
    return items;
  }, [children]);

  const currentValue = value !== undefined && value !== null ? String(value) : "";
  const activeOption = options.find((item) => item.value === currentValue);
  const displayLabel = caption ?? activeOption?.label ?? currentValue;

  useEffect(() => {
    if (!isOpen) return;

    const rafId = window.requestAnimationFrame(() => {
      centerSelectedOption(viewportRef.current);
    });

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, centerSelectedOption]);

  const handleSelect = (optionValue: string) => {
    const syntheticEvent = {
      target: { value: optionValue },
      currentTarget: { value: optionValue },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange?.(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={style}
      className="relative inline-block"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          "inline-flex items-center justify-between gap-1.5 px-2.5 py-1 text-sm font-medium rounded-md border transition-colors cursor-pointer",
          "bg-white text-[#191c1e] border-[#cbd5e1] hover:border-[#006c49]",
          "dark:bg-[#1a2723] dark:text-[#eef2f4] dark:border-[#5f736b] dark:hover:border-[#34d399]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
          className
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-150",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-[calc(100%+4px)] z-[60] min-w-[120px] rounded-lg border shadow-lg overflow-hidden",
            "border-[#cbd5e1] bg-white text-[#191c1e]",
            "dark:border-[#3c4d46] dark:bg-[#131d1a] dark:text-[#eef2f4]",
            name === "years" ? "right-0 min-w-[96px]" : "left-0 min-w-[136px]"
          )}
        >
          <CustomScrollArea
            autoHide="never"
            defer={false}
            className="max-h-56 overscroll-contain"
            contentClassName="relative p-1 pr-3 space-y-0.5"
            viewportRef={viewportRef}
            onInitialized={centerSelectedOption}
          >
            {options.map((option) => {
              const isSelected = option.value === currentValue;
              return (
                <button
                  key={option.value}
                  ref={isSelected ? selectedItemRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    isSelected
                      ? "bg-[#006c49] text-white dark:bg-[#057a55] dark:text-white"
                      : "text-[#191c1e] hover:bg-[#f1f5f9] dark:text-[#eef2f4] dark:hover:bg-[#1f2e29]"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </CustomScrollArea>
        </div>
      )}
    </div>
  );
}
