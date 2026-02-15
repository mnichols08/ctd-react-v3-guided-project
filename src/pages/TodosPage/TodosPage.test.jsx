import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import TodosPage from './TodosPage.component.jsx';

vi.mock('../../features/TodoForm/TodoForm.component', () => ({
  default: () => <div data-testid="todo-form">TodoForm</div>,
}));

vi.mock('../../features/TodoList/TodoList.component', () => ({
  default: () => <div data-testid="todo-list">TodoList</div>,
}));

vi.mock('../../features/TodosViewForm/TodosViewForm.component', () => ({
  default: () => <div data-testid="todos-view-form">TodosViewForm</div>,
}));

describe('TodosPage', () => {
  it('renders the form, list, and view controls in order', () => {
    render(<TodosPage />);

    const form = screen.getByTestId('todo-form');
    const list = screen.getByTestId('todo-list');
    const viewForm = screen.getByTestId('todos-view-form');

    expect(form).toBeInTheDocument();
    expect(list).toBeInTheDocument();
    expect(viewForm).toBeInTheDocument();

    expect(
      form.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
    expect(
      list.compareDocumentPosition(viewForm) & Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
  });
});
