import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { useTodosContext } from '../../context/TodosContext';

// Styled form container with themed controls for search and sort functionality
// Includes focus states, dividers, and responsive layout
const StyledTodosViewForm = styled.form`
  margin-bottom: 1.5rem;

  .form-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);

    transition: border-color 0.15s ease;

    &:focus-within {
      border-color: var(--accent);
    }
  }

  .search-controls,
  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    font-size: 0.9rem;
  }

  input[type='text'],
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

  input[type='button'],
  button {
    background-color: var(--accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.65rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }

    &:focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
  }

  .divider {
    width: 1px;
    height: 2rem;
    background: var(--border);
    margin: 0 0.25rem;
  }
`;

//  - TodosViewForm component for searching and sorting todos
//  - sortField = Current field to sort by ('title' or 'createdTime')
//  - setSortField = Function to update the sort field
//  - sortDirection = Current sort direction ('asc' or 'desc')
//  - setSortDirection = Function to update the sort direction
//  - queryString = Current search query string
//  - setQueryString = Function to update the search query
function TodosViewForm() {
  const {
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    queryString,
    setQueryString,
    clearQueryString,
  } = useTodosContext();
  // Local state for search input to enable debouncing
  const [localQueryString, setLocalQueryString] = useState(queryString);

  // Prevent form submission from refreshing the page
  const preventRefresh = e => e.preventDefault();

  // Debounce the search query updates to avoid excessive filtering
  // Only updates the parent queryString after 500ms of no typing
  useEffect(() => {
    const debounce = setTimeout(() => {
      setQueryString(localQueryString);
    }, 500);
    // Cleanup timeout if user types again before 500ms
    return () => clearTimeout(debounce);
  }, [localQueryString, setQueryString]);

  useEffect(() => {
    setLocalQueryString(queryString);
  }, [queryString]);
  return (
    <StyledTodosViewForm onSubmit={preventRefresh}>
      <hr />

      <div className="form-controls">
        {/* Search input with debounced query updates */}
        <div className="search-controls">
          <label htmlFor="search-control">Search Todos:</label>
          <input
            id="search-control"
            type="text"
            value={localQueryString}
            onChange={e => setLocalQueryString(e.target.value)}
          />
          <input
            type="button"
            onClick={() => {
              setLocalQueryString('');
              clearQueryString();
            }}
            value="Clear"
          />
        </div>
        {/* Sort controls for field and direction */}
        <div className="sort-controls">
          <label htmlFor="sort-by">Sort By</label>
          <select
            name="sort-by"
            id="sort-by"
            onChange={e => setSortField(e.target.value)}
            value={sortField}
          >
            <option value="title">Title</option>
            <option value="createdTime">Time Created</option>
          </select>

          <span className="divider" aria-hidden="true" />

          <label htmlFor="sort-direction">Direction</label>
          <select
            name="sort-direction"
            id="sort-direction"
            onChange={e => setSortDirection(e.target.value)}
            value={sortDirection}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </StyledTodosViewForm>
  );
}

export default TodosViewForm;
