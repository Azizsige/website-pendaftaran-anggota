"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useRegistrationSettingStore } from '@/store/useRegistrationSettingStore';

export const RegistrationFields = () => {
  const { 
    isRegistrationActive, registrationDate, maxQuota, reqKtm, reqFoto, setField 
  } = useRegistrationSettingStore();

  return (
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
            onClick={() => setField('isRegistrationActive', !isRegistrationActive)}
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
                        <>{format(registrationDate.from, "MMM dd, yyyy")} - {format(registrationDate.to, "MMM dd, yyyy")}</>
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
                  defaultMonth={registrationDate?.from || new Date()}
                  selected={registrationDate}
                  onSelect={(date) => setField('registrationDate', date)}
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
            value={maxQuota}
            onChange={(e) => setField('maxQuota', e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-semibold text-on-surface">Document Requirements</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <label className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer bg-surface-container-low/50">
            <input 
              checked={reqKtm}
              onChange={(e) => setField('reqKtm', e.target.checked)}
              className="rounded border-outline-variant/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer shrink-0" 
              type="checkbox"
            />
            <span className="text-sm truncate">Kartu Tanda Mahasiswa (KTM)</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-lg hover:bg-surface-variant/30 transition-colors cursor-pointer bg-surface-container-low/50">
            <input 
              checked={reqFoto}
              onChange={(e) => setField('reqFoto', e.target.checked)}
              className="rounded border-outline-variant/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer shrink-0" 
              type="checkbox"
            />
            <span className="text-sm truncate">Foto Profil</span>
          </label>
        </div>
      </div>
    </div>
  );
};
