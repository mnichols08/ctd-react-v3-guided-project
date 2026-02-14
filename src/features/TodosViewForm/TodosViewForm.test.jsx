import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      clearQueryString: () => setQueryString(''),
    };

    return <TodosProvider value={value}>{children}</TodosProvider>;
  }

  return { Harness, setSortFieldSpy, setSortDirectionSpy, setQueryStringSpy };
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
});
