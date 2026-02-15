import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import useTodos from './useTodos.js';

const { VITE_BASE_ID, VITE_TABLE_NAME } = process.env;

const shouldRunLive =
  process.env.RUN_AIRTABLE_TESTS === '1' ||
  process.env.RUN_AIRTABLE_TESTS === 'true';

const requiredEnvVars = ['VITE_BASE_ID', 'VITE_TABLE_NAME', 'VITE_PAT'];
const missingEnvVars = requiredEnvVars.filter(name => !process.env[name]);
const hasAllEnv = missingEnvVars.length === 0;

const logAirtableTarget = () => {
  const maskedBase = VITE_BASE_ID ? `${VITE_BASE_ID.slice(0, 4)}…` : 'unset';
  const table = VITE_TABLE_NAME ?? 'unset';
  // Log target without exposing secrets
  console.info(`[Airtable live test] Base=${maskedBase} Table=${table}`);
};

describe.skipIf(!shouldRunLive)(
  'useTodos Airtable live integration @airtable',
  () => {
    it.skipIf(!hasAllEnv)(
      'fetches todos from Airtable and normalizes the response',
      async () => {
        logAirtableTarget();

        const { result } = renderHook(() => useTodos());

        await waitFor(
          () => expect(result.current.todosState.isLoading).toBe(false),
          { timeout: 15000 }
        );

        expect(result.current.todosState.todoList.length).toBeGreaterThan(0);
        expect(result.current.todosState.todoList[0]).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
          })
        );
      },
      20000
    );
  }
);
