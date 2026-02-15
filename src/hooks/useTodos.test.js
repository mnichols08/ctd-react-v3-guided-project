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

  it('requests sorted todos by createdTime by default and by title when updated', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    const expectedBaseUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    const defaultUrl = `${expectedBaseUrl}?sort[0][field]=createdTime&sort[0][direction]=desc&filterByFormula=%7BisCompleted%7D%3DFALSE()`;

    const [firstUrl] = fetchMock.mock.calls[0];
    expect(firstUrl).toBe(defaultUrl);

    await act(() => {
      result.current.setSortField('title');
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const [secondUrl] = fetchMock.mock.calls[1];
    const titleUrl = `${expectedBaseUrl}?sort[0][field]=title&sort[0][direction]=desc&filterByFormula=%7BisCompleted%7D%3DFALSE()`;
    expect(secondUrl).toBe(titleUrl);
  });

  it('adds a search filter when querying by title contents', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    await act(() => {
      result.current.setQueryString('cat');
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const expectedBaseUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    const encodedFormula = encodeURIComponent(
      'AND({isCompleted}=FALSE(), SEARCH("cat",{title}))'
    );
    const expectedUrl = `${expectedBaseUrl}?sort[0][field]=createdTime&sort[0][direction]=desc&filterByFormula=${encodedFormula}`;

    const [secondUrl] = fetchMock.mock.calls[1];
    expect(secondUrl).toBe(expectedUrl);
  });

  it('escapes special characters in search queries so encoded filters stay valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    const query = 'cat "dog" + (bird)%';

    await act(() => {
      result.current.setQueryString(query);
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const expectedBaseUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    const expectedFormula = `AND({isCompleted}=FALSE(), SEARCH(${JSON.stringify(query)},{title}))`;
    const expectedUrl = `${expectedBaseUrl}?sort[0][field]=createdTime&sort[0][direction]=desc&filterByFormula=${encodeURIComponent(
      expectedFormula
    )}`;

    const [secondUrl] = fetchMock.mock.calls[1];
    expect(secondUrl).toBe(expectedUrl);
  });

  it('batches rapid query changes so only one request is sent while the user is typing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(() => {
      result.current.setQueryString('c');
      result.current.setQueryString('ca');
      result.current.setQueryString('cat');
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const expectedBaseUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    const encodedFormula = encodeURIComponent(
      'AND({isCompleted}=FALSE(), SEARCH("cat",{title}))'
    );
    const expectedUrl = `${expectedBaseUrl}?sort[0][field]=createdTime&sort[0][direction]=desc&filterByFormula=${encodedFormula}`;

    const [secondUrl] = fetchMock.mock.calls[1];
    expect(secondUrl).toBe(expectedUrl);
  });

  it('does not refetch when unrelated state changes, proving the request builder stays memoized', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ records: [] }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(() => {
      result.current.setWorkingTodoTitle('noop change');
    });

    // If encodeUrl/createRequest were not memoized, the effect dependency would refire here.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it('reverts an optimistic update and surfaces an error message when the update fails', async () => {
    const fetchMock = vi
      .fn()
      // initial load
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            records: [
              {
                id: 'rec1',
                createdTime: '2025-01-01T00:00:00.000Z',
                fields: { title: 'Existing todo', isCompleted: false },
              },
            ],
          }),
      })
      // failed PATCH for update
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );

    const originalTodo = result.current.todosState.todoList[0];

    await act(async () => {
      await result.current.updateTodo({
        ...originalTodo,
        title: 'Edited title',
      });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.todosState.todoList[0].title).toBe(
      originalTodo.title
    );
    expect(result.current.todosState.errorMessage).toBe(
      "We couldn't update that todo. We've restored it to how it was."
    );
  });

  it('uses cached todos and resolves loading without refetching when returning to a prior query', async () => {
    const defaultRecords = [
      {
        id: 'rec-default',
        createdTime: '2025-01-01T00:00:00.000Z',
        fields: { title: 'Default todo', isCompleted: false },
      },
    ];

    const catRecords = [
      {
        id: 'rec-cat',
        createdTime: '2025-01-02T00:00:00.000Z',
        fields: { title: 'Cat todo', isCompleted: false },
      },
    ];

    const fetchMock = vi
      .fn()
      // initial load for default query
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: defaultRecords }),
      })
      // fetch for query "cat"
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: catRecords }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    // initial load populates cache for default query
    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );
    expect(result.current.todosState.todoList[0].id).toBe('rec-default');

    // switch to a new query (cat) which triggers a network fetch
    await act(async () => {
      result.current.setQueryString('cat');
    });

    await waitFor(() =>
      expect(result.current.todosState.todoList[0].id).toBe('rec-cat')
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // switch back to default query; should serve from cache without new fetch
    await act(async () => {
      result.current.setQueryString('');
    });

    await waitFor(() =>
      expect(result.current.todosState.isLoading).toBe(false)
    );
    expect(result.current.todosState.todoList[0].id).toBe('rec-default');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('serves cached todos for prior sort + filter combos without refetching and preserves ordering', async () => {
    const defaultRecords = [
      {
        id: 'rec-default',
        createdTime: '2025-01-01T00:00:00.000Z',
        fields: { title: 'Default todo', isCompleted: false },
      },
    ];

    const catDescRecords = [
      {
        id: 'rec-cat-new',
        createdTime: '2025-02-02T00:00:00.000Z',
        fields: { title: 'Zesty cat', isCompleted: false },
      },
      {
        id: 'rec-cat-old',
        createdTime: '2025-02-01T00:00:00.000Z',
        fields: { title: 'Angry cat', isCompleted: false },
      },
    ];

    const catAscRecords = [...catDescRecords].reverse();

    const fetchMock = vi
      .fn()
      // default query: createdTime desc, no filter
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: defaultRecords }),
      })
      // filtered query: createdTime desc, queryString = "cat"
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: catDescRecords }),
      })
      // same filter, sortDirection asc
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: catAscRecords }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTodos());

    // initial fetch populates default cache entry
    await waitFor(() =>
      expect(result.current.todosState.todoList[0].id).toBe('rec-default')
    );

    await act(async () => {
      result.current.setQueryString('cat');
    });

    await waitFor(() =>
      expect(result.current.todosState.todoList.map(t => t.id)).toEqual([
        'rec-cat-new',
        'rec-cat-old',
      ])
    );

    await act(async () => {
      result.current.setSortDirection('asc');
    });

    await waitFor(() =>
      expect(result.current.todosState.todoList.map(t => t.id)).toEqual([
        'rec-cat-old',
        'rec-cat-new',
      ])
    );

    // returning to previous filter + sort combo should read from cache, not refetch
    await act(async () => {
      result.current.setSortDirection('desc');
    });

    await waitFor(() =>
      expect(result.current.todosState.todoList.map(t => t.id)).toEqual([
        'rec-cat-new',
        'rec-cat-old',
      ])
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.current.todosState.isLoading).toBe(false);
  });
});
