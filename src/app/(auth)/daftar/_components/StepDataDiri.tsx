"use client";

import React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FormData, Errors, FAKULTAS_LIST, ANGKATAN_LIST, inputClasses } from "./types";

interface StepDataDiriProps {
  formData: FormData;
  errors: Errors;
  updateField: (field: keyof FormData, value: string | File | null | boolean) => void;
  firstInputRef: React.RefObject<any>;
}

export default function StepDataDiri({ formData, errors, updateField, firstInputRef }: StepDataDiriProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      <h2 className="font-sans text-[24px] md:text-[32px] md:leading-[40px] font-semibold text-[#191c1e] mb-[16px]">
        Personal Information
      </h2>
      <p className="font-sans text-[14px] leading-[20px] text-[#3c4a42] mb-[24px]">
        Please fill out your personal details accurately to proceed with the registration.
      </p>

      <form className="space-y-[24px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Full Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              placeholder="e.g. John Doe"
              value={formData.namaLengkap}
              onChange={(e) => updateField("namaLengkap", e.target.value)}
              className={inputClasses(!!errors.namaLengkap)}
            />
            {errors.namaLengkap && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.namaLengkap}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              NIM (Nomor Induk Mahasiswa) <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              maxLength={15}
              placeholder="e.g. 231402011"
              value={formData.nim}
              onChange={(e) => updateField("nim", e.target.value.replace(/\D/g, ""))}
              className={inputClasses(!!errors.nim)}
            />
            {errors.nim && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.nim}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Email Address <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClasses(!!errors.email)}
            />
            {errors.email && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.email}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Phone Number <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42] text-[14px] font-sans">+62</span>
              <input
                type="tel"
                placeholder="812-3456-7890"
                maxLength={15}
                value={formData.noTelepon}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '').substring(0, 13);
                  let formatted = val;
                  if (val.length > 3 && val.length <= 7) formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                  else if (val.length > 7) formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
                  updateField("noTelepon", formatted);
                }}
                className={inputClasses(!!errors.noTelepon) + " pl-[44px]"}
              />
            </div>
            {errors.noTelepon && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.noTelepon}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Place of Birth <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              placeholder="City of birth"
              value={formData.tempatLahir}
              onChange={(e) => updateField("tempatLahir", e.target.value)}
              className={inputClasses(!!errors.tempatLahir)}
            />
            {errors.tempatLahir && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.tempatLahir}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Date of Birth <span className="text-[#ba1a1a]">*</span>
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto py-[10px] px-[16px] rounded-[10px] border text-[#191c1e]",
                    !formData.tanggalLahir && "text-muted-foreground",
                    errors.tanggalLahir ? "border-[#ba1a1a] bg-[#ffdad6]/20" : "border-[#bbcabf] bg-[#ffffff] hover:border-[#6c7a71]"
                  )}
                >
                  <CalendarIcon className="mr-[8px] h-4 w-4" />
                  {formData.tanggalLahir ? format(new Date(formData.tanggalLahir), "PPP", { locale: id }) : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 text-[#191c1e]" align="start">
                <Calendar
                  mode="single"
                  selected={formData.tanggalLahir ? new Date(formData.tanggalLahir) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const offset = date.getTimezoneOffset();
                      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                      updateField("tanggalLahir", adjustedDate.toISOString().split('T')[0]);
                      setIsCalendarOpen(false);
                    } else {
                      updateField("tanggalLahir", "");
                    }
                  }}
                  classNames={{
                    day_selected: "bg-[#006c49] text-white hover:bg-[#006c49] hover:text-white focus:bg-[#006c49] focus:text-white",
                    day_today: "bg-[#bbcabf]/30 text-[#191c1e]",
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.tanggalLahir && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.tanggalLahir}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Gender <span className="text-[#ba1a1a]">*</span>
            </label>
            <Select
              value={formData.jenisKelamin}
              onValueChange={(val) => updateField("jenisKelamin", val)}
            >
              <SelectTrigger className={cn("w-full h-auto py-[10px] px-[16px] rounded-[10px] border bg-[#ffffff] hover:border-[#6c7a71] text-[#191c1e]", errors.jenisKelamin ? "border-[#ba1a1a] bg-[#ffdad6]/20" : "border-[#bbcabf]")}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="text-[#191c1e]">
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            {errors.jenisKelamin && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.jenisKelamin}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Fakultas <span className="text-[#ba1a1a]">*</span>
            </label>
            <Select
              value={formData.fakultas}
              onValueChange={(val) => updateField("fakultas", val)}
            >
              <SelectTrigger className={cn("w-full h-auto py-[10px] px-[16px] rounded-[10px] border bg-[#ffffff] hover:border-[#6c7a71] text-[#191c1e]", errors.fakultas ? "border-[#ba1a1a] bg-[#ffdad6]/20" : "border-[#bbcabf]")}>
                <SelectValue placeholder="Pilih Fakultas" />
              </SelectTrigger>
              <SelectContent className="text-[#191c1e]">
                {FAKULTAS_LIST.map((fak) => (
                  <SelectItem key={fak} value={fak}>
                    {fak}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fakultas && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.fakultas}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Program Studi / Jurusan <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sistem Informasi"
              value={formData.jurusan}
              onChange={(e) => updateField("jurusan", e.target.value)}
              className={inputClasses(!!errors.jurusan)}
            />
            {errors.jurusan && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.jurusan}</p>}
          </div>
          <div>
            <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
              Tahun Angkatan <span className="text-[#ba1a1a]">*</span>
            </label>
            <Select
              value={formData.angkatan}
              onValueChange={(val) => updateField("angkatan", val)}
            >
              <SelectTrigger className={cn("w-full h-auto py-[10px] px-[16px] rounded-[10px] border bg-[#ffffff] hover:border-[#6c7a71] text-[#191c1e]", errors.angkatan ? "border-[#ba1a1a] bg-[#ffdad6]/20" : "border-[#bbcabf]")}>
                <SelectValue placeholder="Pilih Angkatan" />
              </SelectTrigger>
              <SelectContent className="text-[#191c1e]">
                {ANGKATAN_LIST.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.angkatan && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.angkatan}</p>}
          </div>
        </div>

        <div>
          <label className="block font-sans text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#191c1e] mb-[4px]">
            Residential Address <span className="text-[#ba1a1a]">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Enter your full address here..."
            value={formData.alamat}
            onChange={(e) => updateField("alamat", e.target.value)}
            className={inputClasses(!!errors.alamat) + " resize-none"}
          ></textarea>
          {errors.alamat && <p className="text-[14px] text-[#ba1a1a] mt-[4px]">{errors.alamat}</p>}
        </div>
      </form>
    </div>
  );
}
