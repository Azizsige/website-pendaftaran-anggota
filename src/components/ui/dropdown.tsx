"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
