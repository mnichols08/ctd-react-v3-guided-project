import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import useTodos from './useTodos.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTodos Airtable persistence', () => {
  it('saves a new todo to the configured Airtable base', async () => {
    const savedRecord = {
      id: 'rec123',
      createdTime: '2025-01-01T00:00:00.000Z',
      fields: { title: 'Feed cat', isCompleted: false },
    };

    const fetchMock = vi
      .fn()
      // Initial load triggered by the hook effect
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: [] }),
      })
      // POST request for the new todo
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: [savedRecord] }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    // Allow the initial fetch to settle so it doesn't overwrite the optimistic add
    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    await act(async () => {
      await result.current.addTodo('Feed cat');
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const postCall = fetchMock.mock.calls.find(
      ([, options]) => options?.method === 'POST'
    );
    expect(postCall).toBeDefined();

    const [url, options] = postCall;
    const expectedBaseUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    expect(url).toBe(expectedBaseUrl);
    expect(options).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PAT}`,
        'Content-Type': 'application/json',
      },
    });
    expect(JSON.parse(options.body)).toEqual({
      records: [{ fields: { title: 'Feed cat' } }],
    });

    await waitFor(() => {
      expect(result.current.todosState.todoList).toEqual([
        expect.objectContaining({
          id: 'rec123',
          title: 'Feed cat',
          createdTime: '2025-01-01T00:00:00.000Z',
          isCompleted: false,
          isStillSaving: false,
        }),
      ]);
    });
  });
});
