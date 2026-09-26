import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAdmin, updateAdmin, deleteAdmin, getAdmins } from '../admin-management';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password')
  }
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_noStore: vi.fn()
}));

describe('Server Action: Admin Management (RBAC & Logic)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdmins', () => {
    it('Harus menolak akses jika role bukan OWNER atau SUPER_ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'COORDINATOR' } } as any);
      const res = await getAdmins();
      expect(res.data).toEqual([]);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('Harus mengizinkan OWNER untuk melihat admin', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'OWNER' } } as any);
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([{ id: '1', name: 'Admin 1' }] as any);
      const res = await getAdmins();
      expect(res.data).toHaveLength(1);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('createAdmin', () => {
    it('SUPER_ADMIN tidak bisa membuat OWNER atau SUPER_ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'SUPER_ADMIN' } } as any);
      const data = { fullName: 'Test', email: 'test@g.com', role: 'SUPER_ADMIN' };
      const res = await createAdmin(data);
      expect(res.success).toBe(false);
      expect(res.error).toContain('SUPER_ADMIN cannot create SUPER_ADMIN or OWNER roles');
    });

    it('OWNER bisa membuat SUPER_ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'OWNER' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const data = { fullName: 'Test', email: 'test@g.com', role: 'SUPER_ADMIN' };
      const res = await createAdmin(data);
      expect(res.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('Gagal jika email sudah terdaftar', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'OWNER' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1' } as any);
      const data = { fullName: 'Test', email: 'test@g.com', role: 'STAFF' };
      const res = await createAdmin(data);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Email sudah terdaftar');
    });
  });

  describe('updateAdmin', () => {
    it('SUPER_ADMIN tidak bisa edit OWNER', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'SUPER_ADMIN', id: '2' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1', role: 'OWNER' } as any);
      
      const res = await updateAdmin('1', { fullName: 'A', email: 'a@a.com', role: 'STAFF', status: 'ACTIVE' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Cannot edit OWNER');
    });

    it('SUPER_ADMIN tidak bisa edit SUPER_ADMIN lain', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'SUPER_ADMIN', id: '2' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '3', role: 'SUPER_ADMIN' } as any);
      
      const res = await updateAdmin('3', { fullName: 'A', email: 'a@a.com', role: 'STAFF', status: 'ACTIVE' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Cannot edit other SUPER_ADMINs');
    });
  });

  describe('deleteAdmin', () => {
    it('Tidak bisa menghapus diri sendiri', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'OWNER', id: '1' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1', role: 'OWNER' } as any);
      
      const res = await deleteAdmin('1');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Cannot delete yourself');
    });

    it('SUPER_ADMIN tidak bisa menghapus SUPER_ADMIN lain', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'SUPER_ADMIN', id: '2' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '3', role: 'SUPER_ADMIN' } as any);
      
      const res = await deleteAdmin('3');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Cannot delete other SUPER_ADMINs');
    });

    it('Bisa menghapus jika valid', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({ user: { role: 'SUPER_ADMIN', id: '2' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '3', role: 'STAFF' } as any);
      
      const res = await deleteAdmin('3');
      expect(res.success).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '3' } });
    });
  });
});
