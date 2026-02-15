import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

vi.mock('./context/TodosContext', () => ({
  useTodosContext: () => ({
    logo: '/logo.png',
    errorImg: '/error.png',
    todosState: { errorMessage: null },
  }),
}));

vi.mock('./pages/TodosPage/TodosPage.component', () => ({
  default: () => <h2>Todos Page</h2>,
}));

vi.mock('./pages/AboutPage/AboutPage.component', () => ({
  default: () => <h2>About Page</h2>,
}));

vi.mock('./features/ErrorMessage/ErrorMessage.component', () => ({
  default: () => <div role="alert" />,
}));

vi.mock('./shared/Footer/Footer.component', () => ({
  default: () => <footer />,
}));

import App from './App.jsx';

describe('App keyboard navigation', () => {
  it('navigates between top-level pages via Enter', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    const aboutLink = screen.getByRole('link', { name: /about/i });

    await user.tab();
    expect(homeLink).toHaveFocus();

    await user.tab();
    expect(aboutLink).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(
      screen.getByRole('heading', { name: /about page/i })
    ).toBeInTheDocument();
  });

  it('returns home from not-found via Space key on the call-to-action', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/missing']}>
        <App />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /go back to app/i });

    backButton.focus();
    expect(backButton).toHaveFocus();

    await user.keyboard(' ');
    expect(
      screen.getByRole('heading', { name: /todos page/i })
    ).toBeInTheDocument();
  });
});
