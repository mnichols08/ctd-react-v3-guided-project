import { useEffect, useState } from 'react';
import styled from 'styled-components';

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
function TodosViewForm({
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  queryString,
  setQueryString,
}) {
  const [localQueryString, setLocalQueryString] = useState(queryString);

  const preventRefresh = e => e.preventDefault();

  useEffect(() => {
    const debounce = setTimeout(() => {
      setQueryString(localQueryString);
    }, 500);
    return () => clearTimeout(debounce);
  }, [localQueryString, setQueryString]);
  return (
    <StyledTodosViewForm onSubmit={preventRefresh}>
      <hr />

      <div className="form-controls">
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
            onClick={() => setLocalQueryString('')}
            value="Clear"
          />
        </div>
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
