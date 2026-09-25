import { create } from 'zustand';
import { getSystemSettings, updateMultipleSettings } from '@/app/actions/setting-actions';
import { toast } from 'sonner';

export interface GeneralFormData {
  org_name: string;
  org_email: string;
  org_description: string;
  org_address: string;
  org_whatsapp: string;
  org_instagram: string;
  org_logo: string;
  org_favicon: string;
}

interface GeneralSettingStore {
  formData: GeneralFormData;
  isLoading: boolean;
  isSaving: boolean;
  emailError: string;
  logoPreview: string | null;
  faviconPreview: string | null;
  loadSettings: () => Promise<void>;
  handleChange: (name: string, value: string) => void;
  handleLogoUpload: (file: File) => void;
  handleFaviconUpload: (file: File) => void;
  handleSave: () => Promise<void>;
}

export const useGeneralSettingStore = create<GeneralSettingStore>((set, get) => ({
  formData: {
    org_name: '', org_email: '', org_description: '',
    org_address: '', org_whatsapp: '', org_instagram: '',
    org_logo: '', org_favicon: '',
  },
  isLoading: true,
  isSaving: false,
  emailError: '',
  logoPreview: null,
  faviconPreview: null,

  loadSettings: async () => {
    try {
      const res = await getSystemSettings();
      if (res.success && res.data) {
        const data = get().formData;
        const newFormData = { ...data };
        let loadedLogo = null, loadedFavicon = null;
        
        res.data.forEach((setting: any) => {
          if (setting.key in newFormData) {
            (newFormData as any)[setting.key] = setting.value;
            if (setting.key === 'org_logo') loadedLogo = setting.value;
            if (setting.key === 'org_favicon') loadedFavicon = setting.value;
          }
        });
        set({ formData: newFormData, logoPreview: loadedLogo, faviconPreview: loadedFavicon });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  handleChange: (name, value) => {
    if (name === 'org_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      set({ emailError: value && !emailRegex.test(value) ? "Format email tidak valid" : "" });
    }
    if (name === 'org_whatsapp') {
      let val = value.replace(/\D/g, '').substring(0, 13);
      let formatted = val;
      if (val.length > 3 && val.length <= 7) formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
      else if (val.length > 7) formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7)}`;
      set((state) => ({ formData: { ...state.formData, [name]: formatted } }));
      return;
    }
    set((state) => ({ formData: { ...state.formData, [name]: value } }));
  },

  handleLogoUpload: (file) => {
    if (file.size > 1048576) {
      toast.error("Ukuran logo terlalu besar! Maksimal 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      set((state) => ({ logoPreview: b64, formData: { ...state.formData, org_logo: b64 } }));
    };
    reader.readAsDataURL(file);
  },

  handleFaviconUpload: (file) => {
    if (file.size > 102400) {
      toast.error("Ukuran favicon terlalu besar! Maksimal 100KB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      set((state) => ({ faviconPreview: b64, formData: { ...state.formData, org_favicon: b64 } }));
    };
    reader.readAsDataURL(file);
  },

  handleSave: async () => {
    const { formData, emailError } = get();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.org_email && !emailRegex.test(formData.org_email)) {
      toast.error("Format email tidak valid! Perbaiki email terlebih dahulu.");
      return;
    }
    if (emailError) {
      toast.error("Ada error di form, mohon periksa kembali.");
      return;
    }

    set({ isSaving: true });
    try {
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({ key, value }));
      const res = await updateMultipleSettings(settingsToUpdate);
      if (res.success) {
        toast.success("Pengaturan berhasil disimpan");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else toast.error(res.message || "Gagal menyimpan pengaturan");
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      set({ isSaving: false });
    }
  }
}));
