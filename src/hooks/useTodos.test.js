import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import useTodos from './useTodos.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTodos Airtable persistence', () => {
  const createDeferredResponse = () => {
    let resolve;
    const promise = new Promise(res => {
      resolve = res;
    });
    return { promise, resolve };
  };

  it('loads saved todos from Airtable on mount', async () => {
    const airtableRecords = [
      {
        id: 'recExisting',
        createdTime: '2025-02-01T10:00:00.000Z',
        fields: { title: 'Existing todo', isCompleted: false },
      },
    ];

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ records: airtableRecords }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    const expectedBaseUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    const expectedUrl = `${expectedBaseUrl}?sort[0][field]=createdTime&sort[0][direction]=desc&filterByFormula=%7BisCompleted%7D%3DFALSE()`;

    expect(url).toBe(expectedUrl);
    expect(options).toMatchObject({
      method: 'GET',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PAT}`,
      },
    });

    await waitFor(() => {
      expect(result.current.todosState.todoList).toEqual([
        {
          id: 'recExisting',
          title: 'Existing todo',
          createdTime: '2025-02-01T10:00:00.000Z',
          isCompleted: false,
        },
      ]);
    });
  });

  it('surfaces a friendly message when the initial fetch hits a network error', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Offline'));

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.errorMessage).toBe(
        'Unable to connect to database. Please check your internet connection.'
      )
    );
    expect(result.current.todosState.isLoading).toBe(false);
  });

  it('shows an auth error message when Airtable rejects the request', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.errorMessage).toBe(
        "We're having trouble loading your todos. Please refresh the page."
      )
    );
    expect(result.current.todosState.isLoading).toBe(false);
  });

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

  it('sets pending flags while requests are in flight', async () => {
    const initialFetch = createDeferredResponse();
    const postFetch = createDeferredResponse();

    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(initialFetch.promise)
      .mockReturnValueOnce(postFetch.promise);

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.todosState.isLoading).toBe(true));

    initialFetch.resolve({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    await act(() => {
      result.current.addTodo('Feed cat');
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await waitFor(() => expect(result.current.todosState.isSaving).toBe(true));

    postFetch.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          records: [
            {
              id: 'recPending',
              createdTime: '2025-03-01T00:00:00.000Z',
              fields: { title: 'Feed cat', isCompleted: false },
            },
          ],
        }),
    });

    await waitFor(() => expect(result.current.todosState.isSaving).toBe(false));
  });
});
