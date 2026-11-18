"use client";

import React from "react";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ACTION_ICON_MAP: Record<string, LucideIcon> = {
  visibility: Eye,
  eye: Eye,
  edit: Pencil,
  pencil: Pencil,
  person_off: UserX,
  user_x: UserX,
  block: Ban,
  ban: Ban,
  check_circle: CheckCircle2,
  delete: Trash2,
  delete_forever: Trash2,
  trash: Trash2,
};

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  id?: string;
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function Dropdown({
  id,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Pilih opsi",
  disabled = false,
  className,
  triggerClassName,
}: DropdownProps) {
  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          "min-h-[44px] cursor-pointer rounded-lg border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] text-sm text-[#0f172a] dark:text-[#eef2f4] transition-colors hover:border-[#64748b] dark:hover:border-[#94a89e] focus:border-[#006c49] dark:focus:border-[#34d399]",
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
  label = "Aksi",
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
              "flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-[#e2e8f0] dark:border-[#5f736b] bg-white dark:bg-[#1a2723] px-3 py-1.5 text-xs font-semibold text-[#334155] dark:text-[#eef2f4] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#22322d] disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          >
            {label}
            <ChevronDown className="h-4 w-4 text-[#64748b] dark:text-[#94a89e]" aria-hidden />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-52 rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] p-1.5 shadow-lg"
      >
        <div className="flex flex-col gap-0.5">
          {items.map((item, index) => {
            if (item === "divider") {
              return <div key={`divider-${index}`} className="mx-2 my-1 h-px bg-[#f1f5f9] dark:bg-[#3c4d46]" />;
            }

            const IconComponent = item.icon ? ACTION_ICON_MAP[item.icon] : undefined;
            const toneClass =
              item.tone === "danger"
                ? "text-[#991b1b] dark:text-[#fca5a5] hover:bg-[#fef2f2] dark:hover:bg-[#3b1214]"
                : item.tone === "success"
                ? "text-[#005236] dark:text-[#6ee7b7] hover:bg-[#e6f4ee] dark:hover:bg-[#0c3528]"
                : item.tone === "muted"
                ? "text-[#475569] dark:text-[#94a89e] hover:bg-[#f8fafc] dark:hover:bg-[#1a2723]"
                : "text-[#0f172a] dark:text-[#eef2f4] hover:bg-[#f8fafc] dark:hover:bg-[#1a2723]";

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
                  "flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  toneClass
                )}
              >
                {IconComponent && <IconComponent className="h-4 w-4 shrink-0" aria-hidden />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
