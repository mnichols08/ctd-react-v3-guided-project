import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TodoForm from './TodoForm.component.jsx';

const addTodoMock = vi.fn();
const clearQueryStringMock = vi.fn();

// Provide a lightweight context stand-in with local state so the form behaves
// like it does in the app without hitting the real data layer.
vi.mock('../../context/TodosContext', () => {
  const React = require('react');
  return {
    useTodosContext: () => {
      const [workingTodoTitle, setWorkingTodoTitle] = React.useState('');
      return {
        addTodo: addTodoMock,
        clearQueryString: clearQueryStringMock,
        isSaving: false,
        workingTodoTitle,
        setWorkingTodoTitle,
      };
    },
  };
});

describe('TodoForm', () => {
  beforeEach(() => {
    addTodoMock.mockClear();
    clearQueryStringMock.mockClear();
  });

  it('allows users to add a new todo', async () => {
    render(<TodoForm />);

    const input = screen.getByLabelText(/todo/i);
    const submit = screen.getByRole('button', { name: /add todo/i });

    await userEvent.type(input, 'Learn testing');
    await userEvent.click(submit);

    expect(addTodoMock).toHaveBeenCalledWith('Learn testing');
    expect(input).toHaveValue('');
    expect(clearQueryStringMock).toHaveBeenCalled();
  });
});
