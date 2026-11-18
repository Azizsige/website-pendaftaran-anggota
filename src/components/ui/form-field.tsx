import * as React from "react";

import { cn } from "@/lib/utils";

/** Kelas input standar Analytix-Emerald; `hasError` menukar border/ring menjadi merah. */
export function fieldClass(hasError?: boolean, extra?: string) {
  return cn(
    "min-h-[44px] w-full rounded-lg border bg-white dark:bg-[#1a2723] px-3.5 py-2.5 text-sm text-[#0f172a] dark:text-[#eef2f4] placeholder:text-[#64748b] dark:placeholder:text-[#94a89e] transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#f8fafc] dark:disabled:bg-[#131d1a] disabled:text-[#64748b] dark:disabled:text-[#94a89e]",
    hasError
      ? "border-[#dc2626] dark:border-[#f87171] focus:border-[#dc2626] dark:focus:border-[#f87171] focus:ring-[#dc2626]/20 dark:focus:ring-[#f87171]/25"
      : "border-[#85929f] dark:border-[#5f736b] hover:border-[#64748b] dark:hover:border-[#94a89e] focus:border-[#006c49] dark:focus:border-[#34d399] focus:ring-[#006c49]/15 dark:focus:ring-[#34d399]/25",
    extra
  );
}

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** Pembungkus label + kontrol + pesan error, dipakai semua form admin. */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-[#0f172a] dark:text-[#eef2f4]">
        {label}
        {required && (
          <span className="text-[#dc2626] dark:text-[#fca5a5]" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-[#475569] dark:text-[#94a89e]">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-[#dc2626] dark:text-[#fca5a5]">
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  hint?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  wrapperClassName?: string;
}

export function TextField({
  label,
  error,
  hint,
  required,
  id,
  inputRef,
  className,
  wrapperClassName,
  ...props
}: TextFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <input
        id={inputId}
        ref={inputRef}
        required={required}
        aria-invalid={!!error}
        className={fieldClass(!!error, className)}
        {...props}
      />
    </FormField>
  );
}

export interface TextareaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: string;
  error?: string;
  hint?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  className?: string;
  wrapperClassName?: string;
}

export function TextareaField({
  label,
  error,
  hint,
  required,
  id,
  textareaRef,
  className,
  wrapperClassName,
  rows = 3,
  ...props
}: TextareaFieldProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;

  return (
    <FormField
      label={label}
      htmlFor={textareaId}
      required={required}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <textarea
        id={textareaId}
        ref={textareaRef}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={fieldClass(!!error, cn("min-h-[96px] resize-y", className))}
        {...props}
      />
    </FormField>
  );
}

export interface CheckboxFieldProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Kotak centang terstruktur dengan area sentuh minimal 44px dan kontras AA. */
export function CheckboxField({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: CheckboxFieldProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-[#e2e8f0] dark:border-[#3c4d46] bg-white dark:bg-[#1a2723] px-3.5 py-2.5 transition-colors hover:border-[#cbd5e1] dark:hover:border-[#5f736b] hover:bg-[#f8fafc] dark:hover:bg-[#22322d]",
        checked && "border-[#006c49]/35 dark:border-[#34d399]/40 bg-[#e6f4ee]/35 dark:bg-[#0c3528]",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border border-[#85929f] dark:border-[#5f736b] bg-white dark:bg-[#131d1a] accent-[#006c49] dark:accent-[#10b981] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49]/30 dark:focus-visible:ring-[#34d399]/35"
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-[#0f172a] dark:text-[#eef2f4]">{label}</span>
        {description && <span className="text-xs text-[#475569] dark:text-[#94a89e]">{description}</span>}
      </span>
    </label>
  );
}

export interface ToggleSwitchFieldProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Sakelar toggle bergaya Analytix dengan role="switch" aksesibel. */
export function ToggleSwitchField({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleSwitchFieldProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;

  return (
    <div
      className={cn(
        "flex min-h-[56px] items-center justify-between gap-4 rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] bg-[#f8fafc] dark:bg-[#1a2723] px-4 py-3",
        className
      )}
    >
      <label htmlFor={switchId} className="flex flex-1 cursor-pointer flex-col gap-0.5 pr-2">
        <span className="text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">{label}</span>
        {description && <span className="text-xs leading-relaxed text-[#475569] dark:text-[#94a89e]">{description}</span>}
      </label>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#131d1a] disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "border-[#006c49] bg-[#006c49] dark:border-[#057a55] dark:bg-[#057a55]" : "border-[#85929f] dark:border-[#5f736b] bg-[#cbd5e1] dark:bg-[#2a3b34]"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
