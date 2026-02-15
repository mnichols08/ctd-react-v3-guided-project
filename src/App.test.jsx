import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import App from './App.jsx';
import { TodosProvider } from './context/TodosContext';
import todosFixture from './test/fixtures/todos.records.json';

const createMockFetch = (records = todosFixture.records) => {
  const dataset = records.map(record => ({
    ...record,
    fields: { ...record.fields },
  }));

  const pageSize = 100;

  const formatResponse = (recordsSubset, offset = null) => ({
    ok: true,
    json: async () => ({ records: recordsSubset, offset }),
  });

  const createRecordResponse = record => formatResponse([record]);

  const getSearchParams = url => {
    try {
      return new URL(url).searchParams;
    } catch (_err) {
      return new URL(url, 'https://local.test').searchParams;
    }
  };

  return vi.fn(async (_url, options = {}) => {
    const method = options.method ?? 'GET';

    if (method === 'GET') {
      const searchParams = getSearchParams(_url ?? '');
      const rawOffset = searchParams.get('offset');
      const startIndex = Number.parseInt(rawOffset ?? '0', 10) || 0;
      const endIndex = startIndex + pageSize;
      const nextOffset = endIndex < dataset.length ? String(endIndex) : null;
      const pagedRecords = dataset.slice(startIndex, endIndex);

      return formatResponse(pagedRecords, nextOffset);
    }

    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body) : { records: [] };
      const fields = body.records?.[0]?.fields ?? {};
      const nextId = `rec${String(dataset.length + 1).padStart(4, '0')}`;

      const record = {
        id: nextId,
        createdTime: new Date('2025-02-01T00:00:00.000Z').toISOString(),
        fields: {
          title: fields.title ?? `Todo ${dataset.length + 1}`,
          isCompleted: !!fields.isCompleted,
        },
      };

      dataset.push(record);
      return createRecordResponse(record);
    }

    if (method === 'PATCH') {
      const body = options.body ? JSON.parse(options.body) : { records: [] };
      const incoming = body.records?.[0] ?? {};
      const recordIndex = dataset.findIndex(
        record => record.id === incoming.id
      );

      if (recordIndex !== -1) {
        dataset[recordIndex] = {
          ...dataset[recordIndex],
          fields: {
            ...dataset[recordIndex].fields,
            ...incoming.fields,
          },
        };

        return createRecordResponse(dataset[recordIndex]);
      }

      const fallbackRecord = {
        id: incoming.id ?? `rec${String(dataset.length + 1).padStart(4, '0')}`,
        createdTime: new Date().toISOString(),
        fields: incoming.fields ?? {},
      };

      dataset.push(fallbackRecord);
      return createRecordResponse(fallbackRecord);
    }

    return { ok: false, status: 405, json: async () => ({}) };
  });
};

describe('App', () => {
  let fetchMock;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock = createMockFetch();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders without console errors or warnings when using real components and mocked API', async () => {
    render(
      <MemoryRouter>
        <TodosProvider>
          <App />
        </TodosProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('announces key actions for screen readers across the app', async () => {
    render(
      <MemoryRouter>
        <TodosProvider>
          <App />
        </TodosProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const addGuidance = await screen.findByText(
      /add a new todo by typing in the input below and pressing enter/i
    );
    expect(addGuidance).toHaveClass('screen-reader-only');

    const completeGuidance = await screen.findAllByText(
      /mark this todo as complete/i
    );
    expect(completeGuidance.length).toBeGreaterThan(0);
    completeGuidance.forEach(node =>
      expect(node).toHaveClass('screen-reader-only')
    );

    const editGuidance = await screen.findAllByText(
      /edit the value of this todo/i
    );
    expect(editGuidance.length).toBeGreaterThan(0);
    editGuidance.forEach(node => {
      const srContainer = node.closest('.screen-reader-only') ?? node;
      expect(srContainer).toHaveClass('screen-reader-only');
    });

    const searchGuidance = await screen.findByText(
      /search for todos or change the sort field and direction/i
    );
    expect(searchGuidance).toHaveClass('screen-reader-only');
  });
});
