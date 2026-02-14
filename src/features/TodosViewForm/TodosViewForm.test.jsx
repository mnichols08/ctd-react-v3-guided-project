import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TodosViewForm from './TodosViewForm.component.jsx';
import { TodosProvider } from '../../context/TodosContext';

// Provide a lightweight mock TodosContext so we can control sort state
// without exercising the full Airtable hook.
vi.mock('../../context/TodosContext', () => {
  const React = require('react');
  const TestContext = React.createContext(null);

  const TodosProvider = ({ value, children }) => (
    <TestContext.Provider value={value}>{children}</TestContext.Provider>
  );

  return {
    useTodosContext: () => React.useContext(TestContext),
    TodosProvider,
  };
});

const buildHarness = () => {
  const setSortFieldSpy = vi.fn();
  const setSortDirectionSpy = vi.fn();
  const setQueryStringSpy = vi.fn();
  const clearQueryStringSpy = vi.fn();

  function Harness({ children }) {
    const [sortField, setSortField] = React.useState('title');
    const [sortDirection, setSortDirection] = React.useState('asc');
    const [queryString, setQueryString] = React.useState('');

    const value = {
      sortField,
      setSortField: value => {
        setSortField(value);
        setSortFieldSpy(value);
      },
      sortDirection,
      setSortDirection: value => {
        setSortDirection(value);
        setSortDirectionSpy(value);
      },
      queryString,
      setQueryString: value => {
        setQueryString(value);
        setQueryStringSpy(value);
      },
      clearQueryString: () => {
        setQueryString('');
        clearQueryStringSpy();
      },
    };

    return <TodosProvider value={value}>{children}</TodosProvider>;
  }

  return {
    Harness,
    setSortFieldSpy,
    setSortDirectionSpy,
    setQueryStringSpy,
    clearQueryStringSpy,
  };
};

describe('TodosViewForm', () => {
  it('optimistically updates the UI selection when sorting changes', async () => {
    const user = userEvent.setup();
    const { Harness, setSortFieldSpy, setSortDirectionSpy } = buildHarness();

    render(
      <Harness>
        <TodosViewForm />
      </Harness>
    );

    const sortBySelect = screen.getByLabelText(/sort by/i);
    const directionSelect = screen.getByLabelText(/direction/i);

    expect(sortBySelect).toHaveValue('title');
    expect(directionSelect).toHaveValue('asc');

    await user.selectOptions(sortBySelect, 'createdTime');
    await user.selectOptions(directionSelect, 'desc');

    // Optimistic update: values flip immediately, without waiting on any async fetch
    expect(sortBySelect).toHaveValue('createdTime');
    expect(directionSelect).toHaveValue('desc');

    expect(setSortFieldSpy).toHaveBeenCalledWith('createdTime');
    expect(setSortDirectionSpy).toHaveBeenCalledWith('desc');
  });

  it('lets users search and reflects the query immediately while dispatching the debounced update', async () => {
    const { Harness, setQueryStringSpy, clearQueryStringSpy } = buildHarness();

    render(
      <Harness>
        <TodosViewForm />
      </Harness>
    );

    const searchInput = screen.getByLabelText(/search todos/i);
    const clearButton = screen.getByRole('button', { name: /clear/i });

    fireEvent.change(searchInput, { target: { value: 'cats' } });

    // Optimistic: input value updates immediately as the user types
    expect(searchInput).toHaveValue('cats');

    await waitFor(() => expect(setQueryStringSpy).toHaveBeenCalledWith('cats'));

    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(clearQueryStringSpy).toHaveBeenCalled();
  });

  it('supports keyboard navigation for search, clear, and sort controls', async () => {
    const { Harness, setQueryStringSpy, clearQueryStringSpy, setSortFieldSpy } =
      buildHarness();

    const user = userEvent.setup();

    render(
      <Harness>
        <TodosViewForm />
      </Harness>
    );

    await user.tab();
    const searchInput = screen.getByLabelText(/search todos/i);
    expect(searchInput).toHaveFocus();

    await user.keyboard('dogs');
    await waitFor(() => expect(setQueryStringSpy).toHaveBeenCalledWith('dogs'));

    await user.tab();
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toHaveFocus();

    await user.keyboard(' ');
    expect(searchInput).toHaveValue('');
    expect(clearQueryStringSpy).toHaveBeenCalled();

    await user.tab();
    const sortBySelect = screen.getByLabelText(/sort by/i);
    expect(sortBySelect).toHaveFocus();

    await user.selectOptions(sortBySelect, 'createdTime');
    expect(setSortFieldSpy).toHaveBeenCalledWith('createdTime');
  });
});
