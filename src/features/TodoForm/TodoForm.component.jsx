import { useRef } from 'react';
import styled from 'styled-components';

import TextInputWithLabel from '../../shared/TextInputWithLabel';
import { useTodosContext } from '../../context/TodosContext';

// Styled form container with consistent spacing and theming for form elements
// Includes styles for labels, inputs, textareas, selects, and buttons with focus states
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

// TodoForm component for adding new todo items
//  - onAddTodo = Callback function to handle adding a new todo
// - isSaving = Flag indicating if a save operation is in progress
// - workingTodoTitle = Current value of the todo title input
// - setWorkingTodoTitle Function to update the todo title
// - clearQueryString Function to clear query parameters

function TodoForm() {
  const {
    addTodo,
    isSaving,
    workingTodoTitle,
    setWorkingTodoTitle,
    clearQueryString,
  } = useTodosContext();
  // Ref to maintain focus on the input after adding a todo
  const todoTitleInput = useRef(null);

  // Handle form submission - adds the todo and resets the form
  const handleAddTodo = event => {
    event.preventDefault();
    addTodo(workingTodoTitle);
    setWorkingTodoTitle('');
    todoTitleInput.current.focus();
  };

  // Update the todo title and clear any query parameters
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
