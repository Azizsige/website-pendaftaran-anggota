"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDate, formatIndonesianPhoneInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FormData, Errors, FAKULTAS_LIST, ANGKATAN_LIST, inputClasses } from "../types";

interface StepDataDiriProps {
  formData: FormData;
  errors: Errors;
  updateField: (field: keyof FormData, value: string | File | null | boolean) => void;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
  hideHeader?: boolean;
  isInline?: boolean;
}

const labelClasses =
  "block font-sans text-[13px] leading-[18px] font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-1";

export default function StepDataDiri({
  formData,
  errors,
  updateField,
  firstInputRef,
  hideHeader = false,
  isInline = false,
}: StepDataDiriProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      {!hideHeader && (
        <>
          <h2 className="font-sans text-xl md:text-2xl font-semibold text-[#191c1e] dark:text-[#eef2f4] mb-1.5">
            Informasi Data Diri & Akademik
          </h2>
          <p className="font-sans text-[13px] leading-[19px] text-[#3c4a42] dark:text-[#cbd6d0] mb-4">
            Lengkapi identitas mahasiswa sesuai Kartu Tanda Mahasiswa (KTM) yang aktif.
          </p>
        </>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        noValidate
        className={
          isInline
            ? "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-3.5"
        }
      >
        {/* Row 1: Nama Lengkap (5) | NIM (4) | Jenis Kelamin (3) */}
        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-5"}>
          <label htmlFor="field-nama-lengkap" className={labelClasses}>
            Nama Lengkap <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <input
            id="field-nama-lengkap"
            ref={firstInputRef}
            type="text"
            autoComplete="name"
            placeholder="Nama sesuai KTM"
            value={formData.namaLengkap}
            onChange={(e) => updateField("namaLengkap", e.target.value)}
            className={inputClasses(!!errors.namaLengkap)}
          />
          {errors.namaLengkap && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.namaLengkap}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-4"}>
          <label htmlFor="field-nim" className={labelClasses}>
            NIM (Nomor Induk Mahasiswa) <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <input
            id="field-nim"
            type="text"
            inputMode="numeric"
            maxLength={15}
            placeholder="Contoh: 231402011"
            value={formData.nim}
            onChange={(e) => updateField("nim", e.target.value.replace(/\D/g, ""))}
            className={inputClasses(!!errors.nim) + " font-mono"}
          />
          {errors.nim && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.nim}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-3"}>
          <label htmlFor="field-jenis-kelamin" className={labelClasses}>
            Jenis Kelamin <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <Select
            value={formData.jenisKelamin}
            onValueChange={(val) => updateField("jenisKelamin", val)}
          >
            <SelectTrigger
              id="field-jenis-kelamin"
              aria-label="Jenis Kelamin"
              className={cn(
                "w-full min-h-[44px] h-[44px] cursor-pointer py-2 px-3.5 rounded-lg border bg-[#ffffff] hover:border-[#3c4a42] text-[14px] text-[#191c1e] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:border-[#a8bab0]",
                errors.jenisKelamin
                  ? "border-[#ba1a1a] bg-[#ffdad6]/20 dark:border-[#f87171] dark:bg-[#3b1214]/40"
                  : "border-[#5c6b62] dark:border-[#768f84]"
              )}
            >
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
              <SelectItem value="Perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>
          {errors.jenisKelamin && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.jenisKelamin}
            </p>
          )}
        </div>

        {/* Row 2: Tempat Lahir (3) | Tanggal Lahir (3) | Email (3) | No. Telepon (3) */}
        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-3"}>
          <label htmlFor="field-tempat-lahir" className={labelClasses}>
            Tempat Lahir <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <input
            id="field-tempat-lahir"
            type="text"
            placeholder="Kota kelahiran"
            value={formData.tempatLahir}
            onChange={(e) => updateField("tempatLahir", e.target.value)}
            className={inputClasses(!!errors.tempatLahir)}
          />
          {errors.tempatLahir && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.tempatLahir}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-3"}>
          <label htmlFor="field-tanggal-lahir" className={labelClasses}>
            Tanggal Lahir <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="field-tanggal-lahir"
                type="button"
                variant="outline"
                className={cn(
                  "w-full min-h-[44px] h-[44px] cursor-pointer justify-start text-left font-normal py-2 px-3.5 rounded-lg border text-[14px] text-[#191c1e] dark:text-[#eef2f4]",
                  !formData.tanggalLahir && "text-[#5c6b62] dark:text-[#a8bab0]",
                  errors.tanggalLahir
                    ? "border-[#ba1a1a] bg-[#ffdad6]/20 dark:border-[#f87171] dark:bg-[#3b1214]/40"
                    : "border-[#5c6b62] bg-[#ffffff] hover:border-[#3c4a42] dark:border-[#768f84] dark:bg-[#1a2723] dark:hover:border-[#a8bab0]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {formData.tanggalLahir ? formatDate(formData.tanggalLahir) : "Pilih tanggal"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 text-[#191c1e] dark:text-[#eef2f4]" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={1970}
                toYear={new Date().getFullYear()}
                defaultMonth={formData.tanggalLahir ? new Date(formData.tanggalLahir) : undefined}
                selected={formData.tanggalLahir ? new Date(formData.tanggalLahir) : undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    const offset = date.getTimezoneOffset();
                    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
                    updateField("tanggalLahir", adjustedDate.toISOString().split("T")[0]);
                    setIsCalendarOpen(false);
                  } else {
                    updateField("tanggalLahir", "");
                  }
                }}
                classNames={{
                  day_selected:
                    "bg-[#006c49] dark:bg-[#057a55] text-white hover:bg-[#006c49] hover:text-white focus:bg-[#006c49] focus:text-white",
                  day_today:
                    "bg-[#bbcabf]/30 text-[#191c1e] dark:bg-[#22322d] dark:text-[#6ee7b7]",
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.tanggalLahir && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.tanggalLahir}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-3"}>
          <label htmlFor="field-email" className={labelClasses}>
            Alamat Email <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <input
            id="field-email"
            type="email"
            autoComplete="email"
            placeholder="nama@mahasiswa.ac.id"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClasses(!!errors.email)}
          />
          {errors.email && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-3"}>
          <label htmlFor="field-no-telepon" className={labelClasses}>
            Nomor Telepon <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <input
            id="field-no-telepon"
            type="tel"
            autoComplete="tel"
            placeholder="0812-3456-7890"
            maxLength={16}
            value={formData.noTelepon}
            onChange={(e) => {
              updateField("noTelepon", formatIndonesianPhoneInput(e.target.value));
            }}
            onBlur={(e) => {
              const normalized = formatIndonesianPhoneInput(e.target.value, {
                ensureLeadingZero: true,
              });
              if (normalized !== formData.noTelepon) {
                updateField("noTelepon", normalized);
              }
            }}
            className={inputClasses(!!errors.noTelepon) + " tabular-nums"}
          />
          {errors.noTelepon && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.noTelepon}
            </p>
          )}
        </div>

        {/* Row 3: Fakultas (5) | Program Studi / Jurusan (4) | Tahun Angkatan (3) */}
        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-5"}>
          <label htmlFor="field-fakultas" className={labelClasses}>
            Fakultas <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <Select
            value={formData.fakultas}
            onValueChange={(val) => updateField("fakultas", val)}
          >
            <SelectTrigger
              id="field-fakultas"
              aria-label="Fakultas"
              className={cn(
                "w-full min-h-[44px] h-[44px] cursor-pointer py-2 px-3.5 rounded-lg border bg-[#ffffff] hover:border-[#3c4a42] text-[14px] text-[#191c1e] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:border-[#a8bab0]",
                errors.fakultas
                  ? "border-[#ba1a1a] bg-[#ffdad6]/20 dark:border-[#f87171] dark:bg-[#3b1214]/40"
                  : "border-[#5c6b62] dark:border-[#768f84]"
              )}
            >
              <SelectValue placeholder="Pilih fakultas" />
            </SelectTrigger>
            <SelectContent>
              {FAKULTAS_LIST.map((fak) => (
                <SelectItem key={fak} value={fak}>
                  {fak}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fakultas && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.fakultas}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-1" : "sm:col-span-1 lg:col-span-4"}>
          <label htmlFor="field-jurusan" className={labelClasses}>
            Program Studi / Jurusan <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <input
            id="field-jurusan"
            type="text"
            placeholder="Contoh: Sistem Informasi"
            value={formData.jurusan}
            onChange={(e) => updateField("jurusan", e.target.value)}
            className={inputClasses(!!errors.jurusan)}
          />
          {errors.jurusan && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.jurusan}
            </p>
          )}
        </div>

        <div className={isInline ? "sm:col-span-2" : "sm:col-span-2 lg:col-span-3"}>
          <label htmlFor="field-angkatan" className={labelClasses}>
            Tahun Angkatan <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <Select
            value={formData.angkatan}
            onValueChange={(val) => updateField("angkatan", val)}
          >
            <SelectTrigger
              id="field-angkatan"
              aria-label="Tahun Angkatan"
              className={cn(
                "w-full min-h-[44px] h-[44px] cursor-pointer py-2 px-3.5 rounded-lg border bg-[#ffffff] hover:border-[#3c4a42] text-[14px] text-[#191c1e] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:border-[#a8bab0]",
                errors.angkatan
                  ? "border-[#ba1a1a] bg-[#ffdad6]/20 dark:border-[#f87171] dark:bg-[#3b1214]/40"
                  : "border-[#5c6b62] dark:border-[#768f84]"
              )}
            >
              <SelectValue placeholder="Pilih angkatan" />
            </SelectTrigger>
            <SelectContent>
              {ANGKATAN_LIST.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.angkatan && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.angkatan}
            </p>
          )}
        </div>

        {/* Row 4: Alamat Domisili (12) */}
        <div className={isInline ? "sm:col-span-2" : "sm:col-span-2 lg:col-span-12"}>
          <label htmlFor="field-alamat" className={labelClasses}>
            Alamat Domisili Lengkap <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
          </label>
          <textarea
            id="field-alamat"
            rows={2}
            placeholder="Tuliskan alamat tempat tinggal saat ini secara lengkap..."
            value={formData.alamat}
            onChange={(e) => updateField("alamat", e.target.value)}
            className={inputClasses(!!errors.alamat) + " min-h-[58px] resize-none"}
          />
          {errors.alamat && (
            <p className="text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5] mt-1">
              {errors.alamat}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
