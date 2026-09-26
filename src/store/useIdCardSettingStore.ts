import { create } from 'zustand';
import { getSystemSettings, updateMultipleSettings } from '@/app/actions/setting-actions';
import { toast } from 'sonner';

export interface IdCardFormData {
  kta_bg_front_url: string;
  kta_bg_back_url: string;
  kta_org_name: string;
  kta_member_prefix: string;
  kta_validity_months: string;
  kta_show_photo: string;
  kta_show_name: string;
  kta_show_nim: string;
  kta_show_member_id: string;
  kta_show_faculty: string;
  kta_show_major: string;
  kta_show_validity: string;
  kta_show_qr: string;
  kta_signature_url: string;
  kta_signature_name: string;
  kta_terms: string; // JSON string of string[]
}

interface IdCardSettingStore {
  formData: IdCardFormData;
  isLoading: boolean;
  isSaving: boolean;
  frontBgPreview: string | null;
  backBgPreview: string | null;
  signaturePreview: string | null;
  loadSettings: () => Promise<void>;
  handleChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleFrontBgUpload: (file: File) => void;
  handleBackBgUpload: (file: File) => void;
  handleSignatureUpload: (file: File) => void;
  handleSave: () => Promise<void>;
}

export const useIdCardSettingStore = create<IdCardSettingStore>((set, get) => ({
  formData: {
    kta_bg_front_url: '',
    kta_bg_back_url: '',
    kta_org_name: 'BEM FT UNSRI',
    kta_member_prefix: 'BEM-2026-',
    kta_validity_months: '12',
    kta_show_photo: 'true',
    kta_show_name: 'true',
    kta_show_nim: 'true',
    kta_show_member_id: 'true',
    kta_show_faculty: 'false',
    kta_show_major: 'false',
    kta_show_validity: 'true',
    kta_show_qr: 'true',
    kta_signature_url: '',
    kta_signature_name: 'M. Hafiz Al-Fath',
    kta_terms: JSON.stringify([
      "Kartu ini merupakan identitas resmi anggota Badan Eksekutif Mahasiswa Fakultas Teknik Universitas Sriwijaya.",
      "Kartu wajib digunakan dan ditunjukkan selama menjadi pengurus maupun mengikuti kegiatan resmi organisasi.",
      "Kartu tidak boleh dipindahtangankan atau disalahgunakan oleh pihak lain dalam bentuk apapun.",
      "Jika kartu hilang atau rusak, segera laporkan kepada Sekretariat BEM FT UNSRI untuk penerbitan ulang.",
      "Kartu harus dikembalikan atau dinonaktifkan apabila masa kepengurusan/keanggotaan telah berakhir."
    ]),
  },
  isLoading: true,
  isSaving: false,
  frontBgPreview: null,
  backBgPreview: null,
  signaturePreview: null,

  loadSettings: async () => {
    try {
      const res = await getSystemSettings();
      if (res.success && res.data) {
        const data = get().formData;
        const newFormData = { ...data };
        let loadedFront = null, loadedBack = null, loadedSignature = null;
        
        res.data.forEach((setting: any) => {
          if (setting.key in newFormData) {
            (newFormData as any)[setting.key] = setting.value;
            if (setting.key === 'kta_bg_front_url') loadedFront = setting.value;
            if (setting.key === 'kta_bg_back_url') loadedBack = setting.value;
            if (setting.key === 'kta_signature_url') loadedSignature = setting.value;
          }
        });
        set({ formData: newFormData, frontBgPreview: loadedFront, backBgPreview: loadedBack, signaturePreview: loadedSignature });
      }
    } catch (error) {
      console.error("Failed to load ID card settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  handleChange: (name, value) => {
    set((state) => ({ formData: { ...state.formData, [name]: value } }));
  },

  handleCheckboxChange: (name, checked) => {
    set((state) => ({ formData: { ...state.formData, [name]: checked ? 'true' : 'false' } }));
  },

  handleFrontBgUpload: (file) => {
    if (file.size > 2097152) { // 2MB
      toast.error("Ukuran background terlalu besar! Maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      set((state) => ({ frontBgPreview: b64, formData: { ...state.formData, kta_bg_front_url: b64 } }));
    };
    reader.readAsDataURL(file);
  },

  handleBackBgUpload: (file) => {
    if (file.size > 2097152) { // 2MB
      toast.error("Ukuran background terlalu besar! Maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      set((state) => ({ backBgPreview: b64, formData: { ...state.formData, kta_bg_back_url: b64 } }));
    };
    reader.readAsDataURL(file);
  },

  handleSignatureUpload: (file) => {
    if (file.size > 2097152) { // 2MB
      toast.error("Ukuran file tanda tangan terlalu besar! Maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      set((state) => ({ signaturePreview: b64, formData: { ...state.formData, kta_signature_url: b64 } }));
    };
    reader.readAsDataURL(file);
  },

  handleSave: async () => {
    const { formData } = get();

    set({ isSaving: true });
    try {
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({ key, value }));
      const res = await updateMultipleSettings(settingsToUpdate);
      if (res.success) {
        toast.success("Pengaturan ID Card berhasil disimpan");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else toast.error(res.message || "Gagal menyimpan pengaturan");
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      set({ isSaving: false });
    }
  }
}));
