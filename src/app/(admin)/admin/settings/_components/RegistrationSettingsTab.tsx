"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export const RegistrationSettingsTab = () => {
  const [isRegistrationActive, setIsRegistrationActive] = useState(true);
  const [registrationDate, setRegistrationDate] = useState<DateRange | undefined>({
    from: new Date(2023, 9, 1),
    to: new Date(2023, 11, 31)
  });

  return (
    <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm overflow-hidden">
      <div>
        <h2 className="text-[24px] font-semibold text-on-surface tracking-tight">Registration Settings</h2>
        <p className="text-sm text-on-surface-variant mt-1">Configure enrollment status, schedules, and requirements.</p>
      </div>
      
      <hr className="border-outline-variant/20" />
      
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-on-surface">Registration Status</span>
            <span className={cn("font-bold text-sm flex items-center gap-1.5", isRegistrationActive ? "text-primary" : "text-on-surface-variant")}>
              <span className={cn("w-2 h-2 rounded-full", isRegistrationActive ? "bg-primary" : "bg-on-surface-variant")}></span> {isRegistrationActive ? 'Aktif' : 'Non-Aktif'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant hidden sm:inline">Buka/Tutup Pendaftaran</span>
            <button 
              onClick={() => setIsRegistrationActive(!isRegistrationActive)}
              className={cn("w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0", isRegistrationActive ? "bg-primary" : "bg-surface-variant")}
            >
              <span className={cn("absolute top-1 w-4 h-4 bg-on-primary rounded-full transition-all", isRegistrationActive ? "right-1" : "left-1")}></span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-sm font-semibold text-on-surface">Enrollment Schedule</label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-left font-normal cursor-pointer overflow-hidden",
                      !registrationDate && "text-on-surface-variant"
                    )}
                  >
                    <span className="material-symbols-outlined text-sm text-outline shrink-0">calendar_today</span>
                    <span className="truncate">
                      {registrationDate?.from ? (
                        registrationDate.to ? (
                          <>
                            {format(registrationDate.from, "MMM dd, yyyy")} - {format(registrationDate.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(registrationDate.from, "MMM dd, yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={registrationDate?.from}
                    selected={registrationDate}
                    onSelect={setRegistrationDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-sm font-semibold text-on-surface">Maximum Quota</label>
            <input 
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
              type="number" 
              defaultValue="1000"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-on-surface">Document Requirements</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <label className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer bg-surface-container-low/50">
              <input defaultChecked className="rounded border-outline-variant/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer shrink-0" type="checkbox"/>
              <span className="text-sm truncate">Kartu Tanda Mahasiswa (KTM)</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer bg-surface-container-low/50">
              <input defaultChecked className="rounded border-outline-variant/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer shrink-0" type="checkbox"/>
              <span className="text-sm truncate">Foto Profil</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-outline-variant/20">
        <button className="px-6 py-2.5 font-medium text-sm text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors border border-transparent hover:border-outline-variant/30 w-full sm:w-auto cursor-pointer">
          Cancel
        </button>
        <button className="px-6 py-2.5 font-medium text-sm bg-primary text-on-primary hover:bg-primary-container hover:shadow-md rounded-lg transition-all shadow-sm w-full sm:w-auto cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
};
