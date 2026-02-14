import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import App from './App.jsx';

// Mock everything App renders so we don't need real context state
vi.mock('./pages/TodosPage/TodosPage.component', () => ({
  default: () => <div>todos</div>,
}));
vi.mock('./pages/AboutPage/AboutPage.component', () => ({
  default: () => <div>about</div>,
}));
vi.mock('./pages/NotFoundPage/NotFoundPage.component', () => ({
  default: () => <div>not found</div>,
}));
vi.mock('./shared/Header/Header.component', () => ({
  default: () => <header />,
}));
vi.mock('./shared/Footer/Footer.component', () => ({
  default: () => <footer />,
}));
vi.mock('./features/ErrorMessage/ErrorMessage.component', () => ({
  default: () => <div role="alert" />,
}));

// Minimal context stub: App only reads errorMessage
vi.mock('./context/TodosContext', () => ({
  useTodosContext: () => ({ todosState: { errorMessage: null } }),
}));
// This test just ensures App doesn't throw any errors or warnings when rendered with the default context state. It doesn't test any specific behavior of App, but it does verify that the component can render without crashing and that there are no unexpected console messages.
describe('App', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('renders without console errors or warnings', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });
});
