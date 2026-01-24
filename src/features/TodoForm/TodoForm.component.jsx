import { useRef } from 'react';
import styled from 'styled-components';

import TextInputWithLabel from '../../shared/TextInputWithLabel';

const StyledTodoForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;

  label {
    font-weight: 600;
  }

  input[type='text'],
  textarea,
  select {
    background-color: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    font-size: 1rem;

    &:focus {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
  }

  button,
  input[type='submit'],
  input[type='button'] {
    background-color: var(--accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.65rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.65rem 1rem;

    &:disabled {
      font-style: italic;
    }

    &:hover {
      opacity: 0.9;
    }

    &:focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

function TodoForm({
  onAddTodo,
  isSaving,
  workingTodoTitle,
  setWorkingTodoTitle,
  clearQueryString,
}) {
  const todoTitleInput = useRef(null);
  const handleAddTodo = event => {
    event.preventDefault();
    onAddTodo(workingTodoTitle);
    setWorkingTodoTitle('');
    todoTitleInput.current.focus();
  };
  const handleChangeQueryString = val => {
    clearQueryString();
    setWorkingTodoTitle(val);
  };
  return (
    <StyledTodoForm onSubmit={handleAddTodo}>
      <TextInputWithLabel
        ref={todoTitleInput}
        value={workingTodoTitle}
        onChange={e => handleChangeQueryString(e.target.value)}
        elementId="id"
        labelText="Todo"
      />
      <button disabled={workingTodoTitle.length < 1 || isSaving ? true : false}>
        {isSaving ? `Saving...` : `Add Todo`}
      </button>
    </StyledTodoForm>
  );
}

export default TodoForm;
