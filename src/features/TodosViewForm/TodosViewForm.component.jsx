import { useEffect, useState } from 'react';

import './TodosViewForm.styles.css';

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
    <form className="todos-view-form" onSubmit={preventRefresh}>
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
    </form>
  );
}

export default TodosViewForm;
