import { create } from 'zustand';

interface CekStatusState {
  nim: string;
  email: string;
  isLoading: boolean;
  isDownloading: boolean;
  isUploadingPhoto: boolean;
  error: string;
  statusData: any;
  setNim: (nim: string) => void;
  setEmail: (email: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsDownloading: (isDownloading: boolean) => void;
  setIsUploadingPhoto: (isUploadingPhoto: boolean) => void;
  setError: (error: string) => void;
  setStatusData: (statusData: any) => void;
  reset: () => void;
}

export const useCekStatusStore = create<CekStatusState>((set) => ({
  nim: '',
  email: '',
  isLoading: false,
  isDownloading: false,
  isUploadingPhoto: false,
  error: '',
  statusData: null,
  setNim: (nim) => set({ nim }),
  setEmail: (email) => set({ email }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setIsUploadingPhoto: (isUploadingPhoto) => set({ isUploadingPhoto }),
  setError: (error) => set({ error }),
  setStatusData: (statusData) => set({ statusData }),
  reset: () => set({ nim: '', email: '', statusData: null, error: '' })
}));
