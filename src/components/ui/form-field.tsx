import * as React from "react";

import { cn } from "@/lib/utils";

/** Kelas input standar; `hasError` menukar border/ring menjadi merah. */
export function fieldClass(hasError?: boolean, extra?: string) {
  return cn(
    "w-full rounded-lg border bg-surface-container-low px-4 py-2.5 text-sm text-on-surface transition-all focus:outline-none focus:ring-2",
    hasError
      ? "border-error focus:border-error focus:ring-error/50"
      : "border-outline-variant/30 focus:border-primary focus:ring-primary/50",
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

/** Pembungkus label + kontrol + pesan error, dipakai semua form. */
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
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-on-surface">
        {label}
        {required && (
          <span className="text-error" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-on-surface-variant">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-error">
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
}

export function TextField({
  label,
  error,
  hint,
  required,
  id,
  inputRef,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <FormField label={label} htmlFor={inputId} required={required} error={error} hint={hint}>
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
