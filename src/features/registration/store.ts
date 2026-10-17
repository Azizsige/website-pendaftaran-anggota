import { create } from "zustand";
import type {
  FormData as RegistrationFormData,
  Errors,
} from "./types";
import { initialFormData } from "./types";
import {
  fetchRegistrationConfig,
  checkApplicantDuplicate,
  submitApplicantRegistration,
  type SubmitRegistrationResult,
} from "./service";
import { validateStep1Form } from "./schemas";

interface RegistrationState {
  currentStep: number;
  formData: RegistrationFormData;
  errors: Errors;
  isSubmitting: boolean;
  isValidating: boolean;
  isImageValid: boolean;
  isReapplying: boolean;

  // Settings
  reqKtm: boolean;
  reqFoto: boolean;
  isLoadingSettings: boolean;
  isRegistrationOpen: boolean;
  regDateFrom: Date | null;
  regDateTo: Date | null;
  maxQuota: number;
  currentQuotaCount: number;

  // Computed Status
  regStatus: string;
  closedMessage: string;
  closedTitle: string;

  // Actions
  updateField: (
    field: keyof RegistrationFormData,
    value: string | File | null | boolean
  ) => void;
  setIsImageValid: (val: boolean) => void;
  setIsValidating: (val: boolean) => void;
  setIsReapplying: (val: boolean) => void;
  resetForm: () => void;
  fetchSettings: () => Promise<void>;
  handleNext: (
    scrollToError: () => void
  ) => Promise<{ success: boolean; error?: string } | void>;
  handlePrev: () => void;
  handleSubmit: (
    onSuccess: () => void
  ) => Promise<SubmitRegistrationResult | void>;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  isValidating: false,
  isImageValid: false,
  isReapplying: false,

  reqKtm: true,
  reqFoto: true,
  isLoadingSettings: true,
  isRegistrationOpen: true,
  regDateFrom: null,
  regDateTo: null,
  maxQuota: 0,
  currentQuotaCount: 0,

  regStatus: "OPEN",
  closedMessage: "",
  closedTitle: "Pendaftaran Ditutup",

  updateField: (field, value) => {
    set((state) => {
      const newFormData = { ...state.formData, [field]: value };
      const newErrors = { ...state.errors };
      if (newErrors[field]) delete newErrors[field];
      return { formData: newFormData, errors: newErrors };
    });
  },

  setIsImageValid: (val) => set({ isImageValid: val }),
  setIsValidating: (val) => set({ isValidating: val }),
  setIsReapplying: (val) => set({ isReapplying: val }),

  resetForm: () =>
    set({
      currentStep: 1,
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      isValidating: false,
      isImageValid: false,
    }),

  fetchSettings: async () => {
    set({ isLoadingSettings: true });
    try {
      const config = await fetchRegistrationConfig();
      set({
        ...config,
        isLoadingSettings: false,
      });
    } catch {
      set({ isLoadingSettings: false });
    }
  },

  handleNext: async (scrollToError) => {
    const { currentStep, formData, reqFoto, reqKtm } = get();

    if (currentStep === 1) {
      const { isValid, errors: validationErrors } = validateStep1Form(
        formData as unknown as Record<string, unknown>
      );

      if (!isValid) {
        set({ errors: validationErrors });
        scrollToError();
        return { success: false };
      }

      set({ isSubmitting: true });
      try {
        const duplicateCheck = await checkApplicantDuplicate(
          formData.nim,
          formData.email
        );
        if (duplicateCheck.isDuplicate) {
          set({
            isSubmitting: false,
            errors: {
              nim: duplicateCheck.error?.includes("NIM")
                ? duplicateCheck.error
                : undefined,
              email:
                duplicateCheck.error?.includes("email") ||
                duplicateCheck.error?.includes("Email")
                  ? duplicateCheck.error
                  : undefined,
            },
          });
          scrollToError();
          return { success: false, error: duplicateCheck.error };
        }
      } catch {
        set({ isSubmitting: false });
        return {
          success: false,
          error: "Gagal memverifikasi data ke server.",
        };
      }

      set({
        currentStep: reqFoto || reqKtm ? 2 : 3,
        errors: {},
        isSubmitting: false,
      });
      return { success: true };
    }

    if (currentStep === 2) {
      const errs: Errors = {};
      if (reqFoto && !formData.pasFoto)
        errs.pasFoto = "Pas foto wajib diupload";
      if (reqKtm && !formData.fotoKTM)
        errs.fotoKTM = "Foto KTM wajib diupload";

      if (Object.keys(errs).length === 0) {
        set({ currentStep: 3, errors: {} });
        return { success: true };
      } else {
        set({ errors: errs });
        return { success: false };
      }
    }
  },

  handlePrev: () => {
    const { currentStep, reqFoto, reqKtm } = get();
    if (currentStep === 3 && !(reqFoto || reqKtm)) set({ currentStep: 1 });
    else if (currentStep > 1) set({ currentStep: currentStep - 1 });
  },

  handleSubmit: async (onSuccess) => {
    const { formData, isImageValid } = get();
    if (!formData.persetujuan || !isImageValid) return;

    if (!formData.turnstileToken) {
      return {
        success: false,
        error: "Selesaikan validasi CAPTCHA terlebih dahulu.",
      };
    }

    set({ isSubmitting: true });
    try {
      const result = await submitApplicantRegistration(formData);
      if (!result.success) {
        set({ isSubmitting: false });
        return result;
      }
      set({ isSubmitting: false });
      onSuccess();
      return result;
    } catch {
      set({ isSubmitting: false });
      return {
        success: false,
        error: "Terjadi kesalahan sistem saat memverifikasi data.",
      };
    }
  },
}));
