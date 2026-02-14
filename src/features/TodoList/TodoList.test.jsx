import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import TodoList from './TodoList.component.jsx';

let mockContext;

// Provide a lightweight mock for the todos context
vi.mock('../../context/TodosContext', () => ({
  useTodosContext: () => mockContext,
}));

const renderWithContext = value => {
  mockContext = value;

  return render(
    <MemoryRouter>
      <TodoList />
    </MemoryRouter>
  );
};

describe('TodoList', () => {
  beforeEach(() => {
    mockContext = null;
  });

  it('shows the empty state message when there are no todos and not loading', () => {
    renderWithContext({
      todosState: { todoList: [] },
      isLoading: false,
      sortField: 'title',
      sortDirection: 'asc',
    });

    expect(
      screen.getByText('Add todo above to get started')
    ).toBeInTheDocument();
    expect(screen.queryByText('Todo list loading...')).not.toBeInTheDocument();
  });

  it('shows the loading message while fetching an empty list', () => {
    renderWithContext({
      todosState: { todoList: [] },
      isLoading: true,
      sortField: 'title',
      sortDirection: 'asc',
    });

    expect(screen.getByText('Todo list loading...')).toBeInTheDocument();
    expect(
      screen.queryByText('Add todo above to get started')
    ).not.toBeInTheDocument();
  });
});
