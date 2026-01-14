import './TodosViewForm.styles.css';

function TodosViewForm({
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
}) {
  const preventRefresh = e => e.preventDefault();
  return (
    <form className="todos-view-form" onSubmit={preventRefresh}>
      <div className="form-controls">
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
    </form>
  );
}

export default TodosViewForm;
