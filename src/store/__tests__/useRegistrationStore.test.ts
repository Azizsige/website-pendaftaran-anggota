import { describe, it, expect, beforeEach } from 'vitest';
import { useRegistrationStore } from '../useRegistrationStore';
import { initialFormData } from '@/app/(auth)/daftar/_components/types';

describe('useRegistrationStore - Validation & State Logic', () => {
  // Reset store sebelum tiap test berjalan
  beforeEach(() => {
    useRegistrationStore.setState({
      currentStep: 1,
      formData: initialFormData,
      errors: {},
    });
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
});
