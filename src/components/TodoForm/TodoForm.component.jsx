import './TodoForm.styles.css';

function TodoForm() {
  return (
    <form className="todo-form">
      <label htmlFor="todoTitle">Todo</label>
      <input id="todoTitle" placeholder="Enter Todo Title" type="text" />
      <button>Add Todo</button>
    </form>
  );
}

export default TodoForm;
