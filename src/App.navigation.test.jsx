import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';

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

const LocationSpy = () => {
  const location = useLocation();
  return (
    <div data-testid="location-display">{`${location.pathname}${location.search}`}</div>
  );
};

describe('App navigation and routing', () => {
  let fetchMock;
  let user;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock = createMockFetch();
    user = userEvent.setup();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const renderApp = initialEntries =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <TodosProvider>
          <LocationSpy />
          <App />
        </TodosProvider>
      </MemoryRouter>
    );

  it('loads the correct todos page when landing directly on a paginated URL', async () => {
    renderApp(['/?page=2']);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(screen.getByTestId('location-display')).toHaveTextContent(
      '/?page=2'
    );
    expect(screen.getByText(/Page 2 of 14/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Todo 185/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Todo 200/i)).not.toBeInTheDocument();
  });

  it('updates the page query param when clicking pagination controls', async () => {
    renderApp(['/']);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const next = await screen.findByRole('button', { name: /next/i });
    const prev = await screen.findByRole('button', { name: /previous/i });
    const locationNode = screen.getByTestId('location-display');

    expect(locationNode).toHaveTextContent('/');
    expect(prev).toBeDisabled();

    await user.click(next);
    await waitFor(() => expect(locationNode).toHaveTextContent('/?page=2'));
    expect(screen.getByText(/Page 2 of 14/i)).toBeInTheDocument();
    expect(prev).not.toBeDisabled();

    await user.click(prev);
    await waitFor(() => expect(locationNode).toHaveTextContent('/?page=1'));
    expect(prev).toBeDisabled();
  });

  it('redirects away from invalid pagination queries', async () => {
    renderApp(['/?page=99']);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    await waitFor(() =>
      expect(screen.getByTestId('location-display')).toHaveTextContent(/^\/$/)
    );

    const pageSummary = screen.getByText(
      (content, node) =>
        node?.tagName === 'SPAN' &&
        content.replace(/\s+/g, ' ').trim() === 'Page 1 of 14'
    );

    expect(pageSummary).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Todo 200/i })
    ).toBeInTheDocument();
  });

  it('exposes screen-reader only guidance while navigating the app', async () => {
    renderApp(['/']);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const addGuidance = await screen.findByText(
      /add a new todo by typing in the input below and pressing enter/i
    );
    expect(addGuidance).toHaveClass('screen-reader-only');

    const searchGuidance = await screen.findByText(
      /search for todos or change the sort field and direction/i
    );
    expect(searchGuidance).toHaveClass('screen-reader-only');
  });

  it('shows active header state and aria-current on the current route', async () => {
    renderApp(['/']);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const homeLink = screen.getByRole('link', { name: /home/i });
    const aboutLink = screen.getByRole('link', { name: /about/i });

    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink.className).toContain('current');
    expect(aboutLink.className).toContain('inactive');

    await user.click(aboutLink);
    await waitFor(() =>
      expect(aboutLink).toHaveAttribute('aria-current', 'page')
    );

    expect(aboutLink.className).toContain('current');
    expect(homeLink.className).toContain('inactive');
  });

  it('renders the not-found experience for unknown routes', async () => {
    renderApp(['/does-not-exist']);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /route cannot be found/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('location-display')).toHaveTextContent(
      '/does-not-exist'
    );
  });
});
