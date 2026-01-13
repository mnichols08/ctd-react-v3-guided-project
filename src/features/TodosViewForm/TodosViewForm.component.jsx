import './TodosViewForm.styles.css';

function TodosViewForm() {
  return (
    <form>
      <div className="form-controls">
        <label htmlFor="sort-by">Sort By</label>
        <select name="sort-by" id="sort-by">
          <option value="Title">Title</option>
          <option value="createdTime">Time Created</option>
        </select>
        <label htmlFor="direction">Direction</label>
        <select name="direction" id="direction">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </form>
  );
}

export default TodosViewForm;
