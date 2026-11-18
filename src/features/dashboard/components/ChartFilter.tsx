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
      placeholder="Pilih rentang grafik"
      options={[
        { label: "6 Bulan Terakhir", value: "6_months" },
        { label: "Tahun Ini", value: "this_year" },
        { label: "30 Hari Terakhir", value: "30_days" },
      ]}
      triggerClassName="bg-[#f8fafc] dark:bg-[#1a2723] border border-[#cbd5e1] dark:border-[#5f736b] text-[#191c1e] dark:text-[#eef2f4] min-h-[44px] h-11 w-[178px] text-sm font-medium rounded-lg shadow-none hover:border-[#006c49]/60 dark:hover:border-[#34d399]/70"
    />
  );
}
