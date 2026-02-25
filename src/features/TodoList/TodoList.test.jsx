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

  it('renders todos from context when data is available', () => {
    renderWithContext({
      todosState: {
        todoList: [
          { id: '2', title: 'Brush teeth', isCompleted: false },
          { id: '1', title: 'Aardvark task', isCompleted: false },
        ],
      },
      completeTodo: vi.fn(),
      updateTodo: vi.fn(),
      isLoading: false,
      sortField: 'title',
      sortDirection: 'asc',
    });

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    // Sorted ascending by title
    expect(items[0]).toHaveTextContent('Aardvark task');
    expect(items[1]).toHaveTextContent('Brush teeth');
    expect(screen.queryByText('Todo list loading...')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Add todo above to get started')
    ).not.toBeInTheDocument();
  });

  it('sorts todos descending when requested', () => {
    renderWithContext({
      todosState: {
        todoList: [
          { id: '2', title: 'Brush teeth', isCompleted: false },
          { id: '1', title: 'Aardvark task', isCompleted: false },
        ],
      },
      completeTodo: vi.fn(),
      updateTodo: vi.fn(),
      isLoading: false,
      sortField: 'title',
      sortDirection: 'desc',
    });

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    // Sorted descending by title
    expect(items[0]).toHaveTextContent('Brush teeth');
    expect(items[1]).toHaveTextContent('Aardvark task');
  });
});
