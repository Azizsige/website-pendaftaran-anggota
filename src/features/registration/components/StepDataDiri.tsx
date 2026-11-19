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
  "block font-sans text-[13px] leading-[18px] font-semibold text-[#191c1e] dark:text-[#e9f1ee]";

const errorClasses =
  "text-[12px] leading-tight text-[#ba1a1a] dark:text-[#fca5a5]";

const selectTriggerClasses = (hasError: boolean) =>
  cn(
    "w-full min-h-[44px] h-[44px] cursor-pointer py-2 px-3 rounded-[9px] border bg-[#ffffff] hover:border-[#3c4a42] text-[16px] sm:text-[14px] text-[#191c1e] dark:bg-[#1a2824] dark:text-[#e9f1ee] dark:hover:border-[#8aa098] focus:ring-[3px] focus:ring-[#006c49]/25 dark:focus:ring-[#34d399]/25",
    hasError
      ? "border-[#ba1a1a] bg-[#ffdad6]/20 dark:border-[#f87171] dark:bg-[#3b1214]/40"
      : "border-[#5c6b62] dark:border-[#6c847b]"
  );

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
          <h2 className="font-sans text-xl md:text-2xl font-semibold text-[#191c1e] dark:text-[#e9f1ee] mb-1">
            Informasi data diri &amp; akademik
          </h2>
          <p className="font-sans text-[13px] leading-[19px] text-[#3c4a42] dark:text-[#9fb3ac] mb-4">
            Isi sesuai Kartu Tanda Mahasiswa (KTM) yang masih aktif.
          </p>
        </>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        noValidate
        className={
          isInline
            ? "grid grid-cols-1 gap-y-5"
            : "grid grid-cols-1 lg:grid-cols-2 gap-y-5 lg:gap-y-0 lg:gap-x-8"
        }
      >
        {/* Left Panel: Identitas & kontak */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <h2 className="font-sans text-[13px] font-bold text-[#006c49] dark:text-[#34d399]">
            Identitas &amp; kontak
          </h2>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label htmlFor="field-nama-lengkap" className={labelClasses}>
              Nama lengkap <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
            </label>
            <input
              id="field-nama-lengkap"
              ref={firstInputRef}
              type="text"
              autoComplete="name"
              placeholder="Sesuai KTM"
              value={formData.namaLengkap}
              onChange={(e) => updateField("namaLengkap", e.target.value)}
              className={inputClasses(!!errors.namaLengkap)}
            />
            {errors.namaLengkap && <p className={errorClasses}>{errors.namaLengkap}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="field-tempat-lahir" className={labelClasses}>
                Tempat lahir <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
              </label>
              <input
                id="field-tempat-lahir"
                type="text"
                placeholder="Contoh: Surabaya"
                value={formData.tempatLahir}
                onChange={(e) => updateField("tempatLahir", e.target.value)}
                className={inputClasses(!!errors.tempatLahir)}
              />
              {errors.tempatLahir && <p className={errorClasses}>{errors.tempatLahir}</p>}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="field-tanggal-lahir" className={labelClasses}>
                Tanggal lahir <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="field-tanggal-lahir"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full min-h-[44px] h-[44px] cursor-pointer justify-between text-left font-normal py-2 px-3 rounded-[9px] border text-[16px] sm:text-[14px] text-[#191c1e] dark:text-[#e9f1ee]",
                      !formData.tanggalLahir && "text-[#5c6b62] dark:text-[#8aa098]",
                      errors.tanggalLahir
                        ? "border-[#ba1a1a] bg-[#ffdad6]/20 dark:border-[#f87171] dark:bg-[#3b1214]/40"
                        : "border-[#5c6b62] bg-[#ffffff] hover:border-[#3c4a42] dark:border-[#6c847b] dark:bg-[#1a2824] dark:hover:border-[#8aa098]"
                    )}
                  >
                    <span className="truncate">
                      {formData.tanggalLahir ? formatDate(formData.tanggalLahir) : "Pilih tanggal"}
                    </span>
                    <CalendarIcon className="ml-2 h-4 w-4 shrink-0 text-[#4b5850] dark:text-[#9fb3ac]" aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 text-[#191c1e] dark:text-[#e9f1ee]" align="start">
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
                        "bg-[#006c49] dark:bg-[#0f7a58] text-white hover:bg-[#006c49] hover:text-white focus:bg-[#006c49] focus:text-white",
                      day_today:
                        "bg-[#bbcabf]/30 text-[#191c1e] dark:bg-[#22322d] dark:text-[#6ee7b7]",
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.tanggalLahir && <p className={errorClasses}>{errors.tanggalLahir}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="field-jenis-kelamin" className={labelClasses}>
                Jenis kelamin <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
              </label>
              <Select
                value={formData.jenisKelamin}
                onValueChange={(val) => updateField("jenisKelamin", val)}
              >
                <SelectTrigger
                  id="field-jenis-kelamin"
                  aria-label="Jenis kelamin"
                  className={selectTriggerClasses(!!errors.jenisKelamin)}
                >
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {errors.jenisKelamin && <p className={errorClasses}>{errors.jenisKelamin}</p>}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="field-no-telepon" className={labelClasses}>
                Nomor telepon <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
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
              {errors.noTelepon && <p className={errorClasses}>{errors.noTelepon}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label htmlFor="field-email" className={labelClasses}>
              Email <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClasses(!!errors.email)}
            />
            {errors.email && <p className={errorClasses}>{errors.email}</p>}
          </div>
        </div>

        {/* Right Panel: Akademik & domisili */}
        <div
          className={
            isInline
              ? "flex flex-col gap-3.5 min-w-0 pt-5 border-t border-[#5c6b62]/20 dark:border-[#2a3b36]"
              : "flex flex-col gap-3.5 min-w-0 pt-5 border-t border-[#5c6b62]/20 dark:border-[#2a3b36] lg:pt-0 lg:border-t-0 lg:pl-8 lg:border-l lg:border-[#5c6b62]/20 dark:lg:border-[#2a3b36]"
          }
        >
          <h2 className="font-sans text-[13px] font-bold text-[#006c49] dark:text-[#34d399]">
            Akademik &amp; domisili
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="field-nim" className={labelClasses}>
                NIM <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
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
              {errors.nim && <p className={errorClasses}>{errors.nim}</p>}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="field-angkatan" className={labelClasses}>
                Tahun angkatan <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
              </label>
              <Select
                value={formData.angkatan}
                onValueChange={(val) => updateField("angkatan", val)}
              >
                <SelectTrigger
                  id="field-angkatan"
                  aria-label="Tahun angkatan"
                  className={selectTriggerClasses(!!errors.angkatan)}
                >
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  {ANGKATAN_LIST.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.angkatan && <p className={errorClasses}>{errors.angkatan}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
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
                className={selectTriggerClasses(!!errors.fakultas)}
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
            {errors.fakultas && <p className={errorClasses}>{errors.fakultas}</p>}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label htmlFor="field-jurusan" className={labelClasses}>
              Program studi <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
            </label>
            <input
              id="field-jurusan"
              type="text"
              placeholder="Contoh: Sistem Informasi"
              value={formData.jurusan}
              onChange={(e) => updateField("jurusan", e.target.value)}
              className={inputClasses(!!errors.jurusan)}
            />
            {errors.jurusan && <p className={errorClasses}>{errors.jurusan}</p>}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <label htmlFor="field-alamat" className={labelClasses}>
              Alamat domisili lengkap <span className="text-[#ba1a1a] dark:text-[#f87171]">*</span>
            </label>
            <textarea
              id="field-alamat"
              rows={2}
              placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan, kota"
              value={formData.alamat}
              onChange={(e) => updateField("alamat", e.target.value)}
              className={inputClasses(!!errors.alamat) + " flex-1 min-h-[44px] py-2.5 resize-none"}
            />
            {errors.alamat && <p className={errorClasses}>{errors.alamat}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}
