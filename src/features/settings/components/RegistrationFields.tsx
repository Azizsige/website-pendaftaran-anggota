"use client";

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckboxField,
  FormField,
  TextField,
  ToggleSwitchField,
  fieldClass,
} from "@/components/ui/form-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import { useRegistrationSettingStore } from "@/store/useRegistrationSettingStore";

export const RegistrationFields = () => {
  const {
    isRegistrationActive,
    registrationDate,
    maxQuota,
    reqKtm,
    reqFoto,
    setField,
  } = useRegistrationSettingStore();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]">
            Status Penerimaan Portal
          </span>
          <StatusBadge status={isRegistrationActive ? "ACTIVE" : "INACTIVE"} />
        </div>
        <ToggleSwitchField
          id="registration-active-toggle"
          checked={isRegistrationActive}
          onChange={(checked) => setField("isRegistrationActive", checked)}
          label={
            isRegistrationActive
              ? "Pendaftaran Sedang Dibuka"
              : "Pendaftaran Sedang Ditutup"
          }
          description="Aktifkan sakelar ini untuk membuka akses pengisian formulir anggota baru di portal publik."
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Jadwal Pendaftaran" htmlFor="registration-schedule">
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="registration-schedule"
                type="button"
                className={cn(
                  fieldClass(
                    false,
                    "flex cursor-pointer items-center gap-2.5 text-left font-normal"
                  ),
                  !registrationDate?.from && "text-[#64748b] dark:text-[#94a89e]"
                )}
              >
                <CalendarIcon
                  className="h-4 w-4 shrink-0 text-[#475569] dark:text-[#94a89e]"
                  aria-hidden
                />
                <span className="truncate tabular-nums">
                  {registrationDate?.from ? (
                    registrationDate.to ? (
                      <>
                        {formatDate(registrationDate.from, "d MMM yyyy")} -{" "}
                        {formatDate(registrationDate.to, "d MMM yyyy")}
                      </>
                    ) : (
                      formatDate(registrationDate.from, "d MMM yyyy")
                    )
                  ) : (
                    <span>Pilih rentang tanggal pendaftaran</span>
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
                onSelect={(date) => setField("registrationDate", date)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </FormField>

        <TextField
          id="registration-max-quota"
          type="number"
          min={0}
          label="Batas Kuota Maksimal"
          value={maxQuota}
          onChange={(e) => setField("maxQuota", e.target.value)}
          placeholder="Contoh: 250"
          className="tabular-nums"
          hint="Isi 0 jika penerimaan dibuka tanpa pembatasan kuota."
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          Persyaratan Berkas Mahasiswa
        </span>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <CheckboxField
            id="req-ktm"
            checked={reqKtm}
            onChange={(checked) => setField("reqKtm", checked)}
            label="Kartu Tanda Mahasiswa (KTM)"
            description="Wajib mengunggah foto atau pindaian KTM aktif."
          />
          <CheckboxField
            id="req-foto"
            checked={reqFoto}
            onChange={(checked) => setField("reqFoto", checked)}
            label="Pas Foto / Foto Profil"
            description="Digunakan untuk identitas resmi di KTA digital."
          />
        </div>
      </div>
    </div>
  );
};
