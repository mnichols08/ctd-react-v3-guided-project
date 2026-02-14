import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import TodoForm from './TodoForm.component.jsx';
import TodoList from '../TodoList/TodoList.component.jsx';
import { TodosProvider } from '../../context/TodosContext';

const clearQueryStringMock = vi.fn();

// Create a shared test context so TodoForm and TodoList see the same state.
vi.mock('../../context/TodosContext', () => {
  const React = require('react');
  const TestTodosContext = React.createContext(null);

  const TodosProvider = ({ children, value }) => (
    <TestTodosContext.Provider value={value}>
      {children}
    </TestTodosContext.Provider>
  );

  return {
    useTodosContext: () => React.useContext(TestTodosContext),
    TodosProvider,
  };
});

const buildTodo = (title, index) => ({
  id: `todo-${index}`,
  title,
  isCompleted: false,
});

function TodosTestHarness({
  children,
  addTodoSpyRef,
  initialWorkingTitle = '',
}) {
  const [workingTodoTitle, setWorkingTodoTitle] =
    React.useState(initialWorkingTitle);
  const [todoList, setTodoList] = React.useState([]);
  const addTodoSpy = React.useMemo(() => vi.fn(), []);

  const addTodo = React.useCallback(
    title => {
      addTodoSpy(title);
      setTodoList(prev => [...prev, buildTodo(title, prev.length)]);
    },
    [addTodoSpy]
  );

  if (addTodoSpyRef) {
    addTodoSpyRef.current = addTodoSpy;
  }

  const value = {
    addTodo,
    clearQueryString: clearQueryStringMock,
    isSaving: false,
    workingTodoTitle,
    setWorkingTodoTitle,
    todosState: { todoList },
    sortField: 'title',
    sortDirection: 'asc',
  };

  return (
    <MemoryRouter>
      <TodosProvider value={value}>{children}</TodosProvider>
    </MemoryRouter>
  );
}

describe('TodoForm', () => {
  beforeEach(() => {
    clearQueryStringMock.mockClear();
  });

  it('disables the Add Todo button when input is empty', async () => {
    const user = userEvent.setup();

    render(
      <TodosTestHarness>
        <TodoForm />
      </TodosTestHarness>
    );

    const input = screen.getByLabelText(/todo/i);
    const submit = screen.getByRole('button', { name: /add todo/i });

    expect(submit).toBeDisabled();

    await user.type(input, 'New task');
    expect(submit).toBeEnabled();

    await user.clear(input);
    expect(submit).toBeDisabled();
  });

  it('keeps the input value in sync with context state', async () => {
    const user = userEvent.setup();

    render(
      <TodosTestHarness initialWorkingTitle="Seeded value">
        <TodoForm />
      </TodosTestHarness>
    );

    const input = screen.getByLabelText(/todo/i);

    expect(input).toHaveValue('Seeded value');

    await user.clear(input);
    await user.type(input, 'Next up');

    expect(clearQueryStringMock).toHaveBeenCalled();
    expect(input).toHaveValue('Next up');
  });

  it('keeps focus and renders the todo when submitted via button', async () => {
    const addTodoSpyRef = { current: null };
    const user = userEvent.setup();

    render(
      <TodosTestHarness addTodoSpyRef={addTodoSpyRef}>
        <TodoForm />
        <TodoList />
      </TodosTestHarness>
    );

    const input = screen.getByLabelText(/todo/i);
    const submit = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Learn testing');
    await user.click(submit);

    expect(addTodoSpyRef.current).toHaveBeenCalledWith('Learn testing');
    expect(
      await screen.findByRole('button', { name: 'Learn testing' })
    ).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('keeps focus and renders the todo when submitted with Enter', async () => {
    const addTodoSpyRef = { current: null };
    const user = userEvent.setup();

    render(
      <TodosTestHarness addTodoSpyRef={addTodoSpyRef}>
        <TodoForm />
        <TodoList />
      </TodosTestHarness>
    );

    const input = screen.getByLabelText(/todo/i);

    await user.type(input, 'Write docs{enter}');

    expect(addTodoSpyRef.current).toHaveBeenCalledWith('Write docs');
    expect(
      await screen.findByRole('button', { name: 'Write docs' })
    ).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('supports tabbing to the submit button and activating with Space', async () => {
    const addTodoSpyRef = { current: null };
    const user = userEvent.setup();

    render(
      <TodosTestHarness addTodoSpyRef={addTodoSpyRef}>
        <TodoForm />
        <TodoList />
      </TodosTestHarness>
    );

    await user.tab();
    const input = screen.getByLabelText(/todo/i);
    expect(input).toHaveFocus();

    await user.type(input, 'Keyboard submit');

    await user.tab();
    const submit = screen.getByRole('button', { name: /add todo/i });
    expect(submit).toHaveFocus();

    await user.keyboard(' ');

    expect(addTodoSpyRef.current).toHaveBeenCalledWith('Keyboard submit');
    expect(
      await screen.findByRole('button', { name: 'Keyboard submit' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/todo/i)).toHaveFocus();
  });
});
