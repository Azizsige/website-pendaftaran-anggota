"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select an option",
  className,
  triggerClassName,
}: DropdownProps) {
  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "bg-surface border-outline-variant/50 rounded-lg text-body-md text-on-surface hover:border-primary transition-colors cursor-pointer shadow-sm",
          triggerClassName,
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface ActionMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  tone?: "default" | "danger" | "success" | "muted";
  disabled?: boolean;
}

export interface ActionMenuProps {
  label?: string;
  trigger?: React.ReactNode;
  items: (ActionMenuItem | "divider")[];
  className?: string;
  disabled?: boolean;
}

/** Menu aksi melayang menggunakan Radix Popover untuk tabel dan kartu data. */
export function ActionMenu({
  label = "Actions",
  trigger,
  items,
  className,
  disabled = false,
}: ActionMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-lg text-on-surface font-label-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer",
              className
            )}
          >
            {label}
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1.5 shadow-lg border border-outline-variant/20">
        <div className="flex flex-col">
          {items.map((item, index) => {
            if (item === "divider") {
              return <div key={`divider-${index}`} className="h-[1px] bg-outline-variant/20 my-1 mx-2" />;
            }

            const toneClass =
              item.tone === "danger"
                ? "text-error hover:bg-error/10"
                : item.tone === "success"
                ? "text-primary hover:bg-primary/10"
                : item.tone === "muted"
                ? "text-on-surface-variant hover:bg-surface-container-lowest"
                : "text-on-surface hover:bg-surface-container-lowest";

            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-left font-label-md transition-colors w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                  toneClass
                )}
              >
                {item.icon && <span className="material-symbols-outlined text-[18px]">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
