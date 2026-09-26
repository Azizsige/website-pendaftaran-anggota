import { describe, it, expect, beforeEach } from 'vitest';
import { useCekStatusStore } from '../useCekStatusStore';

describe('useCekStatusStore', () => {
  beforeEach(() => {
    useCekStatusStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const state = useCekStatusStore.getState();
    expect(state.nim).toBe('');
    expect(state.email).toBe('');
    expect(state.isLoading).toBe(false);
    expect(state.isDownloading).toBe(false);
    expect(state.isUploadingPhoto).toBe(false);
    expect(state.error).toBe('');
    expect(state.statusData).toBeNull();
  });

  it('should update nim', () => {
    useCekStatusStore.getState().setNim('12345');
    expect(useCekStatusStore.getState().nim).toBe('12345');
  });

  it('should update email', () => {
    useCekStatusStore.getState().setEmail('test@example.com');
    expect(useCekStatusStore.getState().email).toBe('test@example.com');
  });

  it('should update status data', () => {
    const mockData = { status: 'APPROVED', name: 'John Doe' };
    useCekStatusStore.getState().setStatusData(mockData);
    expect(useCekStatusStore.getState().statusData).toEqual(mockData);
  });

  it('should reset state correctly', () => {
    const store = useCekStatusStore.getState();
    store.setNim('123');
    store.setEmail('test@test.com');
    store.setError('Error');
    store.setStatusData({ name: 'Test' });

    store.reset();
    
    const newState = useCekStatusStore.getState();
    expect(newState.nim).toBe('');
    expect(newState.email).toBe('');
    expect(newState.error).toBe('');
    expect(newState.statusData).toBeNull();
  });
});
