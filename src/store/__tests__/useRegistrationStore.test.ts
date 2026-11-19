import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useRegistrationStore } from '../useRegistrationStore';
import { initialFormData } from '@/features/registration/types';
import * as registrationService from '@/features/registration/service';

vi.mock('@/features/registration/service', () => ({
  fetchRegistrationConfig: vi.fn(),
  checkApplicantDuplicate: vi.fn(),
  submitApplicantRegistration: vi.fn(),
}));

describe('useRegistrationStore - Validation & State Logic', () => {
  // Reset store sebelum tiap test berjalan
  beforeEach(() => {
    vi.clearAllMocks();
    useRegistrationStore.setState({
      currentStep: 1,
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      submissionPhase: 'idle',
      isValidating: false,
      isImageValid: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. Harus bisa mengupdate nilai input form dengan benar', () => {
    const { updateField } = useRegistrationStore.getState();
    
    // Simulasikan user mengetik nama
    updateField('namaLengkap', 'John Doe');
    
    // Cek apakah statenya berubah
    expect(useRegistrationStore.getState().formData.namaLengkap).toBe('John Doe');
  });

  it('2. Harus otomatis menghapus pesan error ketika user mulai mengetik ulang di field yang error', () => {
    // Kondisikan seolah-olah sebelumnya ada error di nama lengkap
    useRegistrationStore.setState({ errors: { namaLengkap: 'Nama lengkap wajib diisi' } });
    expect(useRegistrationStore.getState().errors.namaLengkap).toBe('Nama lengkap wajib diisi');

    // Simulasikan user mengetik ulang untuk memperbaiki
    const { updateField } = useRegistrationStore.getState();
    updateField('namaLengkap', 'Budi Santoso');

    // Error harusnya hilang karena user sudah mengetik
    expect(useRegistrationStore.getState().errors.namaLengkap).toBeUndefined();
  });

  it('3. TIDAK BOLEH pindah ke Step 2 jika form di Step 1 masih kosong', () => {
    const { handleNext } = useRegistrationStore.getState();
    
    let isScrollCalled = false;
    const mockScrollToError = () => { isScrollCalled = true };

    // Simulasikan menekan tombol Next dengan form kosong
    handleNext(mockScrollToError);

    const state = useRegistrationStore.getState();
    
    // Pastikan masih nyangkut di step 1
    expect(state.currentStep).toBe(1);
    
    // Pastikan muncul error validasi
    expect(state.errors.namaLengkap).toBe('Nama lengkap wajib diisi');
    expect(state.errors.email).toBe('Email wajib diisi');
    
    // Pastikan fungsi scroll ke error terpanggil
    expect(isScrollCalled).toBe(true);
  });

  it('4. Harus memvalidasi format email dengan ketat', () => {
    const { updateField, handleNext } = useRegistrationStore.getState();
    
    // User memasukkan email palsu tanpa domain
    updateField('email', 'email-palsu-tanpa-domain');
    handleNext(() => {});
    
    expect(useRegistrationStore.getState().errors.email).toBe('Format email tidak valid');

    // User memasukkan email yang benar
    updateField('email', 'budi.santoso@gmail.com');
    handleNext(() => {});
    
    // Error di email harus hilang (meskipun error lain masih ada karena form belum lengkap)
    expect(useRegistrationStore.getState().errors.email).toBeUndefined();
  });

  it('5. Harus mempertahankan modal ke fase redirecting sebelum memanggil onSuccess saat submit berhasil', async () => {
    vi.useFakeTimers();

    let resolveSubmit!: (value: { success: boolean }) => void;
    const submitPromise = new Promise<{ success: boolean }>((resolve) => {
      resolveSubmit = resolve;
    });
    vi.mocked(registrationService.submitApplicantRegistration).mockReturnValueOnce(submitPromise);

    useRegistrationStore.setState({
      currentStep: 3,
      isImageValid: true,
      formData: {
        ...initialFormData,
        persetujuan: true,
        turnstileToken: 'mock-turnstile-token',
      },
    });

    const onSuccess = vi.fn();
    const { handleSubmit } = useRegistrationStore.getState();

    const pendingSubmit = handleSubmit(onSuccess, 1200);
    expect(useRegistrationStore.getState().submissionPhase).toBe('submitting');
    expect(useRegistrationStore.getState().isSubmitting).toBe(true);

    resolveSubmit({ success: true });
    await vi.advanceTimersByTimeAsync(100);

    // Tetap di modal fase redirecting sebelum navigasi dijalankan agar Step 3 tidak berkedip kembali.
    expect(useRegistrationStore.getState().submissionPhase).toBe('redirecting');
    expect(useRegistrationStore.getState().isSubmitting).toBe(true);
    expect(onSuccess).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1100);
    await pendingSubmit;

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(useRegistrationStore.getState().submissionPhase).toBe('redirecting');
    expect(useRegistrationStore.getState().isSubmitting).toBe(true);

    useRegistrationStore.getState().resetForm();
    expect(useRegistrationStore.getState().submissionPhase).toBe('idle');
    expect(useRegistrationStore.getState().isSubmitting).toBe(false);
  });

  it('6. Harus mengembalikan submissionPhase ke idle dan tidak memanggil onSuccess saat submit gagal', async () => {
    vi.mocked(registrationService.submitApplicantRegistration).mockResolvedValueOnce({
      success: false,
      error: 'Gagal menyimpan data.',
    });

    useRegistrationStore.setState({
      currentStep: 3,
      isImageValid: true,
      formData: {
        ...initialFormData,
        persetujuan: true,
        turnstileToken: 'mock-turnstile-token',
      },
    });

    const onSuccess = vi.fn();
    const res = await useRegistrationStore.getState().handleSubmit(onSuccess, 0);

    expect(res).toEqual({ success: false, error: 'Gagal menyimpan data.' });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(useRegistrationStore.getState().submissionPhase).toBe('idle');
    expect(useRegistrationStore.getState().isSubmitting).toBe(false);
  });
});
