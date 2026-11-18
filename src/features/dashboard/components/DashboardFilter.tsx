"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/format";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DashboardFilterProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export default function DashboardFilter({
  date,
  onDateChange,
}: DashboardFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-11 min-h-[44px] w-full sm:w-auto sm:min-w-[215px] flex items-center gap-2.5 px-3.5 bg-white dark:bg-[#131d1a] border border-[#cbd5e1] dark:border-[#5f736b] text-[#191c1e] dark:text-[#eef2f4] text-sm font-medium rounded-[10px] hover:bg-[#f8fafc] dark:hover:bg-[#1a2723] hover:border-[#006c49]/60 dark:hover:border-[#34d399]/70 transition-colors text-left cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]",
            !date && "text-[#52606d] dark:text-[#94a89e]"
          )}
        >
          <CalendarDays
            className="w-4 h-4 text-[#006c49] dark:text-[#34d399] shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">
            {date?.from ? (
              date.to ? (
                <>
                  {formatDate(date.from, "d MMM yyyy")} -{" "}
                  {formatDate(date.to, "d MMM yyyy")}
                </>
              ) : (
                formatDate(date.from, "d MMM yyyy")
              )
            ) : (
              "Pilih Rentang Tanggal"
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-[#131d1a] border-[#e2e8f0] dark:border-[#3c4d46]" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from || new Date()}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
