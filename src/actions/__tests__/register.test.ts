import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitRegistration } from '../register';
import { prisma } from '@/lib/prisma';

// 1. KITA MOCK (Palsukan) DATABASE PRISMA 
// Tujuannya agar unit test kita tidak beneran nyimpan data sampah ke database asli
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      systemSetting: { findUnique: vi.fn() },
      memberProfile: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
      user: { create: vi.fn(), findUnique: vi.fn() },
      // Mock khusus untuk Transaction
      $transaction: vi.fn()
    }
  };
});

describe('Server Action: submitRegistration (Keamanan & Kuota)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. [Security Bypass] Harus otomatis menolak jika ada data wajib yang kosong', async () => {
    const formData = new FormData();
    formData.append('email', 'budi@gmail.com');
    formData.append('namaLengkap', 'Budi');
    // SENGAJA NIM, FAKULTAS, JURUSAN DIKOSONGKAN

    const result = await submitRegistration(formData);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Manipulasi form terdeteksi');
  });

  it('2. [Duplikasi] Harus menolak jika email atau NIM sudah pernah terdaftar', async () => {
    const formData = new FormData();
    formData.append('nim', '231402015');
    formData.append('email', 'sudahada@gmail.com');
    formData.append('namaLengkap', 'Budi');
    formData.append('fakultas', 'FASILKOM');
    formData.append('jurusan', 'TI');

    // Simulasikan seolah-olah fungsi cek duplikat menemukan email ini di database
    // @ts-ignore
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'sudahada@gmail.com' });

    const result = await submitRegistration(formData);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Email ini sudah terdaftar');
  });

  it('3. [Race Condition] Harus melempar error QUOTA_FULL jika dalam 1 detik yang sama kuota keburu habis', async () => {
    const formData = new FormData();
    formData.append('nim', '123456');
    formData.append('email', 'baru@gmail.com');
    formData.append('namaLengkap', 'Pendaftar Baru');
    formData.append('fakultas', 'FASILKOM');
    formData.append('jurusan', 'TI');

    // Simulasikan database mengizinkan tahap duplikasi (lolos)
    // @ts-ignore
    prisma.user.findUnique.mockResolvedValueOnce(null);
    // @ts-ignore
    prisma.memberProfile.findUnique.mockResolvedValueOnce(null);

    // Simulasikan setting kuota maksimal = 10
    // @ts-ignore
    prisma.systemSetting.findUnique.mockResolvedValueOnce({ value: '10' });

    // SIMULASIKAN RACE CONDITION DI DALAM TRANSACTION!
    // Kita paksa $transaction untuk melempar error "QUOTA_FULL" (seolah-olah pas dia mau nyimpan, kuotanya jadi 10)
    // @ts-ignore
    prisma.$transaction.mockRejectedValueOnce(new Error('QUOTA_FULL'));

    const result = await submitRegistration(formData);
    
    // Sistem harusnya menangkap error tersebut dan memberikan respon gagal dengan pesan kekalahan
    expect(result.success).toBe(false);
    expect(result.error).toContain('kurang cepat');
    expect(result.error).toContain('Sisa kuota baru saja diisi');
  });
});
