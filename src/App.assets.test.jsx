import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

import App from './App.jsx';

// Keep the layout components real so we can inspect imagery; mock pages only.
vi.mock('./pages/TodosPage/TodosPage.component', () => ({
  default: () => <div data-testid="todos-page" />,
}));
vi.mock('./pages/AboutPage/AboutPage.component', () => ({
  default: () => <div data-testid="about-page" />,
}));
vi.mock('./pages/NotFoundPage/NotFoundPage.component', () => ({
  default: () => <div data-testid="not-found-page" />,
}));

// Stub context to surface custom assets and an error so ErrorMessage renders.
vi.mock('./context/TodosContext', () => {
  const ctxValue = {
    logo: 'logo.png',
    errorImg: 'error.png',
    clearError: vi.fn(),
    todosState: { errorMessage: 'Oops!' },
  };

  return {
    useTodosContext: () => ctxValue,
  };
});

describe('App imagery', () => {
  it('renders custom logo and error illustration from context assets', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const logoImg = container.querySelector('header img');
    expect(logoImg).not.toBeNull();
    expect(logoImg?.getAttribute('src')).toBe('logo.png');

    const errorImg = container.querySelector('img[src="error.png"]');
    expect(errorImg).not.toBeNull();
    expect(errorImg?.getAttribute('src')).toBe('error.png');
  });
});
