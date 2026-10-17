"use client";

import { Dropdown } from "@/components/ui/dropdown";

interface ChartFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ChartFilter({ value, onChange }: ChartFilterProps) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={[
        { label: "Last 6 Months", value: "6_months" },
        { label: "This Year", value: "this_year" }
      ]}
      triggerClassName="bg-surface-container border-none h-8 w-[140px]"
    />
  );
}
