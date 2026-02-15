import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';

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

describe('App routing', () => {
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

  it('renders the todos experience on the home route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TodosProvider>
          <App />
        </TodosProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(
      screen.getByRole('heading', { level: 1, name: /todo app/i })
    ).toBeInTheDocument();

    const firstTodos = await screen.findAllByText(/todo 1/i);
    expect(firstTodos.length).toBeGreaterThan(0);
  });

  it('renders about page content for the about route', async () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <TodosProvider>
          <App />
        </TodosProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(
      screen.getByRole('heading', { level: 1, name: /about/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this app grew out of my time in code the dream/i)
    ).toBeInTheDocument();
  });

  it('renders not-found content for unknown routes', async () => {
    render(
      <MemoryRouter initialEntries={['/missing']}>
        <TodosProvider>
          <App />
        </TodosProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /route cannot be found/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /go back to app/i })
    ).toBeInTheDocument();
  });
});
