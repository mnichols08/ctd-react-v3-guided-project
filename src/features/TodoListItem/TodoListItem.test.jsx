import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
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

  it('removes a completed todo after 3500ms', async () => {
    vi.useFakeTimers();

    const TestList = () => {
      const [todos, setTodos] = useState([baseTodo]);

      const completeTodo = id => {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
          )
        );

        setTimeout(() => {
          setTodos(prev => {
            const stillCompleted = prev.find(
              todo => todo.id === id
            )?.isCompleted;
            return stillCompleted ? prev.filter(todo => todo.id !== id) : prev;
          });
        }, 3500);
      };

      return (
        <TodosProvider value={{ completeTodo, updateTodo: vi.fn() }}>
          <ul>
            {todos.map(todo => (
              <TodoListItem key={todo.id} todo={todo} />
            ))}
          </ul>
        </TodosProvider>
      );
    };

    try {
      render(<TestList />);

      const checkbox = screen.getByRole('checkbox');
      await act(async () => {
        fireEvent.click(checkbox);
      });

      expect(screen.getByRole('checkbox')).toBeChecked();

      act(() => {
        vi.runAllTimers();
      });

      expect(screen.queryByText(baseTodo.title)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
