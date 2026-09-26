import { create } from "zustand";
import type { FormData as RegistrationFormData, Errors } from "@/app/(auth)/daftar/_components/types";
import { initialFormData } from "@/app/(auth)/daftar/_components/types";
import { getRegistrationQuotaCount, submitRegistration } from "@/actions/register";
import { getSystemSettings } from "@/app/actions/setting-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface RegistrationState {
  currentStep: number;
  formData: RegistrationFormData;
  errors: Errors;
  isSubmitting: boolean;
  isValidating: boolean;
  isImageValid: boolean;

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
  updateField: (field: keyof RegistrationFormData, value: string | File | null | boolean) => void;
  setIsImageValid: (val: boolean) => void;
  setIsValidating: (val: boolean) => void;
  fetchSettings: () => Promise<void>;
  handleNext: (scrollToError: () => void) => void;
  handlePrev: () => void;
  handleSubmit: (onSuccess: () => void) => Promise<void>;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  isValidating: false,
  isImageValid: false,

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

  fetchSettings: async () => {
    set({ isLoadingSettings: true });
    try {
      const [res, quotaRes] = await Promise.all([
        getSystemSettings(),
        getRegistrationQuotaCount()
      ]);
      
      let reqKtm = true, reqFoto = true, isRegistrationOpen = true;
      let regDateFrom: Date | null = null, regDateTo: Date | null = null;
      let maxQuota = 0;

      if (res.success && res.data) {
        for (const setting of res.data) {
          if (setting.key === 'reg_req_ktm') reqKtm = setting.value === 'true';
          if (setting.key === 'reg_req_foto') reqFoto = setting.value === 'true';
          if (setting.key === 'reg_is_active') isRegistrationOpen = setting.value === 'true';
          if (setting.key === 'reg_date_from' && setting.value) regDateFrom = new Date(setting.value);
          if (setting.key === 'reg_date_to' && setting.value) regDateTo = new Date(setting.value);
          if (setting.key === 'reg_max_quota' && setting.value) maxQuota = parseInt(setting.value);
        }
      }

      // Compute status
      let regStatus = "OPEN";
      let closedMessage = "";
      let closedTitle = "Pendaftaran Ditutup";
      const now = new Date();

      if (!isRegistrationOpen) {
        regStatus = "CLOSED_TOGGLE";
        closedMessage = "Mohon maaf, saat ini pendaftaran anggota baru sedang tidak aktif. Silakan kembali lagi nanti atau hubungi administrator untuk informasi lebih lanjut.";
      } else if (regDateFrom && now < regDateFrom) {
        regStatus = "CLOSED_BEFORE";
        closedMessage = `Pendaftaran belum dibuka. Pendaftaran baru akan dimulai pada ${format(regDateFrom, "d MMMM yyyy", { locale: idLocale })}.`;
        closedTitle = "Belum Dibuka";
      } else if (regDateTo && now > regDateTo) {
        regStatus = "CLOSED_AFTER";
        closedMessage = `Mohon maaf, pendaftaran telah ditutup sejak ${format(regDateTo, "d MMMM yyyy", { locale: idLocale })}.`;
        closedTitle = "Pendaftaran Berakhir";
      } else if (maxQuota > 0 && quotaRes.count >= maxQuota) {
        regStatus = "CLOSED_QUOTA";
        closedMessage = `Mohon maaf, kuota pendaftaran telah penuh (Maksimal ${maxQuota} pendaftar). Silakan pantau informasi selanjutnya untuk gelombang pendaftaran berikutnya.`;
        closedTitle = "Kuota Penuh";
      }

      set({
        reqKtm, reqFoto, isRegistrationOpen, regDateFrom, regDateTo, maxQuota,
        currentQuotaCount: quotaRes.count,
        regStatus, closedMessage, closedTitle,
        isLoadingSettings: false
      });
    } catch (error) {
      console.error(error);
      set({ isLoadingSettings: false });
    }
  },

  handleNext: (scrollToError) => {
    const { currentStep, formData, reqFoto, reqKtm } = get();
    const errs: Errors = {};
    
    if (currentStep === 1) {
      if (!formData.namaLengkap.trim()) errs.namaLengkap = "Nama lengkap wajib diisi";
      if (!formData.nim.trim()) errs.nim = "NIM wajib diisi";
      if (!formData.email.trim()) errs.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Format email tidak valid";
      if (!formData.noTelepon.trim()) errs.noTelepon = "No. telepon wajib diisi";
      else if (formData.noTelepon.replace(/\D/g, "").length < 9) errs.noTelepon = "Format no. telepon tidak valid";
      if (!formData.tempatLahir.trim()) errs.tempatLahir = "Tempat lahir wajib diisi";
      if (!formData.tanggalLahir) errs.tanggalLahir = "Tanggal lahir wajib diisi";
      if (!formData.jenisKelamin) errs.jenisKelamin = "Jenis kelamin wajib dipilih";
      if (!formData.alamat.trim()) errs.alamat = "Alamat wajib diisi";
      if (!formData.fakultas) errs.fakultas = "Fakultas wajib dipilih";
      if (!formData.jurusan.trim()) errs.jurusan = "Jurusan wajib diisi";
      if (!formData.angkatan) errs.angkatan = "Angkatan wajib dipilih";

      if (Object.keys(errs).length === 0) {
        set({ currentStep: (reqFoto || reqKtm) ? 2 : 3, errors: {} });
      } else {
        set({ errors: errs });
        scrollToError();
      }
    } else if (currentStep === 2) {
      if (reqFoto && !formData.pasFoto) errs.pasFoto = "Pas foto wajib diupload";
      if (reqKtm && !formData.fotoKTM) errs.fotoKTM = "Foto KTM wajib diupload";
      
      if (Object.keys(errs).length === 0) {
        set({ currentStep: 3, errors: {} });
      } else {
        set({ errors: errs });
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
      toast.error("Selesaikan validasi CAPTCHA terlebih dahulu.");
      return;
    }

    
    set({ isSubmitting: true });
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && typeof value !== 'boolean') {
          if (!(value instanceof File)) form.append(key, String(value));
        }
      });

      const res = await submitRegistration(form);
      if (!res.success) {
        toast.error(res.error || "Gagal melakukan pendaftaran.");
        set({ isSubmitting: false });
        if (res.error?.toLowerCase().includes("kuota")) {
          setTimeout(() => window.location.reload(), 2000);
        }
        return;
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem saat memverifikasi data.");
      set({ isSubmitting: false });
    }
  }
}));
