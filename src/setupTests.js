import '@testing-library/jest-dom';
import { beforeAll, afterEach, vi } from 'vitest';

// Stub the Vite env vars used by TodosPage so tests don’t blow up
beforeAll(() => {
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_BASE_ID: 'base',
      VITE_TABLE_NAME: 'table',
      VITE_PAT: 'key',
    },
    configurable: true,
  });
});

// Clean up mocks between tests
afterEach(() => {
  vi.restoreAllMocks();
});