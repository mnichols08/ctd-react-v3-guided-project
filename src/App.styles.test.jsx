import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';

import App from './App.jsx';

// Use lightweight mocks for pages only; keep Header/Footer/ErrorMessage real
vi.mock('./pages/TodosPage/TodosPage.component', () => ({
  default: () => <div data-testid="todos-page" />,
}));
vi.mock('./pages/AboutPage/AboutPage.component', () => ({
  default: () => <div data-testid="about-page" />,
}));
vi.mock('./pages/NotFoundPage/NotFoundPage.component', () => ({
  default: () => <div data-testid="not-found-page" />,
}));

// Provide a stub context with the assets/error state App consumers expect.
vi.mock('./context/TodosContext', () => {
  const React = require('react');
  const ctxValue = {
    logo: 'logo.png',
    errorImg: 'error.png',
    clearError: vi.fn(),
    errorMessage: 'Boom!',
    todosState: { errorMessage: 'Boom!' },
  };

  const TodosProvider = ({ children }) => (
    <React.Fragment>{children}</React.Fragment>
  );

  return {
    useTodosContext: () => ctxValue,
    TodosProvider,
  };
});

describe('App styling', () => {
  it('applies styled-components and CSS module classes when rendering layout and errors', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const headerEl = container.querySelector('header');
    const footerEl = container.querySelector('footer');

    expect(headerEl?.className || '').toMatch(/sc-/);
    expect(footerEl?.className || '').toMatch(/sc-/);

    const errorText = screen.getByText('Boom!');
    const errorContent = errorText.closest('div');
    const errorContainer = errorContent?.parentElement;

    // CSS module on outer container should differ from styled-components classes
    expect(errorContainer?.className || '').not.toEqual('');
    expect(errorContainer?.className || '').not.toMatch(/sc-/);

    const errorImg = errorContainer?.querySelector('img');
    expect(errorImg?.className || '').toMatch(/sc-/);
  });
});
