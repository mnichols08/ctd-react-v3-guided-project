import { useState, useRef, act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('clears completion timer when editing and re-starts it on cancel', async () => {
    vi.useFakeTimers();

    const TestList = () => {
      const [todos, setTodos] = useState([baseTodo]);
      const timersRef = useRef({});

      const completeTodo = id => {
        setTodos(prev => {
          const next = prev.map(todo =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
          );

          if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
          }

          const updated = next.find(todo => todo.id === id);
          if (updated?.isCompleted) {
            timersRef.current[id] = setTimeout(() => {
              setTodos(current =>
                current.filter(todo => todo.id !== id || !todo.isCompleted)
              );
              delete timersRef.current[id];
            }, 3500);
          }

          return next;
        });
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

      // Mark as complete to start the timer
      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).toBeChecked();

      // Enter edit mode on a completed todo; this should cancel the timer
      fireEvent.click(screen.getByRole('button', { name: baseTodo.title }));

      act(() => {
        vi.runAllTimers();
      });

      // Timer should have been cleared; todo remains in edit mode
      expect(screen.getByDisplayValue(baseTodo.title)).toBeInTheDocument();

      // Cancel edit without changes, which re-completes and restarts timer
      fireEvent.click(screen.getByDisplayValue('Cancel'));
      expect(screen.getByRole('checkbox')).toBeChecked();

      // Back to display mode while timer runs
      expect(
        screen.getByRole('button', { name: baseTodo.title })
      ).toBeInTheDocument();

      act(() => {
        vi.runAllTimers();
      });

      // Timer fires after cancel, removing the todo
      expect(
        screen.queryByRole('button', { name: baseTodo.title })
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('still finalizes completion after 3500ms when untouched', async () => {
    vi.useFakeTimers();

    const TestList = () => {
      const [todos, setTodos] = useState([baseTodo]);
      const timersRef = useRef({});

      const completeTodo = id => {
        setTodos(prev => {
          const next = prev.map(todo =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
          );

          if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
          }

          const updated = next.find(todo => todo.id === id);
          if (updated?.isCompleted) {
            timersRef.current[id] = setTimeout(() => {
              setTodos(current =>
                current.filter(todo => todo.id !== id || !todo.isCompleted)
              );
              delete timersRef.current[id];
            }, 3500);
          }

          return next;
        });
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

      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).toBeChecked();

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      expect(
        screen.queryByRole('button', { name: baseTodo.title })
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears the completion timer when a completed todo is edited and saved', async () => {
    vi.useFakeTimers();

    const TestList = () => {
      const [todos, setTodos] = useState([baseTodo]);
      const timersRef = useRef({});

      const completeTodo = id => {
        setTodos(prev => {
          const next = prev.map(todo =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
          );

          if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
          }

          const updated = next.find(todo => todo.id === id);
          if (updated?.isCompleted) {
            timersRef.current[id] = setTimeout(() => {
              setTodos(current =>
                current.filter(todo => todo.id !== id || !todo.isCompleted)
              );
              delete timersRef.current[id];
            }, 3500);
          }

          return next;
        });
      };

      const updateTodo = editedTodo => {
        // Saving an edit should also clear any lingering timer
        if (timersRef.current[editedTodo.id]) {
          clearTimeout(timersRef.current[editedTodo.id]);
          delete timersRef.current[editedTodo.id];
        }

        setTodos(prev =>
          prev.map(todo => (todo.id === editedTodo.id ? editedTodo : todo))
        );
      };

      return (
        <TodosProvider value={{ completeTodo, updateTodo }}>
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

      // Mark complete to start the timer
      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).toBeChecked();

      // Enter edit mode (component will mark it incomplete, clearing timer)
      fireEvent.click(screen.getByRole('button', { name: baseTodo.title }));

      const input = screen.getByLabelText('Todo title');
      fireEvent.change(input, { target: { value: 'Updated todo' } });

      fireEvent.click(screen.getByDisplayValue('Update'));

      // After save, todo remains and checkbox should be unchecked
      expect(
        screen.getByRole('button', { name: 'Updated todo' })
      ).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();

      act(() => {
        vi.runAllTimers();
      });

      // Timer was cleared; todo should persist
      expect(
        screen.getByRole('button', { name: 'Updated todo' })
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('supports keyboard navigation for completion and edit flows', async () => {
    const user = userEvent.setup();
    const completeTodo = vi.fn();
    const updateTodo = vi.fn();

    renderWithContext({ completeTodo, updateTodo });

    // Tab to the checkbox and toggle completion with Space
    await user.tab();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveFocus();

    await user.keyboard(' ');
    expect(completeTodo).toHaveBeenCalledWith(baseTodo.id);

    // Tab to the keyboard-accessible title element
    await user.tab();
    const titleFocusable = screen.getByText(baseTodo.title, {
      selector: 'p[tabindex="0"]',
    });
    expect(titleFocusable).toHaveFocus();

    // Enter should switch to edit mode and focus the input
    fireEvent.keyDown(titleFocusable, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });
    const input = await screen.findByLabelText('Todo title');
    expect(input).toHaveFocus();

    await user.clear(input);
    await user.type(input, 'Updated via keyboard');
    await user.keyboard('{Enter}');

    expect(updateTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: baseTodo.id,
        title: 'Updated via keyboard',
      })
    );
  });
});
