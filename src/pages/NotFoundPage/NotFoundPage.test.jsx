import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import NotFoundPage from './NotFoundPage.component.jsx';

vi.mock('../../context/TodosContext', () => ({
  useTodosContext: () => ({ errorImg: '/assets/error.svg' }),
}));

describe('NotFoundPage', () => {
  it('shows the shared error illustration on the 404 screen', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    // The image is decorative (aria-hidden) so it surfaces as presentation
    const errorIllustration = screen.getByRole('presentation', {
      hidden: true,
    });
    expect(errorIllustration).toHaveAttribute('src', '/assets/error.svg');
  });
});
