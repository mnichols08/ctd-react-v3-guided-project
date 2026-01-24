import { forwardRef } from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
  padding-bottom: 0.25rem;
`;

const StyledInput = styled.input`
  padding: 0.5rem;
`;

const TextInputWithLabel = forwardRef(
  ({ elementId, labelText, onChange, value }, ref) => {
    return (
      <>
        <StyledLabel htmlFor={elementId}>{labelText}</StyledLabel>
        <StyledInput
          type="text"
          id={elementId}
          ref={ref}
          value={value}
          onChange={onChange}
        />
      </>
    );
  }
);

TextInputWithLabel.displayName = 'TextInputWithLabel';

export default TextInputWithLabel;
