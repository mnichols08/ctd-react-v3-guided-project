import './TodosViewForm.styles.css';

function TodosViewForm({
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
}) {
  return (
    <form className="todos-view-form">
      <div className="form-controls">
        <label htmlFor="sort-by">Sort By</label>
        <select
          name="sort-by"
          id="sort-by"
          onChange={e => setSortField(e.target.name)}
          value={sortField}
        >
          <option value="Title">Title</option>
          <option value="createdTime">Time Created</option>
        </select>

        <span className="divider" aria-hidden="true" />

        <label htmlFor="direction">Direction</label>
        <select
          name="direction"
          id="direction"
          onChange={e => setSortDirection(e.target.name)}
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
