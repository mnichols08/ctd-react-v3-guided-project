import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import Footer from './Footer.component.jsx';

describe('Footer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the current year and external attribution links', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-08-12T00:00:00.000Z'));

    render(<Footer />);

    expect(screen.getByText(/© 2024/i)).toBeInTheDocument();

    const profileLink = screen.getByRole('link', { name: /mnichols08/i });
    expect(profileLink).toHaveAttribute(
      'href',
      'https://github.com/mnichols08'
    );
    expect(profileLink).toHaveAttribute('target', '_blank');
    expect(profileLink).toHaveAttribute('rel', 'noreferrer');

    const sourceLink = screen.getByRole('link', { name: /view source/i });
    expect(sourceLink).toHaveAttribute(
      'href',
      'https://github.com/mnichols08/ctd-react-v3-guided-project/'
    );
    expect(sourceLink).toHaveAttribute('target', '_blank');
    expect(sourceLink).toHaveAttribute('rel', 'noreferrer');
  });
});
