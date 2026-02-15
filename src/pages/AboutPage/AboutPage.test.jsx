import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AboutPage from './AboutPage.component.jsx';

describe('AboutPage', () => {
  it('highlights the learning journey and technologies used', () => {
    render(<AboutPage />);

    expect(
      screen.getByText(/thank you for stopping by my about page/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/code the dream/i)).toBeInTheDocument();
    expect(
      screen.getByText(/useReducer/i, { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/useContext/i, { exact: false })
    ).toBeInTheDocument();
  });
});
