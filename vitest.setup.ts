import { vi } from 'vitest';

// Mock server-only to prevent it from throwing errors in jsdom environment
vi.mock('server-only', () => ({}));
