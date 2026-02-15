import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ErrorMessage from './ErrorMessage.component.jsx';

let mockContext;

vi.mock('../../context/TodosContext', () => ({
  useTodosContext: () => mockContext,
}));

describe('ErrorMessage', () => {
  beforeEach(() => {
    mockContext = {
      errorMessage: 'Something went wrong',
      clearError: vi.fn(),
      errorImg: '/static/error.png',
    };
  });

  it('shows the error text and dismiss control', async () => {
    render(<ErrorMessage />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();

    await userEvent.click(dismissButton);
    expect(mockContext.clearError).toHaveBeenCalledTimes(1);
  });
});
