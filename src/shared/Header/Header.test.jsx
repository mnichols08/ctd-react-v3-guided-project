import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import Header from './Header.component.jsx';

vi.mock('../../context/TodosContext', () => ({
  useTodosContext: () => ({ logo: '/assets/test-logo.svg' }),
}));

describe('Header', () => {
  it('renders the provided title and logo', () => {
    render(
      <MemoryRouter>
        <Header title="My Todos" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'My Todos'
    );
    const logo = screen.getByAltText('');
    expect(logo).toHaveAttribute('src', '/assets/test-logo.svg');
  });

  it('applies active and inactive classes based on the current route', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Header title="About" />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /about/i })).toHaveClass('current');
    expect(screen.getByRole('link', { name: /home/i })).toHaveClass('inactive');
  });
});
