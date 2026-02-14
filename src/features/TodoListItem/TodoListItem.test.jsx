import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import TodoListItem from './TodoListItem.component';
import { TodosProvider } from '../../context/TodosContext';

// Mock TodosContext to supply handlers the component expects
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

const baseTodo = {
  id: 'todo-1',
  title: 'Test todo',
  isCompleted: false,
  isStillSaving: false,
};

const renderWithContext = value =>
  render(
    <TodosProvider value={value}>
      <TodoListItem todo={baseTodo} />
    </TodosProvider>
  );

describe('TodoListItem', () => {
  it('marks a todo as complete when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const completeTodo = vi.fn();

    renderWithContext({ completeTodo, updateTodo: vi.fn() });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(completeTodo).toHaveBeenCalledWith(baseTodo.id);
  });
});
