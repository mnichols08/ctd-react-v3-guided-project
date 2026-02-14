import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';

import TextInputWithLabel from './TextInputWithLabel.jsx';

describe('TextInputWithLabel', () => {
  it('associates the label with the input, forwards the ref, and bubbles changes', () => {
    const onChange = vi.fn();
    const inputRef = createRef();

    render(
      <TextInputWithLabel
        elementId="todo-input"
        labelText="Todo"
        value="Clean garage"
        onChange={onChange}
        ref={inputRef}
      />
    );

    const input = screen.getByLabelText('Todo');
    expect(input).toHaveValue('Clean garage');
    expect(inputRef.current).toBe(input);

    fireEvent.change(input, { target: { value: 'Write tests' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
