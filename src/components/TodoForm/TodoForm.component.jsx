import { useRef } from 'react';
import './TodoForm.styles.css';

function TodoForm({ onAddTodo }) {
  const todoTitleInput = useRef(null);
  const handleAddTodo = event => {
    event.preventDefault();
    const title = event.target.title.value;
    onAddTodo(title);
    event.target.title.value = '';
    todoTitleInput.current.focus();
  };
  return (
    <form className="todo-form" onSubmit={handleAddTodo}>
      <label htmlFor="todoTitle">Todo</label>
      <input
        name="title"
        id="todoTitle"
        placeholder="Enter Todo Title"
        type="text"
        ref={todoTitleInput}
      />
      <button>Add Todo</button>
    </form>
  );
}

export default TodoForm;
